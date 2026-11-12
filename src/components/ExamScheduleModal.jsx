import { useEffect, useMemo, useState } from 'react';
import ModalPortal from './ModalPortal';
import { Clock, CheckCircle, Lock, Calendar, X, Save } from 'lucide-react';
import { getAdminExamSettings, updateAdminExamSettings } from '../services/api';
import {
  DEFAULT_CLOSED_MESSAGE,
  evaluateExamWindow,
  formatThaiDateTime,
  validateExamScheduleInput,
} from '../utils/examSchedule';

function toLocalDateTimeInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ExamScheduleModal({ token, initialStatus = null, onSaved, onClose }) {
  const [mode, setMode] = useState(initialStatus?.mode || 'always_open');
  const [openAtInput, setOpenAtInput] = useState(toLocalDateTimeInput(initialStatus?.open_at));
  const [closeAtInput, setCloseAtInput] = useState(toLocalDateTimeInput(initialStatus?.close_at));
  const [closedMessage, setClosedMessage] = useState(initialStatus?.closed_message || DEFAULT_CLOSED_MESSAGE);
  const [allowAdminBypass, setAllowAdminBypass] = useState(initialStatus?.allow_admin_bypass !== false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    let active = true;
    getAdminExamSettings(token)
      .then(data => {
        if (!active || !data) return;
        setMode(data.mode || 'always_open');
        setOpenAtInput(toLocalDateTimeInput(data.open_at));
        setCloseAtInput(toLocalDateTimeInput(data.close_at));
        setClosedMessage(data.closed_message || DEFAULT_CLOSED_MESSAGE);
        setAllowAdminBypass(data.allow_admin_bypass !== false);
      })
      .catch(err => {
        if (active) setError(err.message || 'โหลดการตั้งค่าไม่สำเร็จ');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  const previewEvaluation = useMemo(() => {
    const draft = {
      mode,
      open_at: openAtInput ? new Date(openAtInput).toISOString() : null,
      close_at: closeAtInput ? new Date(closeAtInput).toISOString() : null,
      closed_message: closedMessage,
      allow_admin_bypass: allowAdminBypass,
    };
    return evaluateExamWindow(draft, new Date(), { isAdmin: false });
  }, [mode, openAtInput, closeAtInput, closedMessage, allowAdminBypass]);

  const applyPreset = (preset) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    if (preset === 'today_workhours') {
      start.setHours(8, 0, 0, 0);
      end.setHours(17, 0, 0, 0);
    } else if (preset === 'now_to_midnight') {
      end.setHours(23, 59, 0, 0);
    } else if (preset === 'seven_days') {
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 0, 0);
    }
    setMode('scheduled');
    setOpenAtInput(toLocalDateTimeInput(start.toISOString()));
    setCloseAtInput(toLocalDateTimeInput(end.toISOString()));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSavedMsg('');

    const payload = {
      mode,
      open_at: openAtInput ? new Date(openAtInput).toISOString() : null,
      close_at: closeAtInput ? new Date(closeAtInput).toISOString() : null,
      closed_message: closedMessage.trim() || DEFAULT_CLOSED_MESSAGE,
      allow_admin_bypass: allowAdminBypass,
    };

    const clientCheck = validateExamScheduleInput(payload);
    if (clientCheck.error) {
      setError(clientCheck.error);
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminExamSettings(token, payload);
      setSavedMsg('บันทึกเวลาเปิด-ปิดการทำข้อสอบเรียบร้อยแล้ว');
      if (onSaved && res?.status) onSaved(res.status);
    } catch (err) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal label="ตั้งเวลาเปิด-ปิดการทำข้อสอบ" onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card exam-schedule-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <p className="admin-eyebrow">ควบคุมช่วงเวลาเข้าทำข้อสอบ · นรารู้ไทย</p>
              <h3>ตั้งเวลาเปิด-ปิด การทำข้อสอบ</h3>
              <p className="admin-muted">
                กำหนดช่วงเวลาที่ผู้เรียนสามารถเข้าทำแบบทดสอบและส่งคำตอบได้ (อ้างอิงเวลาเซิร์ฟเวอร์)
              </p>
            </div>
            <button type="button" className="modal-close" aria-label="ปิด" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <p className="admin-muted">กำลังโหลดการตั้งค่า...</p>
          ) : (
            <form onSubmit={handleSave} className="schedule-form">
              {error && <div className="admin-error" role="alert">{error}</div>}
              {savedMsg && <div className="schedule-saved-banner"><CheckCircle size={16} /> {savedMsg}</div>}

              {/* Preview Status Pill */}
              <div className={`schedule-preview-bar ${previewEvaluation.rawOpen ? 'open' : 'closed'}`}>
                {previewEvaluation.rawOpen ? <CheckCircle size={18} /> : <Lock size={18} />}
                <div>
                  <strong>สถานะสำหรับผู้เรียน (จากค่าที่เลือก): {previewEvaluation.rawOpen ? 'เปิดให้ทำข้อสอบ' : 'ปิดการทำข้อสอบ'}</strong>
                  <div>{previewEvaluation.reason}</div>
                </div>
              </div>

              {/* 3 Mode Options */}
              <div className="schedule-modes">
                <button
                  type="button"
                  aria-pressed={mode === 'always_open'}
                  onClick={() => setMode('always_open')}
                >
                  <CheckCircle size={18} />
                  <span>
                    <strong>เปิดตลอดเวลา</strong>
                    <small>ผู้เรียนทำข้อสอบได้ทุกเวลา</small>
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={mode === 'scheduled'}
                  onClick={() => setMode('scheduled')}
                >
                  <Calendar size={18} />
                  <span>
                    <strong>กำหนดเวลาเปิด–ปิด</strong>
                    <small>เปิดเฉพาะช่วงวันเวลาที่ระบุ</small>
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={mode === 'closed'}
                  onClick={() => setMode('closed')}
                >
                  <Lock size={18} />
                  <span>
                    <strong>ปิดชั่วคราวทันที</strong>
                    <small>งดการทำข้อสอบทุกทักษะ</small>
                  </span>
                </button>
              </div>

              {mode === 'scheduled' && (
                <div className="schedule-datetime-box">
                  <div className="schedule-presets">
                    <span>ตั้งค่าด่วน:</span>
                    <button type="button" onClick={() => applyPreset('today_workhours')}>วันนี้ 08:00–17:00</button>
                    <button type="button" onClick={() => applyPreset('now_to_midnight')}>ตอนนี้–เที่ยงคืน</button>
                    <button type="button" onClick={() => applyPreset('seven_days')}>เปิด 7 วัน</button>
                  </div>

                  <div className="schedule-datetime-grid">
                    <label>
                      <span><Clock size={14} /> วันเวลาเปิดระบบ</span>
                      <input
                        type="datetime-local"
                        value={openAtInput}
                        onChange={e => setOpenAtInput(e.target.value)}
                      />
                      <small>{openAtInput ? formatThaiDateTime(new Date(openAtInput)) : 'ไม่จำกัดเวลาเริ่มต้น'}</small>
                    </label>

                    <label>
                      <span><Clock size={14} /> วันเวลาปิดระบบ</span>
                      <input
                        type="datetime-local"
                        value={closeAtInput}
                        onChange={e => setCloseAtInput(e.target.value)}
                      />
                      <small>{closeAtInput ? formatThaiDateTime(new Date(closeAtInput)) : 'ไม่จำกัดเวลาสิ้นสุด'}</small>
                    </label>
                  </div>
                </div>
              )}

              <label className="schedule-msg-field">
                <span>ข้อความแจ้งผู้เรียนเมื่อปิดระบบสอบ</span>
                <textarea
                  rows={2}
                  value={closedMessage}
                  onChange={e => setClosedMessage(e.target.value)}
                  placeholder={DEFAULT_CLOSED_MESSAGE}
                />
              </label>

              <label className="schedule-bypass-check">
                <input
                  type="checkbox"
                  checked={allowAdminBypass}
                  onChange={e => setAllowAdminBypass(e.target.checked)}
                />
                <span>อนุญาตให้ผู้ดูแลระบบ (Admin) เข้าทดสอบทำข้อสอบได้แม้ระบบปิดอยู่</span>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  ปิดหน้าต่าง
                </button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าเวลา'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
