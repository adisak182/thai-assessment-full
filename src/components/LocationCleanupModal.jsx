import { useMemo, useState } from 'react';
import ModalPortal from './ModalPortal';
import {
  NARATHIWAT_DISTRICT_NAMES,
  NARATHIWAT_SUBDISTRICTS_BY_DISTRICT,
  detectLocationAnomalies,
} from '../utils/addressHelper';
import { AlertTriangle, CheckCircle, Sparkles, Wand2, X } from 'lucide-react';

export default function LocationCleanupModal({
  users = [],
  surveys = [],
  onClose,
  onApplyNormalization,
  busy = false,
}) {
  const anomalies = useMemo(
    () => detectLocationAnomalies(users, surveys),
    [users, surveys]
  );

  const [edits, setEdits] = useState({});

  const getChoice = (item) => {
    const saved = edits[item.key];
    if (saved) return saved;
    return {
      targetDistrict: item.suggestedDistrict || item.districtContext || '',
      toValue: item.suggestedValue || '',
    };
  };

  const setChoice = (item, patch) => {
    setEdits(prev => ({
      ...prev,
      [item.key]: {
        ...getChoice(item),
        ...patch,
      },
    }));
  };

  const readyBatchOps = useMemo(() => {
    return anomalies
      .map(item => {
        const saved = edits[item.key];
        const c = saved || {
          targetDistrict: item.suggestedDistrict || item.districtContext || '',
          toValue: item.suggestedValue || '',
        };
        if (!c.toValue) return null;
        return {
          field: item.field,
          fromValue: item.rawValue,
          toValue: c.toValue,
          districtFilter: item.field === 'subdistrict' ? item.districtContext : '',
          targetDistrict: item.field === 'subdistrict' ? (c.targetDistrict || item.districtContext || '') : '',
          targetProvince: 'นราธิวาส',
        };
      })
      .filter(Boolean);
  }, [anomalies, edits]);

  const handleApplySingle = (item) => {
    const c = getChoice(item);
    if (!c.toValue) return;
    onApplyNormalization({
      operations: [
        {
          field: item.field,
          fromValue: item.rawValue,
          toValue: c.toValue,
          districtFilter: item.field === 'subdistrict' ? item.districtContext : '',
          targetDistrict: item.field === 'subdistrict' ? (c.targetDistrict || item.districtContext || '') : '',
          targetProvince: 'นราธิวาส',
        },
      ],
    });
  };

  const handleApplyAllReady = () => {
    if (!readyBatchOps.length) return;
    onApplyNormalization({ operations: readyBatchOps });
  };

  return (
    <ModalPortal label="จัดการชื่ออำเภอและตำบลที่พิมพ์ผิด" onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-card analytics-cleanup-modal"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <p className="admin-eyebrow">เครื่องมือปรับมาตรฐานข้อมูลพื้นที่ · จังหวัดนราธิวาส</p>
              <h3>ตรวจสอบและรวมชื่ออำเภอ / ตำบลที่พิมพ์ผิด</h3>
              <p className="admin-muted">
                ตรวจพบรายชื่อที่ไม่อยู่ในมาตรฐาน 13 อำเภอ / 77 ตำบล และอัปเดตทั้งบัญชีผู้ใช้กับแบบประเมินให้ตรงกัน
              </p>
            </div>
            <button type="button" className="modal-close" aria-label="ปิด" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {anomalies.length === 0 ? (
            <div className="cleanup-empty-state">
              <CheckCircle size={40} color="#059669" />
              <strong>ไม่พบชื่ออำเภอหรือตำบลที่พิมพ์ผิดในข้อมูลปัจจุบัน</strong>
              <p>ข้อมูลพื้นที่ทั้งหมดตรงตามรายชื่อมาตรฐานจังหวัดนราธิวาสแล้ว</p>
            </div>
          ) : (
            <>
              <div className="cleanup-banner">
                <div>
                  <AlertTriangle size={18} color="#d97706" />
                  <span>
                    พบข้อมูลพื้นที่ที่ไม่อยู่ในรายชื่อมาตรฐาน <strong>{anomalies.length}</strong> รายการ
                    (จับคู่ชื่อมาตรฐานได้แล้ว {readyBatchOps.length} รายการ)
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-primary cleanup-batch-btn"
                  disabled={busy || readyBatchOps.length === 0}
                  onClick={handleApplyAllReady}
                >
                  <Sparkles size={16} />
                  {busy ? 'กำลังปรับปรุง...' : `แก้ไขทั้งหมดที่เลือกแล้ว (${readyBatchOps.length})`}
                </button>
              </div>

              <div className="analytics-table-wrap cleanup-table-wrap">
                <table className="analytics-table cleanup-table">
                  <thead>
                    <tr>
                      <th>ประเภท</th>
                      <th>คำที่พบในระบบ (พิมพ์ผิด/ไม่มาตรฐาน)</th>
                      <th className="num">จำนวนที่พบ</th>
                      <th>เปลี่ยนเป็นชื่อมาตรฐาน</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map(item => {
                      const choice = getChoice(item);
                      const isSub = item.field === 'subdistrict';
                      const subOptions = isSub && choice.targetDistrict
                        ? (NARATHIWAT_SUBDISTRICTS_BY_DISTRICT[choice.targetDistrict] || [])
                        : [];

                      return (
                        <tr key={item.key}>
                          <td>
                            <span className={`analytics-pill ${isSub ? 'blue' : 'amber'}`}>
                              {isSub ? 'ตำบล' : 'อำเภอ'}
                            </span>
                          </td>
                          <td>
                            <strong className="text-rose">{item.rawValue}</strong>
                            {isSub && item.districtContext && (
                              <div className="sub-meta">ในอำเภอ: {item.districtContext}</div>
                            )}
                          </td>
                          <td className="num">
                            <strong>{item.totalCount}</strong>
                            <div className="sub-meta">
                              ผู้ใช้ {item.userCount} · แบบประเมิน {item.surveyCount}
                            </div>
                          </td>
                          <td>
                            {isSub ? (
                              <div className="cleanup-selectors">
                                <select
                                  value={choice.targetDistrict}
                                  onChange={e => setChoice(item, { targetDistrict: e.target.value, toValue: '' })}
                                >
                                  <option value="">-- เลือกอำเภอ --</option>
                                  {NARATHIWAT_DISTRICT_NAMES.map(d => (
                                    <option key={d} value={d}>อ.{d}</option>
                                  ))}
                                </select>
                                <select
                                  value={choice.toValue}
                                  disabled={!choice.targetDistrict}
                                  onChange={e => setChoice(item, { toValue: e.target.value })}
                                >
                                  <option value="">-- เลือกตำบลมาตรฐาน --</option>
                                  {subOptions.map(s => (
                                    <option key={s} value={s}>ต.{s}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <select
                                className="cleanup-single-select"
                                value={choice.toValue}
                                onChange={e => setChoice(item, { toValue: e.target.value })}
                              >
                                <option value="">-- เลือกอำเภอมาตรฐาน --</option>
                                {NARATHIWAT_DISTRICT_NAMES.map(d => (
                                  <option key={d} value={d}>อ.{d}</option>
                                ))}
                              </select>
                            )}
                            {item.suggestedValue && choice.toValue === item.suggestedValue && (
                              <div className="cleanup-suggest-note">
                                <Wand2 size={12} /> ระบบแนะนำอัตโนมัติ
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="analytics-mini-btn"
                              disabled={busy || !choice.toValue}
                              onClick={() => handleApplySingle(item)}
                            >
                              รวมเป็นชื่อนี้
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
