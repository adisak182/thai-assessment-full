import { useState } from 'react';
import {
  NARATHIWAT_DISTRICT_NAMES,
  NARATHIWAT_SUBDISTRICTS_BY_DISTRICT,
  isStandardNarathiwatDistrict,
  isStandardNarathiwatSubdistrict,
  normalizeNarathiwatDistrict,
  normalizeNarathiwatSubdistrict,
} from '../utils/addressHelper';

const DEFAULT_INPUT_STYLE = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
};

const DEFAULT_LABEL_STYLE = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.88rem',
  fontWeight: '600',
  color: '#374151',
};

const RESCUE_BTN_STYLE = {
  marginTop: '6px',
  padding: '4px 10px',
  borderRadius: '8px',
  border: '1px solid #f59e0b',
  background: '#fffbeb',
  color: '#b45309',
  fontSize: '0.78rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

/**
 * Reusable cascading Province -> District (13 Narathiwat districts) -> Subdistrict (77 subdistricts) selector.
 * Supports custom fallback input for out-of-province records and shows one-click typo correction suggestions.
 */
export default function NarathiwatLocationFields({
  province = '',
  district = '',
  subdistrict = '',
  onChange,
  defaultProvince = 'นราธิวาส',
  required = false,
  labelPrefix = '',
  inputStyle = DEFAULT_INPUT_STYLE,
  labelStyle = DEFAULT_LABEL_STYLE,
}) {
  const effectiveProvince = province || '';
  const isCustomProvinceInitial = Boolean(effectiveProvince && effectiveProvince !== 'นราธิวาส');

  const [customProvinceMode, setCustomProvinceMode] = useState(isCustomProvinceInitial);
  const [customDistrictMode, setCustomDistrictMode] = useState(
    () => Boolean(district && effectiveProvince === 'นราธิวาส' && !isStandardNarathiwatDistrict(district))
  );
  const [customSubdistrictMode, setCustomSubdistrictMode] = useState(
    () => Boolean(subdistrict && district && isStandardNarathiwatDistrict(district) && !isStandardNarathiwatSubdistrict(subdistrict, district))
  );

  const isNarathiwat = !customProvinceMode && (effectiveProvince === 'นราธิวาส' || (!effectiveProvince && defaultProvince === 'นราธิวาส'));
  const subdistrictOptions = isStandardNarathiwatDistrict(district)
    ? (NARATHIWAT_SUBDISTRICTS_BY_DISTRICT[district] || [])
    : [];

  const suggestedDistrict = district && !isStandardNarathiwatDistrict(district) && isNarathiwat
    ? (() => {
        const cand = normalizeNarathiwatDistrict(district, 'นราธิวาส', { fuzzy: true });
        return isStandardNarathiwatDistrict(cand) ? cand : '';
      })()
    : '';

  const suggestedSubdistrict = subdistrict && isStandardNarathiwatDistrict(district) && !isStandardNarathiwatSubdistrict(subdistrict, district)
    ? (() => {
        const res = normalizeNarathiwatSubdistrict(subdistrict, district, 'นราธิวาส', { fuzzy: true });
        return isStandardNarathiwatSubdistrict(res.subdistrict, district) ? res.subdistrict : '';
      })()
    : '';

  const emit = (next) => {
    onChange({
      province: effectiveProvince || (isNarathiwat ? 'นราธิวาส' : ''),
      district,
      subdistrict,
      ...next,
    });
  };

  return (
    <div className="form-pair" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {/* ตำบล */}
      <div style={{ flex: '1 1 170px', minWidth: 0 }}>
        <label style={labelStyle}>
          {labelPrefix}ตำบล {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        {isNarathiwat && subdistrictOptions.length > 0 && !customSubdistrictMode ? (
          <select
            value={subdistrictOptions.includes(subdistrict) ? subdistrict : ''}
            required={required}
            onChange={e => {
              const val = e.target.value;
              if (val === '__custom__') {
                setCustomSubdistrictMode(true);
                emit({ subdistrict: '' });
              } else {
                emit({ subdistrict: val });
              }
            }}
            style={inputStyle}
          >
            <option value="">-- เลือกตำบล --</option>
            {subdistrictOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom__">อื่นๆ (พิมพ์ระบุเอง)</option>
          </select>
        ) : (
          <div>
            <input
              type="text"
              placeholder={subdistrictOptions.length > 0 ? 'พิมพ์ชื่อตำบล' : (district ? 'ระบุตำบล' : 'เลือกอำเภอก่อน หรือพิมพ์ตำบล')}
              value={subdistrict}
              required={required}
              onChange={e => emit({ subdistrict: e.target.value })}
              style={inputStyle}
            />
            {isNarathiwat && subdistrictOptions.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {suggestedSubdistrict && (
                  <button
                    type="button"
                    style={RESCUE_BTN_STYLE}
                    onClick={() => {
                      setCustomSubdistrictMode(false);
                      emit({ subdistrict: suggestedSubdistrict });
                    }}
                  >
                    แก้คำผิดเป็น "{suggestedSubdistrict}"
                  </button>
                )}
                <button
                  type="button"
                  style={{ ...RESCUE_BTN_STYLE, borderColor: '#cbd5e1', background: '#f8fafc', color: '#475569' }}
                  onClick={() => {
                    setCustomSubdistrictMode(false);
                    if (!subdistrictOptions.includes(subdistrict)) emit({ subdistrict: '' });
                  }}
                >
                  กลับเลือกจากรายการ
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* อำเภอ */}
      <div style={{ flex: '1 1 170px', minWidth: 0 }}>
        <label style={labelStyle}>
          {labelPrefix}อำเภอ {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        {isNarathiwat && !customDistrictMode ? (
          <select
            value={isStandardNarathiwatDistrict(district) ? district : ''}
            required={required}
            onChange={e => {
              const val = e.target.value;
              if (val === '__custom__') {
                setCustomDistrictMode(true);
                emit({ province: 'นราธิวาส', district: '', subdistrict: '' });
              } else {
                setCustomSubdistrictMode(false);
                const validSubs = NARATHIWAT_SUBDISTRICTS_BY_DISTRICT[val] || [];
                const nextSub = validSubs.includes(subdistrict) ? subdistrict : '';
                emit({ province: 'นราธิวาส', district: val, subdistrict: nextSub });
              }
            }}
            style={inputStyle}
          >
            <option value="">-- เลือกอำเภอ (13 แห่ง) --</option>
            {NARATHIWAT_DISTRICT_NAMES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
            <option value="__custom__">อื่นๆ (พิมพ์ระบุเอง)</option>
          </select>
        ) : (
          <div>
            <input
              type="text"
              placeholder="พิมพ์ชื่ออำเภอ"
              value={district}
              required={required}
              onChange={e => emit({ district: e.target.value })}
              style={inputStyle}
            />
            {isNarathiwat && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {suggestedDistrict && (
                  <button
                    type="button"
                    style={RESCUE_BTN_STYLE}
                    onClick={() => {
                      setCustomDistrictMode(false);
                      emit({ province: 'นราธิวาส', district: suggestedDistrict });
                    }}
                  >
                    แก้คำผิดเป็น "{suggestedDistrict}"
                  </button>
                )}
                <button
                  type="button"
                  style={{ ...RESCUE_BTN_STYLE, borderColor: '#cbd5e1', background: '#f8fafc', color: '#475569' }}
                  onClick={() => {
                    setCustomDistrictMode(false);
                    if (!isStandardNarathiwatDistrict(district)) emit({ province: 'นราธิวาส', district: '', subdistrict: '' });
                  }}
                >
                  กลับเลือก 13 อำเภอ
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* จังหวัด */}
      <div style={{ flex: '1 1 150px', minWidth: 0 }}>
        <label style={labelStyle}>
          {labelPrefix}จังหวัด {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        {!customProvinceMode ? (
          <select
            value={isNarathiwat ? 'นราธิวาส' : ''}
            required={required}
            onChange={e => {
              const val = e.target.value;
              if (val === '__other__') {
                setCustomProvinceMode(true);
                setCustomDistrictMode(true);
                setCustomSubdistrictMode(true);
                emit({ province: '', district: '', subdistrict: '' });
              } else {
                emit({ province: val });
              }
            }}
            style={inputStyle}
          >
            <option value="นราธิวาส">นราธิวาส</option>
            <option value="__other__">อื่นๆ / ต่างจังหวัด</option>
          </select>
        ) : (
          <div>
            <input
              type="text"
              placeholder="พิมพ์ชื่อจังหวัด"
              value={province}
              required={required}
              onChange={e => emit({ province: e.target.value })}
              style={inputStyle}
            />
            <button
              type="button"
              style={{ ...RESCUE_BTN_STYLE, borderColor: '#cbd5e1', background: '#f8fafc', color: '#475569' }}
              onClick={() => {
                setCustomProvinceMode(false);
                setCustomDistrictMode(false);
                setCustomSubdistrictMode(false);
                emit({ province: 'นราธิวาส', district: '', subdistrict: '' });
              }}
            >
              เลือก นราธิวาส
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

