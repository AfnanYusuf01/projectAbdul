import React, { useState } from 'react';

interface TransactionsProps {
  transactions: any[];
  onDecrypt: (id: number) => Promise<string>;
  role: string;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDecrypt, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [loadingDecrypt, setLoadingDecrypt] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const filteredTxs = transactions.filter(
    (tx) =>
      tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDecryptModal = async (tx: any) => {
    setSelectedTx(tx);
    setDecryptedText(null);
    setDecryptError(null);
    setLoadingDecrypt(true);
    try {
      const plaintext = await onDecrypt(tx.id);
      setDecryptedText(plaintext);
    } catch (err: any) {
      setDecryptError(err.message || 'Gagal mendekripsi payload transaksi.');
    } finally {
      setLoadingDecrypt(false);
    }
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Daftar Transaksi Masuk</h2>
          <p className="view-header-desc">
            Pemantauan transaksi pembayaran elektronik real-time dengan enkripsi end-to-end (AES-256 + RSA-2048).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-info" style={{ padding: '6px 14px' }}>
            Total Transaksi: {transactions.length}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-title">
          <span>Semua Transaksi Masuk</span>
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari ID / Nasabah / Channel..."
              className="form-control"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>ID Transaksi</th>
                <th>Pelanggan</th>
                <th>Nominal</th>
                <th>Channel</th>
                <th>Payload Terenkripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map((tx) => (
                <tr key={tx.id}>
                  <td className="mono-text" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {new Date(tx.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="mono-text">
                    <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                      #{tx.transaction_id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.customer_id}</div>
                  </td>
                  <td className="mono-text" style={{ fontWeight: 600 }}>
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {tx.channel}
                    </span>
                  </td>
                  <td className="mono-text" style={{ fontSize: '0.75rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {tx.encrypted_payload}
                  </td>
                  <td>
                    <span className={`badge ${tx.status === 'SUCCESS' ? 'badge-success' : tx.status === 'SUSPICIOUS' ? 'badge-danger' : 'badge-warning'}`}>
                      ● {tx.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleOpenDecryptModal(tx)}
                      disabled={role !== 'FraudAnalyst'}
                      title={role !== 'FraudAnalyst' ? "Hanya FraudAnalyst yang memiliki akses dekripsi" : "Dekripsi Payload"}
                    >
                      {role !== 'FraudAnalyst' ? '🔒 Terkunci' : '🔓 Dekripsi'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada data transaksi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decrypt Detail Modal */}
      {selectedTx && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Investigasi Payload: #{selectedTx.transaction_id}</h3>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem' }}
                onClick={() => setSelectedTx(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="form-label">Kunci Sesi Terenkripsi RSA (Encrypted Session Key)</span>
                <div className="terminal-box" style={{ maxHeight: '70px', color: '#fb923c' }}>
                  {selectedTx.encrypted_session_key}
                </div>
              </div>
              
              <div>
                <span className="form-label">Ciphertext Terenkripsi AES-256-GCM (Database Raw)</span>
                <div className="terminal-box" style={{ maxHeight: '70px', color: 'var(--text-secondary)' }}>
                  {selectedTx.encrypted_payload}
                </div>
              </div>

              <div>
                <span className="form-label">Hasil Dekripsi Kunci Privat RSA & Session Key (Plaintext)</span>
                {loadingDecrypt ? (
                  <div className="terminal-box" style={{ color: '#38bdf8', textAlign: 'center', padding: '20px' }}>
                    Sedang mendekripsi payload menggunakan modul Kriptografi Hibrida (RSA + AES)...
                  </div>
                ) : decryptError ? (
                  <div className="terminal-box" style={{ color: '#ef4444' }}>
                    Error: {decryptError}
                  </div>
                ) : (
                  <div className="terminal-box" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    {decryptedText}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--accent-orange-bg)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                💡 <strong>Catatan Kepatuhan Audit</strong>: Aksi dekripsi payload ini dicatat secara otomatis ke dalam <strong>Audit Logs</strong> untuk transparansi hak akses pembukaan data sensitif nasabah.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedTx(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
