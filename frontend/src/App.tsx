import { useState, useEffect, useRef } from 'react';
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
import { UserApp } from './components/user/UserApp';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ThesisReports } from './components/ThesisReports';
import { Toast } from './components/Toast';
import { UserManagement } from './components/UserManagement';
import type { Transaction, FraudAlert, FraudRule, AuditLog, PerformanceMetrics, DecryptPayload, ToastNotification, SystemNotification } from './types';
import { INITIAL_MOCK_RULES, INITIAL_MOCK_LOGS, localEncrypt, simulateOfflineBurst, simulateOfflineSingleTransaction, INITIAL_NOTIFICATIONS, mockRotateKey, mockRunBenchmark, mockEvaluateDataset, mockTamperTest } from './offlineSimulation';
import './components/WillowViews.css';

const API_BASE = '';

export default function App() {
  const [isDemoMobileRoute, setIsDemoMobileRoute] = useState<boolean>(() =>
    window.location.pathname.startsWith('/demo-mobile')
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleRouteChange = () => {
      setIsDemoMobileRoute(window.location.pathname.startsWith('/demo-mobile'));
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth States
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(sessionStorage.getItem('role'));
  const getAllowedTabsForRole = (userRole: string | null) => {
    if (userRole === 'FraudAnalyst') {
      return ['dashboard', 'transactions', 'users', 'rules', 'alerts', 'crypto', 'logs', 'reports'];
    }
    if (userRole === 'SystemOperator') {
      return ['demo', 'mobile', 'performance'];
    }
    return ['dashboard', 'transactions', 'users', 'rules', 'alerts', 'crypto', 'logs', 'performance', 'reports', 'demo', 'mobile'];
  };

  const getDefaultTabForRole = (userRole: string | null) => {
    if (userRole === 'SystemOperator') return 'demo';
    if (userRole === 'FraudAnalyst') return 'transactions';
    return 'dashboard';
  };

  useEffect(() => {
    if (role) {
      const allowed = getAllowedTabsForRole(role);
      if (!allowed.includes(activeTab)) {
        setActiveTab(getDefaultTabForRole(role));
      }
    }
  }, [role, activeTab]);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const seenTxIdsRef = useRef<Set<string>>(new Set());
  const seenAlertIdsRef = useRef<Set<string | number>>(new Set());
  const isInitializedRef = useRef<boolean>(false);

  const handleMarkNotifAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const handleMarkAllNotifsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const handleClearNotifications = () => setNotifications([]);
  const addToast = (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastNotification = {
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB'
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  // Application Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu_usage: 5.4,
    memory_usage: 42.1,
    active_connections: 15,
    avg_encryption_time_ms: 0.45,
    avg_decryption_time_ms: 0.85,
    total_transactions_processed: 0,
    throughput_tps: 0.0
  });

  // Local state fallbacks (Offline Mock Database)
  const [mockTransactions, setMockTransactions] = useState<Transaction[]>([]);
  const [mockRules, setMockRules] = useState<FraudRule[]>(INITIAL_MOCK_RULES);
  const [mockAlerts, setMockAlerts] = useState<FraudAlert[]>([]);
  const [mockLogs, setMockLogs] = useState<AuditLog[]>(INITIAL_MOCK_LOGS);


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
                  if (Array.isArray(txs)) {
                    setTransactions(txs);
                    if (isInitializedRef.current) {
                      txs.forEach((t: Transaction) => {
                        if (t.transaction_id && !seenTxIdsRef.current.has(t.transaction_id)) {
                          seenTxIdsRef.current.add(t.transaction_id);
                          if (t.status === 'SUSPICIOUS') {
                            addToast(
                              'danger',
                              'Transaksi Mencurigakan Terdeteksi!',
                              `Transaksi #${t.transaction_id} sebesar Rp ${t.amount ? t.amount.toLocaleString('id-ID') : '0'} (${t.channel}) ditandai SUSPICIOUS oleh Fraud Engine.`
                            );
                          }
                        }
                      });
                    } else {
                      txs.forEach(t => { if (t.transaction_id) seenTxIdsRef.current.add(t.transaction_id); });
                    }
                  }
                  setRules(Array.isArray(rls) ? rls : []);
                  if (Array.isArray(alrts)) {
                    setAlerts(alrts);
                    if (!isInitializedRef.current) {
                      alrts.forEach(a => { if (a.id) seenAlertIdsRef.current.add(a.id); });
                      const initialList: SystemNotification[] = alrts.slice(0, 8).map(a => ({
                        id: 'notif-alert-' + a.id,
                        title: `Peringatan Fraud: ${a.rule_name}`,
                        reason: a.notes || `Transaksi #${a.transaction_id} memicu aturan '${a.rule_name}' dengan nominal Rp ${a.amount ? a.amount.toLocaleString('id-ID') : '0'}.`,
                        transaction_id: a.transaction_id,
                        amount: a.amount,
                        severity: (a.severity as any) || 'HIGH',
                        timestamp: a.timestamp ? new Date(a.timestamp).toLocaleTimeString('id-ID') + ' WIB' : new Date().toLocaleTimeString('id-ID') + ' WIB',
                        isRead: false,
                        rule_name: a.rule_name,
                        status: a.status
                      }));
                      setNotifications(initialList);
                      isInitializedRef.current = true;
                    } else {
                      alrts.forEach((a: FraudAlert) => {
                        if (a.id && !seenAlertIdsRef.current.has(a.id)) {
                          seenAlertIdsRef.current.add(a.id);
                          const reasonDetail = a.notes || `Transaksi #${a.transaction_id} memicu aturan '${a.rule_name}' dengan nominal Rp ${a.amount ? a.amount.toLocaleString('id-ID') : '0'}.`;
                          const newNotif: SystemNotification = {
                            id: 'notif-alert-' + a.id + '-' + Date.now(),
                            title: `Peringatan Fraud: ${a.rule_name}`,
                            reason: reasonDetail,
                            transaction_id: a.transaction_id,
                            amount: a.amount,
                            severity: (a.severity as any) || 'HIGH',
                            timestamp: a.timestamp ? new Date(a.timestamp).toLocaleTimeString('id-ID') + ' WIB' : new Date().toLocaleTimeString('id-ID') + ' WIB',
                            isRead: false,
                            rule_name: a.rule_name,
                            status: a.status
                          };
                          setNotifications(prev => [newNotif, ...prev]);
                          addToast('danger', 'Peringatan Fraud Terdeteksi!', reasonDetail);
                        }
                      });
                    }
                  }
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
          setActiveTab(getDefaultTabForRole(data.role));
          sessionStorage.setItem('token', data.access_token);
          sessionStorage.setItem('role', data.role);
          return true;
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal login.';
      if (isBackendOnline && msg && !msg.includes('JSON')) {
        throw new Error(msg);
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
      setActiveTab(getDefaultTabForRole(userRole));
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

  const handleDecryptPlayground = async (data: DecryptPayload) => {
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
    if (role !== 'FraudAnalyst' && role !== 'SecurityAdmin') {
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

  const handleTamperTest = async (text: string) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/crypto/tamper-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plaintext: text })
      });
      return r.json();
    }
    return mockTamperTest(text);
  };

  const handleRotateKey = async () => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/crypto/rotate-key`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return r.json();
    }
    return mockRotateKey();
  };

  const handleRunBenchmark = async (sizeKb: number) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/crypto/benchmark?payload_size_kb=${sizeKb}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return r.json();
    }
    return mockRunBenchmark(sizeKb);
  };

  const handleEvaluateDataset = async () => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/fraud/evaluate-dataset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return r.json();
    }
    return mockEvaluateDataset();
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

  const handleCreateRule = async (ruleData: Omit<FraudRule, 'id'>) => {
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
    setMockRules([...mockRules, { ...ruleData, id: mockRules.length + 1 }]);
    setMockLogs([{ id: mockLogs.length + 1, timestamp: new Date().toISOString(), user: 'admin', action: 'CREATE_RULE', source_ip: '127.0.0.1', status: 'SUCCESS', details: `Membuat aturan baru: ${ruleData.name}` }, ...mockLogs]);
  };

  const handleUpdateAlert = async (id: number, status: string, notes: string, transaction_status?: string) => {
    if (isBackendOnline) {
      const r = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes, transaction_status })
      });
      if (!r.ok) {
        alert('Gagal memperbarui keputusan status alert.');
        return;
      }
      return;
    }
    if (role === 'SystemOperator') {
      alert('Akses Ditolak: Hanya FraudAnalyst dan SecurityAdmin yang dapat mengubah status alert.');
      return;
    }
    setMockAlerts(mockAlerts.map(a => a.id === id ? { ...a, status, notes } : a));
    setMockLogs([{ id: mockLogs.length + 1, timestamp: new Date().toISOString(), user: 'analyst', action: 'UPDATE_ALERT', source_ip: '127.0.0.1', status: 'SUCCESS', details: `Mengubah status alert ID ${id} menjadi ${status}.` }, ...mockLogs]);
  };

  const handleSimulateTransactions = async (count: number) => {
    if (isBackendOnline) {
      addToast('info', 'Simulasi Beban Dimulai', `Mengirimkan ${count} transaksi simultan ke background server.`);
      await fetch(`${API_BASE}/api/transactions/simulate?count=${count}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return;
    }
    
    // Offline Burst Simulation
    const res = simulateOfflineBurst(count, mockTransactions, mockAlerts, mockRules, mockLogs);
    setMockTransactions(res.transactions);
    setMockAlerts(res.alerts);
    addToast('info', 'Simulasi Selesai', `Sebanyak ${count} transaksi simulasi dievaluasi.`);
  };

  const handleSendTransaction = async (txData: { 
    customer_id: string; 
    amount: number; 
    channel: string; 
    recipient_name?: string; 
    recipient_account?: string; 
  }) => {
    if (isBackendOnline) {
      let activeToken = token;
      if (!activeToken) {
        const authRes = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'password123' })
        }).catch(() => null);
        if (authRes && authRes.ok) {
          const authData = await authRes.json();
          activeToken = authData.access_token;
          setToken(activeToken);
          setRole(authData.role);
          sessionStorage.setItem('token', authData.access_token);
          sessionStorage.setItem('role', authData.role);
        }
      }

      const payloadString = JSON.stringify({
        customer_id: txData.customer_id,
        recipient_name: txData.recipient_name || '',
        recipient_account: txData.recipient_account || '',
        amount: txData.amount,
        channel: txData.channel,
        timestamp: new Date().toISOString()
      });
      const r = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          customer_id: txData.customer_id,
          recipient_name: txData.recipient_name,
          recipient_account: txData.recipient_account,
          amount: txData.amount,
          channel: txData.channel,
          payload: payloadString
        })
      });
      if (!r.ok) {
        throw new Error('Gagal mengirim transaksi ke server.');
      }
      const data = await r.json();
      if (data.status === 'SUSPICIOUS') {
        const notifReason = `Transaksi #${data.transaction_id} nasabah ${data.customer_id} sebesar Rp ${data.amount ? data.amount.toLocaleString('id-ID') : '0'} (${data.channel}) terdeteksi anomali oleh Fraud Engine.`;
        const newNotif: SystemNotification = {
          id: 'notif-tx-' + data.transaction_id + '-' + Date.now(),
          title: 'Transaksi Mencurigakan Terdeteksi (Mobile)',
          reason: notifReason,
          transaction_id: data.transaction_id,
          customer_id: data.customer_id,
          amount: data.amount,
          channel: data.channel,
          severity: 'HIGH',
          timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
          isRead: false,
          status: 'SUSPICIOUS'
        };
        setNotifications(prev => [newNotif, ...prev]);
        addToast('danger', 'Transaksi Mencurigakan Terdeteksi!', notifReason);
      } else {
        addToast('success', 'Transaksi Berhasil Diproses', `Pembayaran ${data.channel} sebesar Rp ${data.amount ? data.amount.toLocaleString('id-ID') : '0'} tercatat aman.`);
      }
      return data;
    }
    
    // Offline Mock Simulation for a Single Transaction
    const res = simulateOfflineSingleTransaction(txData, mockTransactions, mockAlerts, mockRules, mockLogs);
    setMockTransactions(res.transactions);
    setMockAlerts(res.alerts);
    setMockLogs(res.logs);
    return res.newTx;
  };

  if (isDemoMobileRoute) {
    return (
      <UserApp
        onSendTransaction={handleSendTransaction}
      />
    );
  }

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
        {/* Willow Topbar Header with Realtime Notifications */}
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          role={role}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkAsRead={handleMarkNotifAsRead}
          onMarkAllAsRead={handleMarkAllNotifsAsRead}
          onClearNotifications={handleClearNotifications}
          onNavigate={(tab) => setActiveTab(tab)}
          metrics={metrics}
        />

        {/* Dynamic content tab routing */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            metrics={metrics} 
            transactions={transactions} 
            alerts={alerts} 
            rules={rules}
            onNavigate={(tab) => setActiveTab(tab)}
            onNotify={addToast}
            role={role || ''}
            onDecrypt={handleDecryptTransaction}
          />
        )}
        {activeTab === 'transactions' && (
          <Transactions 
            transactions={transactions} 
            onDecrypt={handleDecryptTransaction} 
            role={role || ''}
            onNotify={addToast}
          />
        )}
        {activeTab === 'users' && (
          <UserManagement
            transactions={transactions}
            alerts={alerts}
            onNotify={addToast}
          />
        )}
        {activeTab === 'rules' && (
          <FraudDetection 
            rules={rules} 
            onToggleRule={handleToggleRule} 
            onCreateRule={handleCreateRule} 
            role={role || ''}
            onNotify={addToast}
          />
        )}
        {activeTab === 'alerts' && (
          <FraudAlerts 
            alerts={alerts} 
            transactions={transactions}
            onUpdateAlert={handleUpdateAlert} 
            role={role || ''}
            onNotify={addToast}
          />
        )}
        {activeTab === 'crypto' && (
          <EncryptionSecurity 
            onEncryptPlayground={handleEncryptPlayground} 
            onDecryptPlayground={handleDecryptPlayground} 
            onTamperTest={handleTamperTest}
            onRotateKey={handleRotateKey}
            onNotify={addToast}
          />
        )}
        {activeTab === 'logs' && (
          <AuditLogs logs={auditLogs} />
        )}
        {activeTab === 'performance' && (
          <Performance 
            metrics={metrics} 
            onSimulate={handleSimulateTransactions} 
            onNotify={addToast}
          />
        )}
        {activeTab === 'reports' && (
          <ThesisReports 
            onRunBenchmark={handleRunBenchmark}
            onTamperTest={handleTamperTest}
            onRotateKey={handleRotateKey}
            onEvaluateDataset={handleEvaluateDataset}
            apiBase={API_BASE}
            role={role || ''}
            onNotify={addToast}
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
            onNotify={addToast}
            onSwitchToSocPortal={() => setActiveTab(getDefaultTabForRole(role))}
          />
        )}
      </div>
      {/* Global Toast Stack */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
