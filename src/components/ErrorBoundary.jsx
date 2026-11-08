import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      window.sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          backgroundColor: '#f5f3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          fontFamily: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#1f2937'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 12px 30px -4px rgba(76, 29, 149, 0.15)',
            border: '1px solid rgba(126, 34, 206, 0.2)',
            padding: '32px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              margin: '0 auto 20px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(76, 29, 149, 0.15)'
            }}>
              <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '16px'
            }}>
              <AlertTriangle size={18} />
              <span>เกิดข้อผิดพลาดในการโหลดหน้าจอ</span>
            </div>

            <h2 style={{
              color: '#4c1d95',
              fontSize: '1.4rem',
              margin: '0 0 10px',
              fontWeight: 700
            }}>
              ขออภัยในความไม่สะดวก
            </h2>

            <p style={{
              color: '#4b5563',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              margin: '0 0 24px'
            }}>
              ระบบพบปัญหาชั่วคราวในการประมวลผลข้อมูลหน้าจอ กรุณากดปุ่มด้านล่างเพื่อลองใหม่อีกครั้ง
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#5b21b6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(91, 33, 182, 0.3)'
                }}
              >
                <RefreshCw size={18} />
                <span>รีโหลดหน้านี้ใหม่</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#ede9fe',
                  color: '#5b21b6',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Home size={18} />
                <span>กลับสู่หน้าแรก</span>
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280' }}>
                <summary style={{ cursor: 'pointer', color: '#7c3aed' }}>ดูรายละเอียดข้อผิดพลาด (Technical info)</summary>
                <pre style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {String(this.state.error?.stack || this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

