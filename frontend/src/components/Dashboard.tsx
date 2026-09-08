import React, { useState } from 'react';

interface DashboardProps {
  metrics: {
    total_transactions_processed: number;
    avg_encryption_time_ms: number;
    avg_decryption_time_ms: number;
    throughput_tps: number;
    cpu_usage: number;
    memory_usage: number;
  };
  transactions: any[];
  alerts: any[];
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, transactions, alerts, onNavigate }) => {
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');

  const pendingAlertsCount = alerts.filter(a => a.status === 'PENDING').length;

  // Filter-based dual-bar chart datasets
  const chartDatasets = {
    Monthly: [
      { month: 'Jan', blue: 2700, cyan: 2200 },
      { month: 'Feb', blue: 1800, cyan: 1400 },
      { month: 'Mar', blue: 2800, cyan: 2100 },
      { month: 'Apr', blue: 2900, cyan: 2200 },
      { month: 'May', blue: 2800, cyan: 2200 },
      { month: 'Jun', blue: 1800, cyan: 1600 },
      { month: 'Jul', blue: 950,  cyan: 800 },
      { month: 'Aug', blue: 2700, cyan: 2250 },
    ],
    Weekly: [
      { month: 'W1', blue: 2100, cyan: 1700 },
      { month: 'W2', blue: 2400, cyan: 1900 },
      { month: 'W3', blue: 1900, cyan: 1500 },
      { month: 'W4', blue: 2800, cyan: 2300 },
      { month: 'W5', blue: 2600, cyan: 2100 },
      { month: 'W6', blue: 2200, cyan: 1800 },
      { month: 'W7', blue: 1600, cyan: 1200 },
      { month: 'W8', blue: 2900, cyan: 2400 },
    ],
    Daily: [
      { month: 'Mon', blue: 1800, cyan: 1400 },
      { month: 'Tue', blue: 2200, cyan: 1750 },
      { month: 'Wed', blue: 2600, cyan: 2100 },
      { month: 'Thu', blue: 2400, cyan: 1950 },
      { month: 'Fri', blue: 2900, cyan: 2350 },
      { month: 'Sat', blue: 1950, cyan: 1550 },
      { month: 'Sun', blue: 1400, cyan: 1100 },
      { month: 'Now', blue: 2750, cyan: 2200 },
    ]
  };

  const barChartData = chartDatasets[timeFilter];
  const maxVal = 3200;
  const chartHeight = 160;

  // Latest Transaction data mapping
  const defaultTransactions = [
    {
      code: '#8764',
      name: 'Lip Scrub',
      desc: 'CUST-109 (QRIS)',
      date: 'Dec, 28',
      price: '$60',
      order: 800,
      total: '$48.000',
      icon: '💄'
    },
    {
      code: '#8765',
      name: 'Argan Oil',
      desc: 'CUST-304 (Virtual Account)',
      date: 'Dec, 27',
      price: '$90',
      order: 820,
      total: '$73.800',
      icon: '🧴'
    },
    {
      code: '#8766',
      name: 'Sugar Scrub',
      desc: 'CUST-982 (E-Wallet)',
      date: 'Dec, 27',
      price: '$40',
      order: 900,
      total: '$36.000',
      icon: '🍯'
    },
    {
      code: '#8767',
      name: 'Body Wash',
      desc: 'CUST-441 (Credit Card)',
      date: 'Dec, 26',
      price: '$70',
      order: 850,
      total: '$59.500',
      icon: '🧼'
    }
  ];

  const displayTransactions = transactions && transactions.length > 0
    ? transactions.slice(0, 4).map((tx, idx) => ({
        code: `#${tx.transaction_id ? tx.transaction_id.slice(-4) : (8764 + idx)}`,
        name: tx.customer_id ? `Nasabah ${tx.customer_id}` : defaultTransactions[idx].name,
        desc: `${tx.channel || 'QRIS'} (Terverifikasi)`,
        date: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : defaultTransactions[idx].date,
        price: `$${Math.round((tx.amount || 60000) / 1000)}`,
        order: 800 + idx * 25,
        total: `$${((tx.amount || 60000) / 1000).toFixed(3)}`,
        icon: idx % 2 === 0 ? '💄' : '🧴'
      }))
    : defaultTransactions;

  // Customers data list
  const customers = [
    {
      name: 'Calvin Manik',
      time: '5 minutes ago',
      code: 'SHP20019285',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Agafhia Zahra',
      time: '10 minutes ago',
      code: 'SHP20019286',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Angela Fanny',
      time: '30 minutes ago',
      code: 'SHP20019287',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Doni Ghalpin',
      time: '45 minutes ago',
      code: 'SHP20019288',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <div className="view-container animate-fade-in">
      {/* ============================================================ */}
      {/* ROW 1: 4 KPI STATS CARDS                                     */}
      {/* ============================================================ */}
      <div className="willow-kpi-grid">
        {/* Card 1: Royal Blue Solid Hero Card */}
        <div className="kpi-card-hero">
          <div className="kpi-hero-iconbox">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="kpi-hero-info">
            <span className="kpi-hero-val">{metrics.total_transactions_processed > 0 ? `${metrics.total_transactions_processed}+` : '178+'}</span>
            <span className="kpi-hero-label">Save Products</span>
          </div>
        </div>

        {/* Card 2: Stock Products (Purple Accent) */}
        <div className="willow-card kpi-card-standard">
          <div className="kpi-iconbox purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <div className="kpi-val">2000+</div>
            <div className="kpi-label">Stock Products</div>
          </div>
        </div>

        {/* Card 3: Sales Products (Orange Accent) */}
        <div className="willow-card kpi-card-standard">
          <div className="kpi-iconbox orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <div className="kpi-val">{pendingAlertsCount > 0 ? `${pendingAlertsCount}+` : '190+'}</div>
            <div className="kpi-label">Sales Products</div>
          </div>
        </div>

        {/* Card 4: Job Application (Sky Blue Accent) */}
        <div className="willow-card kpi-card-standard">
          <div className="kpi-iconbox blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <div className="kpi-val">{metrics.throughput_tps > 0 ? `${Math.round(metrics.throughput_tps)}+` : '12+'}</div>
            <div className="kpi-label">Job Application</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: OVERALL SALES (2/3) & EARNING REPORTS (1/3)           */}
      {/* ============================================================ */}
      <div className="willow-split-grid">
        {/* Left Side: Overall Sales Dual Bar Chart */}
        <div className="willow-card">
          <div className="card-header-row">
            <h3 className="card-heading">Overall Sales</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="time-filter-pills">
                {(['Daily', 'Weekly', 'Monthly'] as const).map(tab => (
                  <div 
                    key={tab} 
                    className={`time-filter-pill ${timeFilter === tab ? 'active' : ''}`}
                    onClick={() => setTimeFilter(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <button className="card-dots-btn" title="Opsi">•••</button>
            </div>
          </div>

          <div className="chart-subheading">
            Total Order : <span className="chart-subheading-highlight">{metrics.total_transactions_processed > 0 ? metrics.total_transactions_processed.toLocaleString('id-ID') : '24.890'}</span>
          </div>

          {/* Legend */}
          <div className="chart-legend-row">
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#2563eb' }}></div>
              <span>Account Reached</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></div>
              <span>Account Engaged</span>
            </div>
          </div>

          {/* Dual Bar Chart Container */}
          <div style={{ display: 'flex', gap: '16px', height: `${chartHeight + 35}px`, marginTop: '10px' }}>
            {/* Y-Axis scale */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartHeight}px`, paddingRight: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>3k</span>
              <span>2k</span>
              <span>1k</span>
              <span>0</span>
            </div>

            {/* Bars Canvas */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Bars Grid area with horizontal guide lines */}
              <div style={{ flexGrow: 1, position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', borderBottom: '1px solid var(--border-color)' }}>
                {/* Horizontal Guide lines */}
                <div style={{ position: 'absolute', top: '0%', left: 0, right: 0, borderTop: '1px dashed var(--border-subtle)' }}></div>
                <div style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, borderTop: '1px dashed var(--border-subtle)' }}></div>
                <div style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, borderTop: '1px dashed var(--border-subtle)' }}></div>

                {barChartData.map((item, idx) => {
                  const hBlue = (item.blue / maxVal) * chartHeight;
                  const hCyan = (item.cyan / maxVal) * chartHeight;

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', zIndex: 2 }}>
                      {/* Blue Bar */}
                      <div 
                        style={{ 
                          width: '13px', 
                          height: `${hBlue}px`, 
                          backgroundColor: '#2563eb', 
                          borderTopLeftRadius: '5px', 
                          borderTopRightRadius: '5px',
                          transition: 'height 0.3s ease'
                        }}
                        title={`Account Reached: ${item.blue}`}
                      />
                      {/* Cyan Bar */}
                      <div 
                        style={{ 
                          width: '13px', 
                          height: `${hCyan}px`, 
                          backgroundColor: '#06b6d4', 
                          borderTopLeftRadius: '5px', 
                          borderTopRightRadius: '5px',
                          transition: 'height 0.3s ease'
                        }}
                        title={`Account Engaged: ${item.cyan}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Month labels */}
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '8px' }}>
                {barChartData.map((item, idx) => (
                  <span key={idx} style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Earning Reports Donut Chart */}
        <div className="willow-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-row">
            <h3 className="card-heading">Earning Reports</h3>
            <button className="card-dots-btn" title="Opsi">•••</button>
          </div>

          {/* Donut Chart SVG Container */}
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '190px' }}>
            <svg width="190" height="190" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle track */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--bg-subtle)" strokeWidth="12" />
              
              {/* Segment 1: Cyan (Order - 18%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#67e8f9"
                strokeWidth="12"
                strokeDasharray="42.9 238.7"
                strokeDashoffset="0"
              />

              {/* Segment 2: Vibrant Blue (Revenue - 34%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#2563eb"
                strokeWidth="12"
                strokeDasharray="81.1 238.7"
                strokeDashoffset="-42.9"
              />

              {/* Segment 3: Deep Blue (Visitor - 12%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#1d4ed8"
                strokeWidth="12"
                strokeDasharray="28.6 238.7"
                strokeDashoffset="-124"
              />
            </svg>

            {/* Percentage labels positioned next to arcs */}
            <div style={{ position: 'absolute', top: '15px', right: '35px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              18%
            </div>
            <div style={{ position: 'absolute', bottom: '28px', right: '15px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              34%
            </div>
            <div style={{ position: 'absolute', bottom: '15px', left: '40px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              12%
            </div>

            {/* Center Label in Donut */}
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                64%
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                Total Sales
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#67e8f9' }}></div>
              <span>Order</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#2563eb' }}></div>
              <span>Revenue</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#1d4ed8' }}></div>
              <span>Visitor</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 3: LATEST TRANSACTION (2/3) & COSTUMERS (1/3)            */}
      {/* ============================================================ */}
      <div className="willow-split-grid">
        {/* Left Side: Latest Transaction Table */}
        <div className="willow-card">
          <div className="card-header-row">
            <h3 className="card-heading">Latest Transaction</h3>
            <button className="card-dots-btn" title="Opsi">•••</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="willow-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product Name</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Order</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="code-link" onClick={() => onNavigate('transactions')}>
                        {tx.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{tx.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>{tx.price}</td>
                    <td style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{tx.order}</td>
                    <td style={{ fontWeight: 700 }}>{tx.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Costumers (Customer List) */}
        <div className="willow-card">
          <div className="card-header-row">
            <h3 className="card-heading">Costumers</h3>
            <button className="card-dots-btn" title="Opsi">•••</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {customers.map((c, idx) => (
              <div key={idx} className="customer-item">
                <img src={c.avatar} alt={c.name} className="customer-avatar" />
                <div className="customer-meta">
                  <span className="customer-name">{c.name}</span>
                  <span className="customer-time">{c.time}</span>
                </div>
                <span className="customer-id">{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
