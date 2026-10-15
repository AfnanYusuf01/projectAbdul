import React, { useState, useEffect, useRef } from 'react';
import type { EncryptResult, DecryptPayload } from '../types';
import { DemoInfrastructureStage } from './DemoInfrastructureStage';
import { DemoCryptoInspector } from './DemoCryptoInspector';
import { ShieldIcon, LockIcon } from './Icons';
import './DemoHybrid.css';

interface DemoHybridProps {
  onEncrypt: (plaintext: string) => Promise<EncryptResult>;
  onDecrypt: (data: DecryptPayload) => Promise<string>;
}

export const DemoHybrid: React.FC<DemoHybridProps> = ({ onEncrypt, onDecrypt }) => {
  // Stepper & Simulation States (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isLoopMode, setIsLoopMode] = useState<boolean>(false);

  // Transaction Data Input (Realistic Corporate Data from Image 1)
  const [transactionData] = useState({
    txId: 'TRX-20261003-001',
    customerId: 'CUST-PLN-889',
    amount: 350000,
    channel: 'QRIS',
    time: '03 Okt 2026, 23:20'
  });

  const [plaintext, setPlaintext] = useState<string>('');
  const [cryptoResult, setCryptoResult] = useState<EncryptResult | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [_error, setError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Synchronize formatted JSON plaintext from transaction data
  useEffect(() => {
    const payloadObj = {
      customer_id: transactionData.customerId,
      amount: transactionData.amount,
      channel: transactionData.channel,
      timestamp: "2026-10-03T23:20:16.357Z",
      merchant_id: "MERCH-001",
      description: "Pembayaran QRIS"
    };
    setPlaintext(JSON.stringify(payloadObj, null, 2));
  }, [transactionData]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  // Stepper Transition Engine driven by isPlaying, isPaused, and speed
  useEffect(() => {
    if (!isPlaying || isPaused) {
      clearTimeout(timerRef.current);
      return;
    }

    const stepDelay = Math.round(4200 / speed);

    if (currentStep === 1) {
      timerRef.current = setTimeout(async () => {
        // Step 1 -> Step 2: Encrypt Payload with AES-256-GCM
        try {
          const res = await onEncrypt(plaintext);
          setCryptoResult(res);
          setCurrentStep(2);
        } catch {
          setError('Enkripsi AES gagal.');
          setIsPlaying(false);
        }
      }, stepDelay);
    } else if (currentStep === 2) {
      timerRef.current = setTimeout(() => {
        // Step 2 -> Step 3: RSA Session Key Wrapping
        setCurrentStep(3);
      }, stepDelay);
    } else if (currentStep === 3) {
      timerRef.current = setTimeout(() => {
        // Step 3 -> Step 4: Network Packet Transmission
        setCurrentStep(4);
      }, stepDelay);
    } else if (currentStep === 4) {
      timerRef.current = setTimeout(async () => {
        // Step 4 -> Step 5: Receiver Decryption & GCM Authentication Tag Verification
        if (cryptoResult) {
          try {
            const dec = await onDecrypt(cryptoResult);
            setDecryptedData(dec);
            setCurrentStep(5);
          } catch {
            setError('Dekripsi gagal.');
            setIsPlaying(false);
          }
        } else {
          setCurrentStep(5);
        }
      }, stepDelay);
    } else if (currentStep === 5) {
      if (isLoopMode) {
        timerRef.current = setTimeout(() => {
          handleResetSimulation();
          handleStartSimulation();
        }, 3000);
      } else {
        setIsPlaying(false);
      }
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying, isPaused, speed, isLoopMode, plaintext, cryptoResult]);

  // Simulation Controls Handlers
  const handleStartSimulation = async () => {
    setError(null);
    setCurrentStep(1);
    setIsPaused(false);
    setIsPlaying(true);
  };

  const handlePauseSimulation = () => {
    setIsPaused(true);
  };

  const handleResumeSimulation = () => {
    setIsPaused(false);
    setIsPlaying(true);
  };

  const handleResetSimulation = () => {
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(1);
    setCryptoResult(null);
    setDecryptedData(null);
    setError(null);
  };

  // Step names matching reference Image 1 exactly
  const stepsConfig = [
    { num: 1, title: '1. Data Asli', sub: 'Payload transaksi disiapkan' },
    { num: 2, title: '2. Enkripsi AES', sub: 'Data dienkripsi dengan AES-256-GCM' },
    { num: 3, title: '3. Enkripsi Kunci RSA', sub: 'Kunci sesi AES dienkripsi dengan RSA-2048' },
    { num: 4, title: '4. Transfer Paket', sub: 'Data dikirim melalui jaringan' },
    { num: 5, title: '5. Dekripsi & Verifikasi', sub: 'Penerima membuka kunci & verifikasi' }
  ];

  return (
    <div className="view-container animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* ============================================================ */}
      {/* PAGE HEADER (MATCHING REFERENCE IMAGE 1)                     */}
      {/* ============================================================ */}
      <div className="jt-header-row" style={{ marginBottom: '16px' }}>
        <div className="jt-header-title-box">
          <div className="jt-header-icon" style={{ backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}>
            <ShieldIcon size={22} />
          </div>
          <div>
            <h1 className="jt-header-title" style={{ fontSize: '1.35rem' }}>
              Demo Interaktif Transfer Kriptografi Hibrida (AES + RSA)
            </h1>
            <p className="jt-header-subtitle">
              Visualisasi transaksi pembayaran dengan kombinasi enkripsi AES-256-GCM dan RSA-2048, melibatkan server pengirim, jaringan aman, dan server penerima.
            </p>
          </div>
        </div>

        <div className="jt-header-actions">
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '7px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LockIcon size={14} />
            <span>AES-256-GCM + RSA-2048</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5-STEP HORIZONTAL STEPPER BAR (MATCHING REFERENCE IMAGE 1)   */}
      {/* ============================================================ */}
      <div className="demo-stepper-container">
        <div className="demo-stepper-list">
          {stepsConfig.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isActive = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div 
                  className={`stepper-step-card ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}
                  onClick={() => {
                    if (!isPlaying) setCurrentStep(s.num);
                  }}
                >
                  <div className="stepper-circle">
                    {isCompleted ? '✓' : s.num}
                  </div>
                  <div className="stepper-content">
                    <span className="stepper-title">{s.title}</span>
                    <span className="stepper-desc">{s.sub}</span>
                  </div>
                </div>

                {idx < stepsConfig.length - 1 && (
                  <div className={`stepper-arrow-sep ${currentStep > s.num ? 'active' : ''}`}>
                    ›
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN VISUALIZATION: 5-ENTITY TRANSACTION INFRASTRUCTURE      */}
      {/* ============================================================ */}
      <DemoInfrastructureStage 
        currentStep={currentStep}
        transactionData={transactionData}
        cryptoResult={cryptoResult}
        decryptedData={decryptedData}
        isPlaying={isPlaying}
        speed={speed}
      />

      {/* ============================================================ */}
      {/* SIMULATION CONTROLS BAR (MATCHING REFERENCE IMAGE 1)         */}
      {/* ============================================================ */}
      <div className="demo-controls-card">
        <div className="controls-left-group">
          {/* Start Button */}
          {!isPlaying || isPaused ? (
            <button 
              className="btn btn-primary"
              onClick={isPaused ? handleResumeSimulation : handleStartSimulation}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.82rem' }}
            >
              <span>▶</span>
              <span>{isPaused ? 'Lanjutkan' : 'Mulai Simulasi'}</span>
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={handlePauseSimulation}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <span>⏸</span>
              <span>Jeda</span>
            </button>
          )}

          {/* Reset Button */}
          <button 
            className="btn btn-secondary"
            onClick={handleResetSimulation}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <span>↺</span>
            <span>Ulangi</span>
          </button>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Kecepatan:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="pagination-select"
              style={{ padding: '4px 8px' }}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Loop Mode Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Loop</span>
            <div className="switch" style={{ width: '38px', height: '20px' }}>
              <input
                type="checkbox"
                checked={isLoopMode}
                onChange={(e) => setIsLoopMode(e.target.checked)}
              />
              <span className="slider" style={{ borderRadius: '20px' }}></span>
            </div>
          </label>
        </div>

        {/* Progress Bar (Right Group) */}
        <div className="controls-right-progress">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Progress Simulasi</span>
            <strong style={{ color: '#2563eb' }}>{currentStep}/5</strong>
          </div>
          <div className="demo-progress-track">
            <div 
              className="demo-progress-fill" 
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM SECTION: CRYPTOGRAPHY INSPECTOR & LIVE ACTIVITY LOG   */}
      {/* ============================================================ */}
      <DemoCryptoInspector
        currentStep={currentStep}
        plaintext={plaintext}
        cryptoResult={cryptoResult}
        decryptedData={decryptedData}
        transactionData={transactionData}
      />
    </div>
  );
};
