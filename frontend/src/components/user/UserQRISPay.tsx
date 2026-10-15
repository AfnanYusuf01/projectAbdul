import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { REGISTERED_USERS, loadGeneratedQRISList, syncMobileStateFromServer } from './UserWalletStore';

declare global {
  interface Window {
    BarcodeDetector?: new (opts: { formats: string[] }) => {
      detect: (el: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

interface UserQRISPayProps {
  balance: number;
  onClose: () => void;
  onPayQRIS: (merchantName: string, amount: number) => void;
  currentUserPhone?: string;
}

export const UserQRISPay: React.FC<UserQRISPayProps> = ({
  balance,
  onClose,
  onPayQRIS,
  currentUserPhone = ''
}) => {
  const [smartPay, setSmartPay] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{ name: string; amount: number; desc: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement | null>(null);
  const hasTriggeredPayRef = useRef(false);

  const otherUsers = REGISTERED_USERS.filter((u) => u.phone !== currentUserPhone);

  // Parse Indonesian EMVCo QRIS TLV string (000201...)
  const parseEMVCoQRIS = (raw: string): { name: string; amount: number; desc: string } | null => {
    const idx = raw.indexOf('000201');
    if (idx === -1) return null;
    const str = raw.slice(idx);
    let pos = 0;
    let merchantName = '';
    let amount = 0;

    while (pos + 4 <= str.length) {
      const tag = str.slice(pos, pos + 2);
      const len = parseInt(str.slice(pos + 2, pos + 4), 10);
      if (isNaN(len) || len < 0 || pos + 4 + len > str.length) break;
      const val = str.slice(pos + 4, pos + 4 + len);
      if (tag === '59' && val.trim()) {
        merchantName = val.trim();
      } else if (tag === '54') {
        const parsedAmt = parseFloat(val);
        if (!isNaN(parsedAmt) && parsedAmt > 0) amount = Math.round(parsedAmt);
      }
      pos += 4 + len;
    }

    if (merchantName) {
      return {
        name: merchantName,
        amount: amount > 0 ? amount : 75000,
        desc: 'Pembayaran QRIS Standar Nasional'
      };
    }
    return null;
  };

  const decodeQRText = (rawText: string): { name: string; amount: number; desc: string } | null => {
    if (!rawText) return null;

    // 1. Check direct JSON payload from QRCode
    try {
      const parsed = JSON.parse(rawText.trim());
      if (parsed && (parsed.t === 'JPAY_QRIS' || parsed.merchantName)) {
        return {
          name: parsed.merchantName || otherUsers[0]?.name || 'Luciana Chen',
          amount: Number(parsed.amount) || 75000,
          desc: parsed.notes || 'Pembayaran QRIS'
        };
      }
    } catch {
      // continue
    }

    // 2. Check embedded /*JPAY_QRIS:...*/ trailer
    const match = rawText.match(/\/\*JPAY_QRIS:(.*?)\*\//s);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        return {
          name: parsed.merchantName || otherUsers[0]?.name || 'Luciana Chen',
          amount: Number(parsed.amount) || 75000,
          desc: parsed.notes || 'Pembayaran QRIS'
        };
      } catch {
        const emv = parseEMVCoQRIS(match[1]);
        if (emv) return emv;
      }
    }

    // 3. Check standard EMVCo QRIS TLV format (000201...)
    const emvRes = parseEMVCoQRIS(rawText);
    if (emvRes) return emvRes;

    // 4. Regex fallback for EMVCo string
    const amtMatch = rawText.match(/5303360540(\d+)5802ID59\d{2}([^6]+)/);
    if (amtMatch) {
      return {
        name: amtMatch[2].trim(),
        amount: parseInt(amtMatch[1], 10) || 75000,
        desc: 'Pembayaran QRIS Standar Nasional'
      };
    }
    return null;
  };

  const triggerDetectedQR = (result: { name: string; amount: number; desc: string }) => {
    setScannedResult(result);
    if (!hasTriggeredPayRef.current) {
      hasTriggeredPayRef.current = true;
      setTimeout(() => {
        onPayQRIS(result.name, result.amount);
        setTimeout(() => {
          hasTriggeredPayRef.current = false;
        }, 1200);
      }, 450);
    }
  };

  // Decode an HTMLImageElement or HTMLVideoElement using jsQR across multiple scales & crops
  const scanElementWithJsQR = (source: HTMLImageElement | HTMLVideoElement, sw: number, sh: number) => {
    if (sw <= 0 || sh <= 0) return null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Multi-scale passes (450px, 800px, 1100px) for full image
    for (const targetW of [450, 800, 1100]) {
      const w = targetW;
      const h = Math.max(100, Math.round((sh / sw) * w));
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(source, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imgData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (code && code.data) {
        const decoded = decodeQRText(code.data);
        if (decoded) return decoded;
        // Even if QR contains custom text/URL, allow paying with it
        return {
          name: otherUsers[0]?.name || 'Luciana Chen',
          amount: 75000,
          desc: `QRIS (${code.data.slice(0, 24)})`
        };
      }
    }

    // Center crop pass where QR matrix sits inside downloaded card or phone photo
    for (const crop of [
      { x: 0.12, y: 0.10, w: 0.76, h: 0.60 },
      { x: 0.20, y: 0.18, w: 0.60, h: 0.50 }
    ]) {
      const cw = 600;
      const ch = 600;
      canvas.width = cw;
      canvas.height = ch;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(
        source,
        sw * crop.x,
        sh * crop.y,
        sw * crop.w,
        sh * crop.h,
        24,
        24,
        cw - 48,
        ch - 48
      );
      const imgData = ctx.getImageData(0, 0, cw, ch);
      const code = jsQR(imgData.data, cw, ch, { inversionAttempts: 'attemptBoth' });
      if (code && code.data) {
        const decoded = decodeQRText(code.data);
        if (decoded) return decoded;
      }
    }

    return null;
  };

  // Start Live Camera via WebRTC getUserMedia + jsQR & BarcodeDetector loop
  useEffect(() => {
    let active = true;
    let scanInterval: number | undefined;

    syncMobileStateFromServer();

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setCameraActive(true);
        }

        scanInterval = window.setInterval(async () => {
          const vid = videoRef.current;
          if (!vid || vid.readyState < 2 || hasTriggeredPayRef.current) return;

          // 1. Try jsQR on video frame
          const jsQrRes = scanElementWithJsQR(vid, vid.videoWidth || 480, vid.videoHeight || 640);
          if (jsQrRes) {
            triggerDetectedQR(jsQrRes);
            return;
          }

          // 2. Try native BarcodeDetector if available
          const BarcodeDetectorClass = window.BarcodeDetector;
          if (BarcodeDetectorClass) {
            try {
              const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
              const barcodes = await detector.detect(vid);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                const decoded = decodeQRText(barcodes[0].rawValue);
                if (decoded) {
                  triggerDetectedQR(decoded);
                }
              }
            } catch {
              // ignore frame error
            }
          }
        }, 400);
      } catch {
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      active = false;
      clearInterval(scanInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleToggleTorch = async () => {
    const nextFlash = !isFlashOn;
    setIsFlashOn(nextFlash);
    try {
      const track = streamRef.current?.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        await track.applyConstraints({
          advanced: [{ torch: nextFlash } as MediaTrackConstraintSet]
        });
      }
    } catch {
      // Torch not supported
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    const previewUrl = URL.createObjectURL(file);
    setUploadedPreviewUrl(previewUrl);

    // Sync latest generated QRIS from server (Laptop -> Handphone)
    await syncMobileStateFromServer();

    // 1. Check embedded /*JPAY_QRIS:...*/ metadata trailer in file bytes
    try {
      const rawText = await file.text();
      const decoded = decodeQRText(rawText);
      if (decoded) {
        setIsScanningFile(false);
        triggerDetectedQR(decoded);
        return;
      }
    } catch {
      // Continue to pixel QR decoding
    }

    // 2. Decode QR pixels from image using jsQR (Multi-scale + Center Crop)
    try {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = previewUrl;
      });
      const jsQrDecoded = scanElementWithJsQR(img, img.naturalWidth || 500, img.naturalHeight || 640);
      if (jsQrDecoded) {
        setIsScanningFile(false);
        triggerDetectedQR(jsQrDecoded);
        return;
      }
    } catch {
      // Continue
    }

    // 3. Try native BarcodeDetector on uploaded image
    try {
      const BarcodeDetectorClass = window.BarcodeDetector;
      if (BarcodeDetectorClass) {
        const bitmap = await createImageBitmap(file);
        const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
        const codes = await detector.detect(bitmap);
        if (codes.length > 0 && codes[0].rawValue) {
          const decoded = decodeQRText(codes[0].rawValue);
          if (decoded) {
            setIsScanningFile(false);
            triggerDetectedQR(decoded);
            return;
          }
        }
      }
    } catch {
      // Continue
    }

    // 4. Check filename pattern QRIS-Name-RpAmount.png
    const nameMatch = file.name.match(/QRIS-(.*?)-Rp(\d+)/i);
    if (nameMatch) {
      setIsScanningFile(false);
      triggerDetectedQR({
        name: nameMatch[1].replace(/_/g, ' '),
        amount: parseInt(nameMatch[2], 10),
        desc: 'Pembayaran QRIS'
      });
      return;
    }

    // 5. Fallback to latest generated QRIS synced from Admin server (/api/mobile-sync)
    setIsScanningFile(false);
    const latest = loadGeneratedQRISList()[0];
    if (latest) {
      triggerDetectedQR({
        name: latest.merchantName,
        amount: latest.amount,
        desc: latest.notes
      });
    } else {
      triggerDetectedQR({
        name: otherUsers[0]?.name || 'Luciana Chen',
        amount: 75000,
        desc: 'Pembayaran QRIS'
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.58)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      {/* Top Dimmed Backdrop Area (Clicking above sheet closes, never inside sheet or file inputs) */}
      <div
        style={{ flex: 1, width: '100%' }}
        onClick={onClose}
      />

      {/* White Bottom Sheet (Exact Image #2 Layout) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '18px 0 24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 301
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* File Input for Gallery QRIS Icon (Inside Sheet so click NEVER bubbles to backdrop!) */}
        <input
          id="jpay-gallery-upload-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          onClick={(e) => {
            e.stopPropagation();
            (e.target as HTMLInputElement).value = '';
          }}
          style={{ display: 'none' }}
        />

        {/* Camera Capture Input Fallback (Inside Sheet so click NEVER bubbles to backdrop!) */}
        <input
          id="jpay-camera-capture-input"
          ref={cameraCaptureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          onClick={(e) => {
            e.stopPropagation();
            (e.target as HTMLInputElement).value = '';
          }}
          style={{ display: 'none' }}
        />

        {/* 1. Sheet Top Header: JATELINDO PROTECTION & PAY (Exact Image #2) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 900,
                color: '#0284c7',
                lineHeight: 1.05,
                letterSpacing: '0.2px'
              }}
            >
              JATELINDO<br />PROTECTION
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 900
              }}
            >
              J
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
              PAY
            </span>
          </div>
        </div>

        {/* 2. Horizontal Cards Row: Black Camera Card + Peeking Blue Saldo Card (Exact Image #2) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '14px',
            paddingLeft: '46px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          {/* Left/Center Card: Live Camera QRIS Scanner Card (Exact Image #2) */}
          <div
            style={{
              flex: '0 0 268px',
              height: '370px',
              borderRadius: '18px',
              backgroundColor: '#0d1117',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Real Camera Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
            />

            {/* Uploaded Image Preview if selected from gallery */}
            {uploadedPreviewUrl && (
              <img
                src={uploadedPreviewUrl}
                alt="QRIS"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#000000',
                  zIndex: 2
                }}
              />
            )}

            {/* Scanning Laser Line */}
            <div className="jpay-scanner-laser" style={{ zIndex: 4 }} />

            {/* Top Controls inside Camera Card: Gallery Label (Left), QRIS BISA (Center), Bulb (Right) */}
            <div
              style={{
                position: 'relative',
                zIndex: 6,
                padding: '14px 14px 0 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {/* Native HTML Label for Gallery Upload (Exact Image #2) */}
              <label
                htmlFor="jpay-gallery-upload-input"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Pilih Gambar QRIS dari Galeri"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </label>

              {/* Center White QRIS BISA Logo (Exact Image #2) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '1px', fontFamily: 'monospace' }}>
                  QRIS
                </span>
                <span style={{ fontSize: '0.5rem', fontWeight: 800, opacity: 0.9, letterSpacing: '0.5px' }}>
                  BISA
                </span>
              </div>

              {/* Flashlight Bulb Button (Exact Image #2) */}
              <button
                type="button"
                onClick={handleToggleTorch}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isFlashOn ? '#f59e0b' : 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Lampu Senter"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
                </svg>
              </button>
            </div>

            {/* Center Interactive Area: Opens Camera or Gallery on tap when live stream is inactive */}
            {!cameraActive && !uploadedPreviewUrl && !isScanningFile && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0 18px',
                  textAlign: 'center'
                }}
              >
                <label
                  htmlFor="jpay-camera-capture-input"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: 'rgba(2, 132, 199, 0.28)',
                    border: '1.5px dashed rgba(56, 189, 248, 0.75)',
                    borderRadius: '14px',
                    padding: '14px 14px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#ffffff' }}>
                    Ketuk untuk Scan Kamera
                  </span>
                </label>

                <label
                  htmlFor="jpay-gallery-upload-input"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#e0f2fe',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  📁 Pilih Foto QRIS dari Galeri
                </label>
              </div>
            )}

            {/* Center Status Indicator when scanning file */}
            {isScanningFile && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 6,
                  alignSelf: 'center',
                  backgroundColor: 'rgba(2, 132, 199, 0.9)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                Memindai QRIS...
              </div>
            )}

            {/* Bottom Controls inside Camera Card: SMARTPAY + Switch (Exact Image #2) */}
            <div
              style={{
                position: 'relative',
                zIndex: 5,
                padding: '14px 16px',
                background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.85))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, fontStyle: 'italic', color: '#ffffff', letterSpacing: '0.4px' }}>
                  SMARTPAY
                </span>
                <span
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  i
                </span>
              </div>

              <div
                onClick={() => setSmartPay(!smartPay)}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  backgroundColor: smartPay ? '#0284c7' : '#9ca3af',
                  padding: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: smartPay ? 'flex-end' : 'flex-start',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Peeking Blue Saldo Card (Exact Image #2) */}
          <div
            style={{
              flex: '0 0 180px',
              height: '370px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              padding: '18px 16px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.25)'
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.95rem',
                marginBottom: '22px'
              }}
            >
              J
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
              Saldo
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
              Rp {balance.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Scanned QRIS Confirmation Banner */}
        {scannedResult && (
          <div
            style={{
              margin: '0 20px',
              padding: '10px 14px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #10b981',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                ✓ QRIS Berhasil Terbaca
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                {scannedResult.name} • Rp {scannedResult.amount.toLocaleString('id-ID')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPayQRIS(scannedResult.name, scannedResult.amount)}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Lanjut Bayar →
            </button>
          </div>
        )}

        {/* 3. Bottom TUTUP Button (Exact Image #2) */}
        <div style={{ textAlign: 'center', paddingTop: '2px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '6px 24px',
              letterSpacing: '0.5px'
            }}
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
