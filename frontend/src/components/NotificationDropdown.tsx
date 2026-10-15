import React, { useState, useEffect, useRef } from 'react';
import type { SystemNotification } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, ShieldAlertIcon, ShieldCheckIcon } from './Icons';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigate: (tab: string, itemData?: any) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigate
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highCount = notifications.filter(n => n.severity === 'HIGH' || n.severity === 'CRITICAL').length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'high') return n.severity === 'HIGH' || n.severity === 'CRITICAL';
    return true;
  });

  const getSeverityBadgeClass = (severity: string) => {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'badge-danger';
    if (severity === 'MEDIUM') return 'badge-warning';
    return 'badge-info';
  };

  const handleActionClick = (notification: SystemNotification) => {
    onMarkAsRead(notification.id);
    onClose();
    if (notification.rule_name || notification.severity === 'HIGH' || notification.severity === 'CRITICAL') {
      onNavigate('alerts');
    } else {
      onNavigate('transactions');
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="willow-notif-dropdown animate-fade-in"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '430px',
        maxWidth: '92vw',
        maxHeight: '560px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.16), 0 0 1px 1px var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            Notifikasi Sistem & Fraud
          </span>
          {unreadCount > 0 ? (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {unreadCount} Baru
            </span>
          ) : (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              Semua Dibaca
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-blue)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px'
              }}
              title="Tandai semua sebagai telah dibaca"
            >
              Baca Semua
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px'
              }}
              title="Hapus riwayat notifikasi"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            background: activeFilter === 'all' ? 'var(--primary-blue)' : 'var(--bg-subtle)',
            color: activeFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Semua ({notifications.length})
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          style={{
            background: activeFilter === 'unread' ? 'var(--primary-blue)' : 'var(--bg-subtle)',
            color: activeFilter === 'unread' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Belum Dibaca ({unreadCount})
        </button>

        <button
          onClick={() => setActiveFilter('high')}
          style={{
            background: activeFilter === 'high' ? '#ef4444' : 'var(--bg-subtle)',
            color: activeFilter === 'high' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Bahaya / Tinggi ({highCount})
        </button>
      </div>

      {/* Notifications Scroll List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '400px',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheckIcon size={24} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              Tidak Ada Notifikasi Baru
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.4 }}>
              Seluruh transaksi elektronik dan parameter keamanan sistem beroperasi normal tanpa peringatan anomali.
            </span>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isHigh = notif.severity === 'HIGH' || notif.severity === 'CRITICAL';
            return (
              <div
                key={notif.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: notif.isRead ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  border: notif.isRead ? '1px solid var(--border-color)' : `1.5px solid ${isHigh ? '#fca5a5' : '#93c5fd'}`,
                  boxShadow: notif.isRead ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Header Item */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: isHigh ? '#fee2e2' : '#eff6ff',
                      color: isHigh ? '#dc2626' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isHigh ? <AlertTriangleIcon size={16} /> : <ShieldAlertIcon size={16} />}
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: notif.isRead ? 600 : 700,
                        color: 'var(--text-primary)',
                        display: 'block'
                      }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!notif.isRead && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        display: 'inline-block'
                      }} title="Belum dibaca" />
                    )}
                    <span className={`badge ${getSeverityBadgeClass(notif.severity)}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {notif.severity}
                    </span>
                  </div>
                </div>

                {/* DETAIL & ALASAN NOTIFIKASI */}
                <div style={{
                  backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.05)' : 'rgba(37, 99, 235, 0.04)',
                  borderLeft: `3px solid ${isHigh ? '#ef4444' : '#2563eb'}`,
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  lineHeight: 1.45,
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ fontWeight: 700, color: isHigh ? '#b91c1c' : '#1d4ed8', marginBottom: '2px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Penyebab / Detail Anomali:</span>
                  </div>
                  <div>{notif.reason}</div>
                </div>

                {/* METADATA CHIPS */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.7rem' }}>
                  {notif.transaction_id && (
                    <span style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      color: 'var(--text-secondary)'
                    }}>
                      #{notif.transaction_id}
                    </span>
                  )}
                  {notif.customer_id && (
                    <span style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)'
                    }}>
                      {notif.customer_id}
                    </span>
                  )}
                  {notif.amount !== undefined && notif.amount > 0 && (
                    <span style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      Rp {notif.amount.toLocaleString('id-ID')}
                    </span>
                  )}
                  {notif.channel && (
                    <span style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}>
                      {notif.channel}
                    </span>
                  )}
                  {notif.status && (
                    <span style={{
                      backgroundColor: notif.status === 'PENDING' ? '#fef3c7' : '#dcfce7',
                      color: notif.status === 'PENDING' ? '#92400e' : '#166534',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {notif.status}
                    </span>
                  )}
                </div>

                {/* Action Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  borderTop: '1px dashed var(--border-color)',
                  marginTop: '2px'
                }}>
                  <button
                    onClick={() => handleActionClick(notif)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-blue)',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 0'
                    }}
                  >
                    <span>Investigasi Tiket & Transaksi</span>
                    <span>→</span>
                  </button>

                  {!notif.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <CheckCircleIcon size={12} />
                      <span>Tandai Dibaca</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 18px',
        backgroundColor: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          SOC Monitoring • Pembaruan Real-Time
        </span>
        <button
          onClick={() => {
            onClose();
            onNavigate('alerts');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-blue)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Buka Halaman Fraud Alerts →
        </button>
      </div>
    </div>
  );
};
