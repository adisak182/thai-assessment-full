import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Lock, RefreshCw, Home, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getExamStatus } from '../services/api';
import { formatThaiDateTime } from '../utils/examSchedule';

function formatCountdown(ms) {
  if (!ms || ms <= 0) return '0 วินาที';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const parts = [];
  if (days > 0) parts.push(`${days} วัน`);
  if (hours > 0 || days > 0) parts.push(`${hours} ชั่วโมง`);
  if (mins > 0 || hours > 0 || days > 0) parts.push(`${mins} นาที`);
  parts.push(`${secs} วินาที`);
  return parts.join(' ');
}

export default function ExamAccessGate({ children }) {
  const { token, user } = useUser();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [tickNow, setTickNow] = useState(() => Date.now());

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getExamStatus(token);
      setStatus(data);
    } catch (err) {
      setFetchError(err.message || 'ไม่สามารถตรวจสอบเวลาเปิด-ปิดระบบสอบได้');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Live countdown ticker when waiting for open_at or approaching close_at
  useEffect(() => {
    if (!status || (status.status !== 'scheduled_waiting' && status.status !== 'scheduled_open')) {
      return undefined;
    }
    const id = setInterval(() => setTickNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Auto re-check once scheduled open_at arrives
  useEffect(() => {
    if (status?.status === 'scheduled_waiting' && status.open_at) {
      if (tickNow >= new Date(status.open_at).getTime()) {
        checkStatus();
      }
    }
  }, [tickNow, status, checkStatus]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} /> กำลังตรวจสอบเวลาเปิด-ปิดระบบสอบ...
        </div>
      </div>
    );
  }

  // If status check failed transiently, don't crash UI — let backend /score enforce if needed
  if (fetchError || !status) {
    return children;
  }

  const isAdminUser = user?.role === 'admin';
  const effectiveOpen = status.isOpen || (isAdminUser && status.allow_admin_bypass);

  if (!effectiveOpen) {
    const waitMs = status.open_at ? Math.max(0, new Date(status.open_at).getTime() - tickNow) : 0;
    const title =
      status.status === 'scheduled_waiting'
        ? 'ยังไม่ถึงเวลาเปิดระบบทำข้อสอบ'
        : (status.status === 'scheduled_ended' ? 'หมดเวลาทำข้อสอบแล้ว' : 'ปิดระบบทำข้อสอบชั่วคราว');

    return (
      <div style={{ minHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div
          className="glass-panel"
          style={{
            maxWidth: '560px',
            width: '100%',
            padding: '36px 28px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 18px',
              borderRadius: '50%',
              background: status.status === 'scheduled_waiting' ? '#fef3c7' : '#fee2e2',
              color: status.status === 'scheduled_waiting' ? '#b45309' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {status.status === 'scheduled_waiting' ? <Clock size={34} /> : <Lock size={34} />}
          </div>

          <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
          <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '0.98rem', lineHeight: 1.65 }}>
            {status.closed_message || status.reason}
          </p>

          {(status.open_at || status.close_at) && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '0.88rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {status.open_at && (
                <div><strong>เวลาเปิดระบบ:</strong> {formatThaiDateTime(status.open_at)}</div>
              )}
              {status.close_at && (
                <div><strong>เวลาปิดระบบ:</strong> {formatThaiDateTime(status.close_at)}</div>
              )}
              {status.status === 'scheduled_waiting' && waitMs > 0 && (
                <div style={{ color: '#b45309', fontWeight: 700, marginTop: '4px' }}>
                  จะเปิดระบบในอีก: {formatCountdown(waitMs)}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={checkStatus}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 18px', borderRadius: '12px' }}
            >
              <RefreshCw size={16} /> ตรวจสอบอีกครั้ง
            </button>
            <Link
              to="/dashboard"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 18px', borderRadius: '12px', textDecoration: 'none' }}
            >
              <LayoutDashboard size={16} /> ดูผลสอบของฉัน
            </Link>
            <Link
              to="/"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 18px', borderRadius: '12px', textDecoration: 'none' }}
            >
              <Home size={16} /> กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const remainingMs = status.close_at ? Math.max(0, new Date(status.close_at).getTime() - tickNow) : null;
  const nearClose = remainingMs !== null && remainingMs > 0 && remainingMs <= 15 * 60 * 1000;

  return (
    <>
      {status.bypassedByAdmin && (
        <div
          style={{
            background: '#eef2ff',
            borderBottom: '1px solid #c7d2fe',
            color: '#3730a3',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={16} /> โหมดผู้ดูแลระบบ: กำลังเข้าดูข้อสอบแม้ระบบกำลังปิดสำหรับผู้เรียน ({status.reason})
        </div>
      )}
      {!status.bypassedByAdmin && status.mode === 'scheduled' && status.close_at && (
        <div
          style={{
            background: nearClose ? '#fffbeb' : '#f8fafc',
            borderBottom: `1px solid ${nearClose ? '#fcd34d' : '#e2e8f0'}`,
            color: nearClose ? '#92400e' : '#475569',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '0.84rem',
            fontWeight: nearClose ? 700 : 500,
          }}
        >
          {nearClose
            ? `⚠️ ระบบจะปิดรับคำตอบในอีก ${formatCountdown(remainingMs)} (ปิดเวลา ${formatThaiDateTime(status.close_at)})`
            : `เปิดให้ทำข้อสอบตามกำหนดเวลา จนถึง ${formatThaiDateTime(status.close_at)}`}
        </div>
      )}
      {children}
    </>
  );
}
