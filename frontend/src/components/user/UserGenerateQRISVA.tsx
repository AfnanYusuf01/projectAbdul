import React, { useState } from 'react';
import QRCode from 'qrcode';
import type { GeneratedQRIS, GeneratedVA } from './UserTypes';
import { ALL_RECIPIENTS, saveGeneratedQRIS, saveGeneratedVA } from './UserWalletStore';
interface UserGenerateQRISVAProps {
  onBack: () => void;
  onSimulatePayGenerated: (type: 'QRIS' | 'VA', recipient: string, amount: number, channel: string) => void;
  currentUserPhone?: string;
}

export const UserGenerateQRISVA: React.FC<UserGenerateQRISVAProps> = ({
  onBack: _onBack,
  onSimulatePayGenerated: _onSimulatePayGenerated,
  currentUserPhone = ''
}) => {
  const [activeTab, setActiveTab] = useState<'qris' | 'va'>('qris');

  // Filter out the currently logged-in user so user only transfers to OTHER users
  const availableRecipients = ALL_RECIPIENTS.filter((r) => r.phone !== currentUserPhone);

  // Input states
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    () => availableRecipients[0]?.id || 'CUST-304'
  );
  const [amount, setAmount] = useState('75000');
  const [notes, setNotes] = useState('Pembayaran Tagihan Produk #JAT-99');
  const [selectedBank, setSelectedBank] = useState(
    () => availableRecipients[0]?.defaultBank || 'BCA'
  );
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);
  const selectedRecipient = availableRecipients.find((r) => r.id === selectedRecipientId) || availableRecipients[0];
  const targetUser = selectedRecipient.name;
  const [generatedQRIS, setGeneratedQRIS] = useState<GeneratedQRIS | null>(null);
  const [generatedVA, setGeneratedVA] = useState<GeneratedVA | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!targetUser.trim()) {
      alert('Nama penerima / user yang dituju wajib diisi.');
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Nominal transaksi wajib diisi angka yang valid.');
      return;
    }

    if (activeTab === 'qris') {
      const qrId = 'QR-' + Date.now().toString().slice(-6);
      const qrPayload = JSON.stringify({
        t: 'JPAY_QRIS',
        id: qrId,
        merchantName: targetUser,
        recipientPhone: selectedRecipient.phone,
        amount: parsedAmount,
        notes: notes || 'Pembayaran QRIS J-Pay'
      });
      const realQrImg = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrDataUrl(realQrImg);

      const newQR: GeneratedQRIS = {
        id: qrId,
        merchantName: targetUser,
        amount: parsedAmount,
        notes: notes || 'Pembayaran QRIS J-Pay',
        qrPayload,
        createdAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
        expiresAt: '30 Menit'
      };
      saveGeneratedQRIS(newQR);
      setGeneratedQRIS(newQR);
      setGeneratedVA(null);
    } else {
      const bankPrefix = selectedBank === 'SeaBank' ? '8808' : selectedBank === 'BANK MANDIRI' ? '8902' : selectedBank === 'BCA' ? '1098' : '1289';
      const acctSuffix = selectedRecipient.account.padEnd(12, '0').slice(0, 12);
      const fullVA = bankPrefix + acctSuffix;

      const newVA: GeneratedVA = {
        id: 'VA-' + Date.now().toString().slice(-6),
        bankName: selectedBank,
        vaNumber: fullVA,
        targetUser: `${selectedRecipient.name} — ${selectedRecipient.phone}`,
        amount: parsedAmount,
        notes: notes || `Pembayaran VA ${selectedBank}`,
        createdAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
        expiresAt: '24 Jam'
      };
      saveGeneratedVA(newVA);
      setGeneratedVA(newVA);
      setGeneratedQRIS(null);
    }
  };

  const [downloadedSuccess, setDownloadedSuccess] = useState(false);

  const handleCopyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQRISImage = async (qr: GeneratedQRIS) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 640);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 476, 616);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(190, 32, 120, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QRIS', 250, 57);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('STANDAR PEMBAYARAN NASIONAL', 250, 90);

    // Draw REAL scannable QR code onto canvas
    const dataUrl = qrDataUrl || await QRCode.toDataURL(qr.qrPayload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' }
    });

    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
    ctx.drawImage(img, 95, 105, 310, 310);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(qr.merchantName, 250, 455);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`Rp ${qr.amount.toLocaleString('id-ID')}`, 250, 502);

    ctx.fillStyle = '#64748b';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Catatan: ${qr.notes}`, 250, 540);
    ctx.fillText(`ID QRIS: ${qr.id} • PT Jatelindo Pay`, 250, 568);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const metaTrailer = `\n/*JPAY_QRIS:${qr.qrPayload}*/`;
      const finalBlob = new Blob([blob, metaTrailer], { type: 'image/png' });
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS-${qr.merchantName.replace(/\s+/g, '_')}-Rp${qr.amount}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      setDownloadedSuccess(true);
      setTimeout(() => setDownloadedSuccess(false), 3000);
    }, 'image/png');
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {/* 1. Header Bar */}
      <div className="jpay-screen-header" style={{ justifyContent: 'center' }}>
        <span className="jpay-screen-title">Generator QRIS & Virtual Account</span>
      </div>

      {/* 2. Tab Switcher (QRIS vs VA) */}
      <div style={{
        display: 'flex',
        padding: '10px 16px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid var(--jpay-border)',
        gap: '8px'
      }}>
        <button
          type="button"
          onClick={() => { setActiveTab('qris'); setGeneratedQRIS(null); setGeneratedVA(null); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '12px',
            border: activeTab === 'qris' ? '1.5px solid var(--jpay-primary)' : '1px solid var(--jpay-border)',
            backgroundColor: activeTab === 'qris' ? '#e0f2fe' : '#ffffff',
            color: activeTab === 'qris' ? 'var(--jpay-primary)' : 'var(--jpay-text-muted)',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Generate QRIS
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('va'); setGeneratedQRIS(null); setGeneratedVA(null); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '12px',
            border: activeTab === 'va' ? '1.5px solid var(--jpay-primary)' : '1px solid var(--jpay-border)',
            backgroundColor: activeTab === 'va' ? '#e0f2fe' : '#ffffff',
            color: activeTab === 'va' ? 'var(--jpay-primary)' : 'var(--jpay-text-muted)',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Generate Virtual Account
        </button>
      </div>

      {/* 3. Form & Output Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Form Inputs */}
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Custom UI Dropdown Penerima Terdaftar (Rapi & Tidak Melebar Keluar Layar) */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '6px', display: 'block' }}>
              Pilih Nasabah Penerima Tujuan <span style={{ color: '#ef4444' }}>*</span>
            </label>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsRecipientOpen((prev) => !prev)}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                border: isRecipientOpen ? '2px solid var(--jpay-primary)' : '1.5px solid var(--jpay-border)',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <img
                  src={selectedRecipient.avatarUrl}
                  alt={selectedRecipient.name}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #bae6fd', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--jpay-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{selectedRecipient.name}</span>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '6px' }}>
                      {selectedRecipient.id}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)', marginTop: '2px' }}>
                    {selectedRecipient.phone} • {selectedRecipient.defaultBank}
                  </div>
                </div>
              </div>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: isRecipientOpen ? '#e0f2fe' : '#f1f5f9',
                color: isRecipientOpen ? 'var(--jpay-primary)' : 'var(--jpay-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {isRecipientOpen ? '▴' : '▾'}
              </div>
            </button>

            {/* Custom Dropdown Menu List (Inside Mobile Frame) */}
            {isRecipientOpen && (
              <div style={{
                marginTop: '6px',
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '14px',
                boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.15)',
                overflow: 'hidden',
                zIndex: 50
              }}>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  Daftar Nasabah J-Pay Terdaftar ({availableRecipients.length} User)
                </div>
                {availableRecipients.map((r) => {
                  const isSelected = r.id === selectedRecipient.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRecipientId(r.id);
                        setSelectedBank(r.defaultBank);
                        setGeneratedQRIS(null);
                        setGeneratedVA(null);
                        setIsRecipientOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <img
                          src={r.avatarUrl}
                          alt={r.name}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#0284c7' : 'var(--jpay-text-main)' }}>
                            {r.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--jpay-text-muted)' }}>
                            {r.phone} • Rek: {r.account}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569',
                          padding: '2px 6px',
                          borderRadius: '6px'
                        }}>
                          {r.defaultBank}
                        </span>
                        {isSelected && (
                          <span style={{ color: '#0284c7', fontWeight: 900, fontSize: '0.9rem' }}>✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Nominal Pembayaran (Wajib) */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '4px', display: 'block' }}>
              Nominal Transaksi (Rp) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1.5px solid var(--jpay-border)',
              borderRadius: '12px',
              padding: '8px 14px',
              gap: '8px'
            }}>
              <span style={{ fontWeight: 800, color: 'var(--jpay-text-muted)', fontSize: '0.9rem' }}>Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--jpay-text-main)',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          {/* Bank Choice Pills (Khusus Virtual Account) */}
          {activeTab === 'va' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '6px', display: 'block' }}>
                Pilih Bank Virtual Account
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'BANK MANDIRI', label: 'Bank Mandiri (8902)' },
                  { id: 'BCA', label: 'BCA VA (1098)' },
                  { id: 'BRI', label: 'BRI VA (1289)' },
                  { id: 'SeaBank', label: 'SeaBank VA (8808)' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBank(b.id);
                      setGeneratedVA(null);
                    }}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '10px',
                      border: selectedBank === b.id ? '1.5px solid var(--jpay-primary)' : '1px solid var(--jpay-border)',
                      backgroundColor: selectedBank === b.id ? '#e0f2fe' : '#f8fafc',
                      color: selectedBank === b.id ? 'var(--jpay-primary)' : 'var(--jpay-text-main)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catatan / Keterangan */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '4px', display: 'block' }}>
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan tagihan atau pesanan"
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                border: '1.5px solid var(--jpay-border)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: 'var(--jpay-text-main)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: 'var(--jpay-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
            }}
          >
            {activeTab === 'qris' ? '⚡ Buat QRIS Dinamis' : '💳 Buat Nomor Virtual Account'}
          </button>
        </form>

        {/* 4. TAMPILAN HASIL GENERATE */}
        {generatedQRIS && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed var(--jpay-primary)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.25s ease'
          }}>
            {/* Header QRIS Resmi */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1rem',
                padding: '2px 14px',
                borderRadius: '6px',
                display: 'inline-block',
                letterSpacing: '1px'
              }}>
                QRIS
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--jpay-text-muted)', fontWeight: 600, marginTop: '2px' }}>
                STANDAR PEMBAYARAN NASIONAL
              </div>
            </div>

            {/* Real Scannable QR Code Matrix */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '12px',
              borderRadius: '16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              border: '1px solid var(--jpay-border)'
            }}>
              <img
                src={qrDataUrl}
                alt="QRIS Code"
                style={{ width: '210px', height: '210px', display: 'block' }}
              />
            </div>

            {/* Target & Amount Information */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--jpay-text-main)' }}>
                {generatedQRIS.merchantName}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--jpay-primary)', margin: '4px 0' }}>
                Rp {generatedQRIS.amount.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)' }}>
                Catatan: {generatedQRIS.notes} • Berlaku {generatedQRIS.expiresAt}
              </div>
            </div>

            {/* Download QRIS Image Button */}
            <button
              type="button"
              onClick={() => handleDownloadQRISImage(generatedQRIS)}
              style={{
                width: '100%',
                backgroundColor: downloadedSuccess ? '#10b981' : 'var(--jpay-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              <span>{downloadedSuccess ? '✓ Gambar QRIS Berhasil Diunduh (.PNG)!' : '📥 Download Gambar QRIS (.PNG)'}</span>
            </button>

            <div style={{
              width: '100%',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '0.7rem',
              color: '#0369a1',
              lineHeight: 1.4,
              textAlign: 'center',
              boxSizing: 'border-box'
            }}>
              💡 <strong>Cara Membayar:</strong> Unduh gambar QRIS di atas, lalu buka aplikasi user (<strong>/demo-mobile/home</strong>), klik tombol <strong>Scan / PAY</strong>, dan pilih gambar QRIS tersebut dari galeri.
            </div>
          </div>
        )}

        {generatedVA && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed #0284c7',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'fadeIn 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
                Virtual Account Dibuat
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: '#e0f2fe',
                color: 'var(--jpay-primary)',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {generatedVA.bankName}
              </span>
            </div>

            {/* VA Number Display with Copy */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--jpay-border)',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--jpay-text-muted)', fontWeight: 600 }}>Nomor Rekening VA</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1px', fontFamily: 'monospace', color: 'var(--jpay-text-main)' }}>
                  {generatedVA.vaNumber}
                </div>
              </div>
              <button
                onClick={() => handleCopyText(generatedVA.vaNumber)}
                style={{
                  backgroundColor: copied ? '#10b981' : '#f1f5f9',
                  color: copied ? '#ffffff' : 'var(--jpay-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>

            {/* Summary Details */}
            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--jpay-text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Penerima / User Tujuan:</span>
                <strong style={{ color: 'var(--jpay-text-main)' }}>{generatedVA.targetUser}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Tagihan VA:</span>
                <strong style={{ color: 'var(--jpay-primary)', fontSize: '0.95rem' }}>Rp {generatedVA.amount.toLocaleString('id-ID')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Batas Waktu Bayar:</span>
                <span style={{ color: '#ea580c', fontWeight: 700 }}>24 Jam</span>
              </div>
            </div>

            {/* Copy VA Number Action Button */}
            <button
              type="button"
              onClick={() => handleCopyText(generatedVA.vaNumber)}
              style={{
                width: '100%',
                backgroundColor: copied ? '#10b981' : 'var(--jpay-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              {copied ? '✓ Nomor Virtual Account Tersalin!' : '📋 Salin Nomor Virtual Account'}
            </button>

            <div style={{
              width: '100%',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '0.7rem',
              color: '#0369a1',
              lineHeight: 1.4,
              textAlign: 'center',
              boxSizing: 'border-box'
            }}>
              💡 <strong>Cara Membayar:</strong> Salin nomor VA di atas, lalu buka aplikasi user (<strong>/demo-mobile/home</strong>), pilih menu <strong>Send → Ke Virtual Account (VA)</strong>, dan tempelkan nomor VA tersebut.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
