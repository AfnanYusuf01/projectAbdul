import React from 'react';

interface MobileNumericKeyboardProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit?: () => void;
}

export const MobileNumericKeyboard: React.FC<MobileNumericKeyboardProps> = ({
  onDigit,
  onBackspace,
  onSubmit
}) => {
  const keyBaseStyle: React.CSSProperties = {
    height: '46px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.22)',
    fontSize: '1.28rem',
    fontWeight: 500,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none'
  };

  const sideKeyStyle: React.CSSProperties = {
    ...keyBaseStyle,
    backgroundColor: '#e4e7ec',
    fontSize: '1.15rem',
    color: '#334155'
  };

  return (
    <div style={{ width: '100%', flexShrink: 0, userSelect: 'none' }}>
      {/* Top Toolbar Strip (Image #2) */}
      <div style={{
        height: '38px',
        backgroundColor: '#f1f3f4',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        {/* Left 4-Square Grid Icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>

        {/* Right Mic & Search Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* 4x4 Numeric Grid Tray (Image #2) */}
      <div style={{
        backgroundColor: '#d2d6dc',
        padding: '6px 6px 14px 6px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 0.85fr',
        gap: '6px'
      }}>
        {/* Row 1 */}
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('1')}>1</button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('2')}>2</button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('3')}>3</button>
        <button type="button" style={sideKeyStyle} onClick={() => {}}>−</button>

        {/* Row 2 */}
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('4')}>4</button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('5')}>5</button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('6')}>6</button>
        <button type="button" style={sideKeyStyle} onClick={() => {}}>,</button>

        {/* Row 3 */}
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('7')}>7</button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('8')}>8</button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('9')}>9</button>
        <button type="button" style={sideKeyStyle} onClick={onBackspace} title="Hapus">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>

        {/* Row 4 */}
        <button type="button" style={keyBaseStyle} onClick={() => {}}>. </button>
        <button type="button" style={keyBaseStyle} onClick={() => onDigit('0')}>0</button>
        <button type="button" style={keyBaseStyle} onClick={() => {}}>
          <span style={{ fontSize: '0.95rem', color: '#475569' }}>␣</span>
        </button>
        <button
          type="button"
          style={sideKeyStyle}
          onClick={() => onSubmit?.()}
          title="Selesai"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
