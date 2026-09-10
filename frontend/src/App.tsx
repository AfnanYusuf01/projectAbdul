import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { FraudDetection } from './components/FraudDetection';
import { FraudAlerts } from './components/FraudAlerts';
import { EncryptionSecurity } from './components/EncryptionSecurity';
import { AuditLogs } from './components/AuditLogs';
import { Performance } from './components/Performance';
import { Login } from './components/Login';
import { DemoHybrid } from './components/DemoHybrid';
import { CustomerMobile } from './components/CustomerMobile';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import './components/WillowViews.css';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000' 
  : '';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth States
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(sessionStorage.getItem('role'));

  // Application Data States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    cpu_usage: 5.4,
    memory_usage: 42.1,
    active_connections: 15,
    avg_encryption_time_ms: 0.45,
    avg_decryption_time_ms: 0.85,
    total_transactions_processed: 0,
    throughput_tps: 0.0
  });

  // Local state fallbacks (Offline Mock Database)
  const [mockTransactions, setMockTransactions] = useState<any[]>([]);
  const [mockRules, setMockRules] = useState<any[]>([
    {
      id: 1,
      name: "Batas Nominal Maksimum",
      parameter: "amount",
      operator: ">",
      threshold: "10000000",
      severity: "HIGH",
      is_active: true,
      description: "Menandai transaksi tunggal yang nominalnya melebihi Rp 10.000.000."
    },
    {
      id: 2,
      name: "Transaksi Jam Pemeliharaan",
      parameter: "hour",
      operator: "in_range",
      threshold: "2-4",
      severity: "MEDIUM",
      is_active: true,
      description: "Menandai transaksi bernilai sedang/tinggi yang dilakukan pada jam pemeliharaan (02.00-04.00 WIB)."
    },
    {
      id: 3,
      name: "Velocity Limit (Frekuensi)",
      parameter: "velocity",
      operator: ">",
      threshold: "5",
      severity: "HIGH",
      is_active: true,
      description: "Mendeteksi serangan spam jika pelanggan melakukan > 5 transaksi dalam kurun waktu 1 menit."
    }
  ]);
  const [mockAlerts, setMockAlerts] = useState<any[]>([]);
  const [mockLogs, setMockLogs] = useState<any[]>([
    { id: 1, timestamp: new Date(Date.now() - 360000).toISOString(), user: 'System', action: 'STARTUP', source_ip: '127.0.0.1', status: 'SUCCESS', details: 'Sistem keamanan transaksi Jatelindo diaktifkan.' }
  ]);


  // API Connectivity Check and Data Synchronization Poller
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ping health check endpoint and ensure response is valid JSON from FastAPI
        const healthRes = await fetch(`${API_BASE}/api/health`).catch(() => null);
        if (healthRes && healthRes.ok) {
          const contentType = healthRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const healthData = await healthRes.json().catch(() => null);
            if (healthData && healthData.status === 'ok') {
              setIsBackendOnline(true);

              if (token) {
                const headers = { 'Authorization': `Bearer ${token}` };
                // Fetch real data from server
                const [txsRes, rlsRes, alrtsRes, logsRes, mtrcsRes] = await Promise.all([
                  fetch(`${API_BASE}/api/transactions`, { headers }).catch(() => null),
                  fetch(`${API_BASE}/api/rules`, { headers }).catch(() => null),
                  fetch(`${API_BASE}/api/alerts`, { headers }).catch(() => null),
                  fetch(`${API_BASE}/api/audit-logs`, { headers }).catch(() => null),
                  fetch(`${API_BASE}/api/performance/metrics`, { headers }).catch(() => null)
                ]);

                if (txsRes?.ok && rlsRes?.ok && alrtsRes?.ok && logsRes?.ok && mtrcsRes?.ok) {
                  const txs = await txsRes.json().catch(() => []);
                  const rls = await rlsRes.json().catch(() => []);
                  const alrts = await alrtsRes.json().catch(() => []);
                  const logs = await logsRes.json().catch(() => []);
                  const mtrcs = await mtrcsRes.json().catch(() => null);

                  setTransactions(Array.isArray(txs) ? txs : []);
                  setRules(Array.isArray(rls) ? rls : []);
                  setAlerts(Array.isArray(alrts) ? alrts : []);
                  setAuditLogs(Array.isArray(logs) ? logs : []);
                  if (mtrcs) setMetrics(mtrcs);
                  return;
                } else if (txsRes?.status === 401 || alrtsRes?.status === 401) {
                  handleLogout();
                  return;
                }
              } else {
                return;
              }
            }
          }
        }
      } catch (e) {
        // Fall through to offline mode
      }

      setIsBackendOnline(false);

      if (token) {
        // Offline Simulation Logic (if backend is offline)
        // Mirror mock states to current tables
        setTransactions(mockTransactions);
        setRules(mockRules);
        setAlerts(mockAlerts);
        setAuditLogs(mockLogs);
        
        // Calculate dynamic simulated performance
        setMetrics({
          cpu_usage: parseFloat((Math.random() * 8 + 3).toFixed(1)),
          memory_usage: 41.8,
          active_connections: Math.floor(Math.random() * 5 + 12),
          avg_encryption_time_ms: 0.38,
          avg_decryption_time_ms: 0.72,
          total_transactions_processed: mockTransactions.length,
          throughput_tps: mockTransactions.length > 0 ? parseFloat((Math.random() * 15 + 4).toFixed(1)) : 0.0
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [mockTransactions, mockRules, mockAlerts, mockLogs, token]);

  // Simulated Crypto Helper for offline mode
  const localEncrypt = (text: string) => {
    const encKey = btoa('aes-session-key-' + Math.random().toString(36).slice(-8));
    const cipher = btoa(text);
    return {
      ciphertext: cipher,
      iv: btoa('iv-vector-12b'),
      tag: btoa('gcm-tag-verify'),
      encrypted_session_key: encKey
    };
  };

  const handleLogin = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    try {
      if (isBackendOnline) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || 'Kredensial salah.');
          }
          setToken(data.access_token);
          setRole(data.role);
          sessionStorage.setItem('token', data.access_token);
          sessionStorage.setItem('role', data.role);
          return true;
        }
      }
    } catch (e: any) {
      if (isBackendOnline && e.message && !e.message.includes('JSON')) {
        throw new Error(e.message || 'Gagal login.');
      }
    }

    // Offline mode mock login fallback
    const validCredentials: Record<string, string> = {
      admin: 'SecurityAdmin',
      analyst: 'FraudAnalyst',
      operator: 'SystemOperator'
    };

    if (validCredentials[usernameInput] && passwordInput === 'password123') {
      const mockToken = `mock-jwt-token-for-${usernameInput}`;
      const userRole = validCredentials[usernameInput];
      setToken(mockToken);
      setRole(userRole);
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('role', userRole);

      // Log success offline audit
      const newLog = {
        id: mockLogs.length + 1,
        timestamp: new Date().toISOString(),
        user: usernameInput,
        action: 'LOGIN_SUCCESS',
        source_ip: '127.0.0.1',
        status: 'SUCCESS',
        details: `Berhasil login secara lokal. Peran aktif: ${userRole}`
      };
      setMockLogs([newLog, ...mockLogs]);
      return true;
    } else {
      // Log fail offline audit
      const newLog = {
        id: mockLogs.length + 1,
        timestamp: new Date().toISOString(),
        user: usernameInput,
        action: 'LOGIN_FAILED',
        source_ip: '127.0.0.1',
        status: 'FAILED',
        details: 'Gagal login secara lokal: Kredensial tidak valid.'
      };
      setMockLogs([newLog, ...mockLogs]);
      throw new Error('Kredensial tidak valid. Silakan gunakan password123.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setActiveTab('dashboard');
  };

  // --- CONTROLLER HANDLERS ---

  const handleEncryptPlayground = async (text: string) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/crypto/encrypt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plaintext: text })
      });
      if (!r.ok) throw new Error('Enkripsi gagal.');
      return r.json();
    }
    // Offline simulation
    return localEncrypt(text);
  };

  const handleDecryptPlayground = async (data: any) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/crypto/decrypt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error('Dekripsi gagal.');
      const res = await r.json();
      return res.plaintext;
    }
    // Offline simulation
    return atob(data.ciphertext);
  };

  const handleDecryptTransaction = async (id: number): Promise<string> => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/transactions/${id}/decrypt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!r.ok) {
        if (r.status === 403) throw new Error('Akses Ditolak: Anda tidak memiliki wewenang untuk melihat data ini.');
        throw new Error('Dekripsi gagal.');
      }
      const res = await r.json();
      return res.plaintext;
    }
    // Offline role check
    if (role !== 'FraudAnalyst') {
      throw new Error('Akses Ditolak: Peran Anda tidak memiliki hak akses dekripsi.');
    }
    // Offline
    const tx = mockTransactions.find(t => t.id === id);
    if (!tx) throw new Error('Transaksi tidak ditemukan.');
    
    // Add local audit log entry
    const newLog = {
      id: mockLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: 'analyst',
      action: 'DECRYPT_TRANSACTION',
      source_ip: '127.0.0.1',
      status: 'SUCCESS',
      details: `Mendekripsi data transaksi ${tx.transaction_id} secara lokal.`
    };
    setMockLogs([newLog, ...mockLogs]);
    return atob(tx.encrypted_payload);
  };

  const handleToggleRule = async (id: number, is_active: boolean) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/rules/${id}/toggle`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active })
      });
      if (!r.ok) {
        if (r.status === 403) alert('Akses Ditolak: Hanya SecurityAdmin yang dapat mengaktifkan/menonaktifkan aturan.');
        return;
      }
      return;
    }
    // Offline role check
    if (role !== 'SecurityAdmin') {
      alert('Akses Ditolak: Hanya SecurityAdmin yang dapat mengaktifkan/menonaktifkan aturan.');
      return;
    }
    // Offline
    const updated = mockRules.map(r => r.id === id ? { ...r, is_active } : r);
    setMockRules(updated);
    
    const rule = mockRules.find(r => r.id === id);
    const newLog = {
      id: mockLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: 'admin',
      action: 'TOGGLE_RULE',
      source_ip: '127.0.0.1',
      status: 'SUCCESS',
      details: `Mengubah aturan '${rule?.name}' menjadi ${is_active ? 'AKTIF' : 'NON-AKTIF'}.`
    };
    setMockLogs([newLog, ...mockLogs]);
  };

  const handleCreateRule = async (ruleData: any) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/rules`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ruleData)
      });
      if (!r.ok) {
        if (r.status === 403) alert('Akses Ditolak: Hanya SecurityAdmin yang dapat membuat aturan baru.');
        return;
      }
      return;
    }
    // Offline role check
    if (role !== 'SecurityAdmin') {
      alert('Akses Ditolak: Hanya SecurityAdmin yang dapat membuat aturan baru.');
      return;
    }
    // Offline
    const newRule = { ...ruleData, id: mockRules.length + 1 };
    setMockRules([...mockRules, newRule]);
    
    const newLog = {
      id: mockLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: 'admin',
      action: 'CREATE_RULE',
      source_ip: '127.0.0.1',
      status: 'SUCCESS',
      details: `Membuat aturan baru secara lokal: ${ruleData.name}`
    };
    setMockLogs([newLog, ...mockLogs]);
  };

  const handleUpdateAlert = async (id: number, status: string, notes: string) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      if (!r.ok) {
        if (r.status === 403) alert('Akses Ditolak: Hanya FraudAnalyst yang dapat mengubah status alert.');
        return;
      }
      return;
    }
    // Offline role check
    if (role !== 'FraudAnalyst') {
      alert('Akses Ditolak: Hanya FraudAnalyst yang dapat mengubah status alert.');
      return;
    }
    // Offline
    const updated = mockAlerts.map(a => a.id === id ? { ...a, status, notes } : a);
    setMockAlerts(updated);

    const newLog = {
      id: mockLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: 'analyst',
      action: 'UPDATE_ALERT',
      source_ip: '127.0.0.1',
      status: 'SUCCESS',
      details: `Mengubah status alert ID {id} menjadi {status}.`
    };
    setMockLogs([newLog, ...mockLogs]);
  };

  const handleSimulateTransactions = async (count: number) => {
    if (isBackendOnline) {
      await fetch(`${API_BASE}/api/transactions/simulate?count=${count}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return;
    }
    
    // Offline Burst Simulation
    const channels = ["QRIS", "Virtual Account", "E-Wallet", "Credit Card"];
    const customers = ["CUST-109", "CUST-304", "CUST-982", "CUST-441"];
    
    let localTxs = [...mockTransactions];
    let localAlerts = [...mockAlerts];

    for (let i = 0; i < count; i++) {
      const cust = customers[Math.floor(Math.random() * customers.length)];
      const amount = Math.random() < 0.20 
        ? Math.floor(Math.random() * 15000000 + 10000001) // triggers amount rule
        : Math.floor(Math.random() * 500000 + 10000);
      const ch = channels[Math.floor(Math.random() * channels.length)];
      const tx_id = `JAT-SIM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*9000+1000)}`;

      // Offline Fraud Engine Check
      const triggeredRules: any[] = [];
      const activeRules = mockRules.filter(r => r.is_active);
      activeRules.forEach(rule => {
        if (rule.parameter === 'amount' && amount > parseFloat(rule.threshold)) {
          triggeredRules.push(rule);
        }
        // Assume velocity triggered mockingly in burst
        if (rule.parameter === 'velocity' && count > parseInt(rule.threshold) && i > parseInt(rule.threshold)) {
          triggeredRules.push(rule);
        }
      });

      const isSuspicious = triggeredRules.length > 0;
      const payloadText = JSON.stringify({ customer_id: cust, amount, channel: ch });
      const cryptoData = localEncrypt(payloadText);

      const newTx = {
        id: localTxs.length + 1,
        transaction_id: tx_id,
        timestamp: new Date().toISOString(),
        customer_id: cust,
        amount,
        channel: ch,
        encrypted_payload: cryptoData.ciphertext,
        encrypted_session_key: cryptoData.encrypted_session_key,
        iv: cryptoData.iv,
        tag: cryptoData.tag,
        status: isSuspicious ? 'SUSPICIOUS' : 'SUCCESS'
      };
      
      localTxs = [newTx, ...localTxs];

      triggeredRules.forEach(rule => {
        const alert = {
          id: localAlerts.length + 1,
          transaction_id: tx_id,
          timestamp: new Date().toISOString(),
          rule_id: rule.id,
          rule_name: rule.name,
          amount,
          severity: rule.severity,
          status: 'PENDING',
          notes: `Kriteria terpicu: ${rule.parameter} ${rule.operator} ${rule.threshold}`
        };
        localAlerts = [alert, ...localAlerts];
      });
    }

    setMockTransactions(localTxs);
    setMockAlerts(localAlerts);
  };

  const handleSendTransaction = async (txData: { customer_id: string, amount: number, channel: string }) => {
    if (isBackendOnline) {
      const payloadString = JSON.stringify({
        customer_id: txData.customer_id,
        amount: txData.amount,
        channel: txData.channel,
        timestamp: new Date().toISOString()
      });
      const r = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: txData.customer_id,
          amount: txData.amount,
          channel: txData.channel,
          payload: payloadString
        })
      });
      if (!r.ok) {
        throw new Error('Gagal mengirim transaksi ke server.');
      }
      const data = await r.json();
      return data;
    }
    
    // Offline Mock Simulation for a Single Transaction
    const ch = txData.channel;
    const cust = txData.customer_id;
    const amount = txData.amount;
    const tx_id = `JAT-MOB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*9000+1000)}`;

    const triggeredRules: any[] = [];
    const activeRules = mockRules.filter(r => r.is_active);
    activeRules.forEach(rule => {
      if (rule.parameter === 'amount' && amount > parseFloat(rule.threshold)) {
        triggeredRules.push(rule);
      }
    });

    const isSuspicious = triggeredRules.length > 0;
    const payloadText = JSON.stringify({ customer_id: cust, amount, channel: ch });
    const cryptoData = localEncrypt(payloadText);

    const newTx = {
      id: mockTransactions.length + 1,
      transaction_id: tx_id,
      timestamp: new Date().toISOString(),
      customer_id: cust,
      amount,
      channel: ch,
      encrypted_payload: cryptoData.ciphertext,
      encrypted_session_key: cryptoData.encrypted_session_key,
      iv: cryptoData.iv,
      tag: cryptoData.tag,
      status: isSuspicious ? 'SUSPICIOUS' : 'SUCCESS'
    };

    setMockTransactions([newTx, ...mockTransactions]);

    if (isSuspicious) {
      triggeredRules.forEach(rule => {
        const alert = {
          id: mockAlerts.length + 1,
          transaction_id: tx_id,
          timestamp: new Date().toISOString(),
          rule_id: rule.id,
          rule_name: rule.name,
          amount,
          severity: rule.severity,
          status: 'PENDING',
          notes: `Kriteria terpicu secara lokal: ${rule.parameter} ${rule.operator} ${rule.threshold}`
        };
        setMockAlerts([alert, ...mockAlerts]);
      });
      const fraudLog = {
        id: mockLogs.length + 1,
        timestamp: new Date().toISOString(),
        user: 'System',
        action: 'FRAUD_DETECTED',
        source_ip: '127.0.0.1',
        status: 'SUCCESS',
        details: `Fraud terdeteksi pada transaksi ${tx_id}`
      };
      setMockLogs(prev => [fraudLog, ...prev]);
    }

    const txLog = {
      id: mockLogs.length + 2,
      timestamp: new Date().toISOString(),
      user: 'API_Client',
      action: 'CREATE_TRANSACTION',
      source_ip: '127.0.0.1',
      status: 'SUCCESS',
      details: `Membuat transaksi ${tx_id} via JatelindoPay`
    };
    setMockLogs(prev => [txLog, ...prev]);
    
    return newTx;
  };

  if (!token) {
    return (
      <Login 
        onLogin={handleLogin} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isBackendOnline={isBackendOnline} 
      />
    );
  }

  const pendingAlertsCount = alerts.filter(a => a.status === 'PENDING').length;

  return (
    <div className={`app-container ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      {/* Willow Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        pendingAlertsCount={pendingAlertsCount}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="main-content">
        {/* Willow Topbar Header */}
        <Topbar 
          theme={theme}
          toggleTheme={toggleTheme}
          role={role}
          onLogout={handleLogout}
        />

        {/* Dynamic content tab routing */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            metrics={metrics} 
            transactions={transactions} 
            alerts={alerts} 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'transactions' && (
          <Transactions 
            transactions={transactions} 
            onDecrypt={handleDecryptTransaction} 
            role={role || ''}
          />
        )}
        {activeTab === 'rules' && (
          <FraudDetection 
            rules={rules} 
            onToggleRule={handleToggleRule} 
            onCreateRule={handleCreateRule} 
            role={role || ''}
          />
        )}
        {activeTab === 'alerts' && (
          <FraudAlerts 
            alerts={alerts} 
            onUpdateAlert={handleUpdateAlert} 
            role={role || ''}
          />
        )}
        {activeTab === 'crypto' && (
          <EncryptionSecurity 
            onEncryptPlayground={handleEncryptPlayground} 
            onDecryptPlayground={handleDecryptPlayground} 
          />
        )}
        {activeTab === 'logs' && (
          <AuditLogs logs={auditLogs} />
        )}
        {activeTab === 'performance' && (
          <Performance 
            metrics={metrics} 
            onSimulate={handleSimulateTransactions} 
          />
        )}
        {activeTab === 'demo' && (
          <DemoHybrid 
            onEncrypt={handleEncryptPlayground}
            onDecrypt={handleDecryptPlayground}
          />
        )}
        {activeTab === 'mobile' && (
          <CustomerMobile 
            onSendTransaction={handleSendTransaction}
            mockRules={mockRules}
          />
        )}
      </div>
    </div>
  );
}
