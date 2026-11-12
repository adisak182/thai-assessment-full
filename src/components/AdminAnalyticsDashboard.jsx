import { useMemo, useState } from 'react';
import ModalPortal from './ModalPortal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
  Users, Award, CheckCircle, MapPin, FileSpreadsheet, Filter, RotateCcw,
  Eye, ClipboardList, Search, TrendingUp, Layers, FileDown, X, UserCheck,
  AlertCircle, BookOpen, ShieldCheck
} from 'lucide-react';
import {
  SKILL_META,
  NARATHIWAT_DISTRICT_NAMES,
  enrichAnalyticsData,
  getAreaFilterOptions,
  filterAnalyticsData,
  aggregateByArea,
  buildAnalyticsSummary,
  buildProvinceOverviewCsv,
  buildAreaSummaryCsv,
  buildLearnersCsv,
  buildWorkbookSheetsForTarget,
} from '../utils/adminAnalytics';
import { NAME_PREFIXES } from '../utils/namePrefix';
import { buildHistoryCsv } from '../utils/csvExport';
import { buildXlsxWorkbook } from '../utils/xlsxExport';

const SKILL_LABELS = {
  full_test: 'แบบทดสอบรวม 100 ข้อ',
  listening: 'การฟัง',
  conversation: 'การพูด',
  speaking: 'การพูด',
  reading: 'การอ่าน',
  writing: 'การเขียน',
};

const DETAIL_PAGE_SIZE = 25;

function SkillBadge({ skill }) {
  if (!skill || !skill.assessed) {
    return (
      <span className="analytics-skill-cell muted">
        {skill?.pending ? 'รอตรวจ' : '—'}
      </span>
    );
  }
  return (
    <div className="analytics-skill-cell">
      <strong>{skill.score}/{skill.max}</strong>
      <span className={`analytics-pill ${skill.passed ? 'green' : 'red'}`}>
        {skill.passed ? 'ผ่าน' : 'ไม่ผ่าน'} ({skill.pct}%)
      </span>
    </div>
  );
}

function AreaBreakdownTable({
  title,
  subtitle,
  rows,
  mode,
  selectedDistrict,
  selectedSubdistrict,
  onSelectRow,
  onExportCsv,
  onExportExcel,
}) {
  const isSub = mode === 'subdistrict';
  return (
    <section className="analytics-panel">
      <div className="analytics-panel-header">
        <div>
          <h3>{title}</h3>
          <p className="admin-muted">{subtitle}</p>
        </div>
        <div className="analytics-panel-export-group">
          <button type="button" className="analytics-export-btn excel" onClick={onExportExcel}>
            <FileDown size={15} /> Excel (.xlsx)
          </button>
          <button type="button" className="analytics-export-btn" onClick={onExportCsv}>
            <FileSpreadsheet size={15} /> CSV ({rows.length})
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="admin-empty">ไม่มีข้อมูลพื้นที่ตามเงื่อนไขที่เลือก</p>
      ) : (
        <div className="analytics-table-wrap">
          <table className="analytics-table analytics-area-table">
            <thead>
              <tr>
                {isSub && <th>ตำบล</th>}
                <th>{isSub ? 'อำเภอ' : 'อำเภอ (13 แห่ง)'}</th>
                {!isSub && <th className="num">ตำบล</th>}
                <th className="num">ผู้เรียน</th>
                <th className="num">ชาย</th>
                <th className="num">หญิง</th>
                <th className="num">ประเมินครบ 4 ทักษะ</th>
                <th className="num">ยังไม่ครบ</th>
                <th className="num">ผ่าน (≥70%)</th>
                <th className="num">ไม่ผ่าน</th>
                <th className="num">อัตราผ่าน</th>
                <th className="num">ฟัง (ผ่าน/สอบ)</th>
                <th className="num">พูด (ผ่าน/สอบ)</th>
                <th className="num">อ่าน (ผ่าน/สอบ)</th>
                <th className="num">เขียน (ผ่าน/สอบ)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isSelected = isSub
                  ? selectedSubdistrict === row.subdistrict && (selectedDistrict === 'all' || selectedDistrict === row.district)
                  : selectedDistrict === row.district;
                const sk = row.skillStats || {};
                const renderSkillCell = (key) => {
                  const s = sk[key];
                  if (!s || !s.assessed) return '—';
                  return (
                    <span>
                      <strong>{s.passed}</strong>/{s.assessed} <small>({s.passRate}%)</small>
                    </span>
                  );
                };
                return (
                  <tr
                    key={row.key}
                    onClick={() => onSelectRow(row)}
                    className={isSelected ? 'selected-row' : 'clickable-row'}
                    title={isSub ? 'คลิกเพื่อกรองดูรายชื่อในตำบลนี้' : 'คลิกเพื่อดูข้อมูลระดับตำบลในอำเภอนี้'}
                  >
                    {isSub && <td className="area-primary">{row.subdistrict}</td>}
                    <td className={isSub ? '' : 'area-primary'}>{row.district}</td>
                    {!isSub && <td className="num">{row.subdistrictCount}</td>}
                    <td className="num"><strong>{row.learnerCount}</strong></td>
                    <td className="num">{row.maleCount ?? 0}</td>
                    <td className="num">{row.femaleCount ?? 0}</td>
                    <td className="num text-blue">{row.completed4Count ?? 0}</td>
                    <td className="num text-amber">{row.incomplete4Count ?? 0}</td>
                    <td className="num text-green">{row.passedLearnerCount ?? 0}</td>
                    <td className="num text-rose">{row.failedLearnerCount ?? row.notPassedLearnerCount ?? 0}</td>
                    <td className="num">
                      {row.exactPassRate === null && row.passRate === null ? '—' : (
                        <span className={`analytics-pill ${(row.exactPassRate ?? row.passRate) >= 70 ? 'green' : (row.exactPassRate ?? row.passRate) >= 50 ? 'amber' : 'red'}`}>
                          {row.exactPassRate ?? row.passRate}%
                        </span>
                      )}
                    </td>
                    <td className="num">{renderSkillCell('listening')}</td>
                    <td className="num">{renderSkillCell('speaking')}</td>
                    <td className="num">{renderSkillCell('reading')}</td>
                    <td className="num">{renderSkillCell('writing')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminAnalyticsDashboard({
  users = [],
  history = [],
  surveys = [],
  loading = false,
  formatDate,
  onDownloadCsv,
  onDownloadExcel,
  onInspectUser,
  onInspectAttempt,
}) {
  // Default focus: literacy learners (ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ) at province level
  const [areaLevel, setAreaLevel] = useState('province'); // 'province' | 'district' | 'subdistrict'
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subdistrictFilter, setSubdistrictFilter] = useState('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState('literacy'); // 'literacy' | 'all' | 'other'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'ชาย' | 'หญิง' | 'ไม่ระบุ'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'passed' | 'failed' | 'incomplete'
  const [prefixFilter, setPrefixFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [detailSearch, setDetailSearch] = useState('');

  const [skillChartMode, setSkillChartMode] = useState('passFail'); // 'passFail' | 'gender'
  const [districtChartMode, setDistrictChartMode] = useState('counts'); // 'counts' | 'gender' | 'passRate'
  const [subdistrictChartMode, setSubdistrictChartMode] = useState('counts'); // 'counts' | 'gender' | 'passRate'
  const [detailMode, setDetailMode] = useState('learners'); // 'learners' | 'attempts'
  const [detailPage, setDetailPage] = useState(1);
  const [inspectedLearner, setInspectedLearner] = useState(null);

  const enriched = useMemo(
    () => enrichAnalyticsData({ users, history, surveys }),
    [users, history, surveys]
  );

  const areaOptions = useMemo(
    () => getAreaFilterOptions(enriched.learners, enriched.attempts, districtFilter, {
      includeAllNarathiwatDistricts: true,
    }),
    [enriched.learners, enriched.attempts, districtFilter]
  );

  const filtered = useMemo(
    () => filterAnalyticsData(enriched, {
      district: districtFilter,
      subdistrict: subdistrictFilter,
      enrollment: enrollmentFilter,
      gender: genderFilter,
      assessmentStatus: statusFilter,
      prefix: prefixFilter,
      search: detailSearch,
      dateRange,
    }),
    [
      enriched,
      districtFilter,
      subdistrictFilter,
      enrollmentFilter,
      genderFilter,
      statusFilter,
      prefixFilter,
      detailSearch,
      dateRange,
    ]
  );

  const summary = useMemo(
    () => buildAnalyticsSummary(filtered.learners, filtered.attempts),
    [filtered.learners, filtered.attempts]
  );

  const districtRows = useMemo(
    () => aggregateByArea(filtered.learners, filtered.attempts, 'district', {
      includeAllNarathiwatDistricts: districtFilter === 'all' && areaLevel !== 'subdistrict',
    }),
    [filtered.learners, filtered.attempts, districtFilter, areaLevel]
  );

  const subdistrictRows = useMemo(
    () => aggregateByArea(filtered.learners, filtered.attempts, 'subdistrict'),
    [filtered.learners, filtered.attempts]
  );

  const districtChartData = useMemo(
    () => districtRows.slice(0, 15),
    [districtRows]
  );

  const subdistrictChartData = useMemo(
    () => subdistrictRows.slice(0, 15),
    [subdistrictRows]
  );

  const activeRows = detailMode === 'learners' ? filtered.learners : filtered.attempts;
  const detailPageCount = Math.max(1, Math.ceil(activeRows.length / DETAIL_PAGE_SIZE));
  const currentDetailPage = Math.min(detailPage, detailPageCount);
  const pagedDetailRows = activeRows.slice(
    (currentDetailPage - 1) * DETAIL_PAGE_SIZE,
    currentDetailPage * DETAIL_PAGE_SIZE
  );

  const handleAreaLevelChange = (level) => {
    setAreaLevel(level);
    if (level === 'province' || level === 'district') {
      setSubdistrictFilter('all');
      if (level === 'province') setDistrictFilter('all');
    }
    setDetailPage(1);
  };

  const handleDistrictChange = (val) => {
    setDistrictFilter(val);
    setSubdistrictFilter('all');
    if (val !== 'all' && areaLevel === 'province') {
      setAreaLevel('subdistrict');
    }
    setDetailPage(1);
  };

  const resetAllFilters = () => {
    setAreaLevel('province');
    setDistrictFilter('all');
    setSubdistrictFilter('all');
    setEnrollmentFilter('literacy');
    setGenderFilter('all');
    setStatusFilter('all');
    setPrefixFilter('all');
    setDateRange('all');
    setDetailSearch('');
    setDetailPage(1);
  };

  const dateTag = new Date().toISOString().slice(0, 10);

  const activeFilterSummaryText = useMemo(() => {
    const parts = [
      enrollmentFilter === 'literacy'
        ? 'กลุ่ม: ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ'
        : (enrollmentFilter === 'other' ? 'กลุ่ม: บุคคลทั่วไป' : 'กลุ่ม: ผู้เรียนทั้งหมด'),
      districtFilter === 'all' ? 'จังหวัดนราธิวาส (ทุกอำเภอ)' : `อำเภอ: ${districtFilter}`,
      subdistrictFilter !== 'all' ? `ตำบล: ${subdistrictFilter}` : null,
      genderFilter !== 'all' ? `เพศ: ${genderFilter}` : null,
      statusFilter === 'passed'
        ? 'สถานะ: ผ่าน'
        : (statusFilter === 'failed' ? 'สถานะ: ไม่ผ่าน' : (statusFilter === 'incomplete' ? 'สถานะ: ยังไม่ครบ' : null)),
      prefixFilter !== 'all' ? `คำนำหน้า: ${prefixFilter}` : null,
      detailSearch.trim() ? `คำค้นหา: "${detailSearch.trim()}"` : null,
    ].filter(Boolean);
    return parts.join(' | ');
  }, [enrollmentFilter, districtFilter, subdistrictFilter, genderFilter, statusFilter, prefixFilter, detailSearch]);

  const exportExcel = (target, baseFilename) => {
    const sheets = buildWorkbookSheetsForTarget(target, {
      summary,
      districtRows,
      subdistrictRows,
      learners: filtered.learners,
      formatDate,
      filtersMeta: {
        description: activeFilterSummaryText,
        exportedAt: new Date().toLocaleString('th-TH'),
      },
    });
    const bytes = buildXlsxWorkbook(sheets);
    const filename = `${baseFilename}_${dateTag}.xlsx`;
    if (onDownloadExcel) {
      onDownloadExcel(bytes, filename);
    } else {
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="analytics-dashboard animate-fade-in">
      {/* Formal Report Header + 3-Level Area Switcher */}
      <section className="analytics-hero">
        <div className="analytics-hero-text">
          <div className="analytics-hero-eyebrow">
            <ShieldCheck size={16} /> รายงานผลการประเมินการรู้หนังสือภาษาไทย · จังหวัดนราธิวาส
          </div>
          <h2>หน้าแดชบอร์ดภาพรวมผลการประเมิน</h2>
          <p>{activeFilterSummaryText}</p>
        </div>
        <div className="analytics-level-switcher" role="group" aria-label="เลือกระดับพื้นที่แสดงผล">
          <button
            type="button"
            aria-pressed={areaLevel === 'province'}
            onClick={() => handleAreaLevelChange('province')}
          >
            <Layers size={16} /> ระดับจังหวัด (นราธิวาส)
          </button>
          <button
            type="button"
            aria-pressed={areaLevel === 'district'}
            onClick={() => handleAreaLevelChange('district')}
          >
            <MapPin size={16} /> ระดับอำเภอ ({NARATHIWAT_DISTRICT_NAMES.length} แห่ง)
          </button>
          <button
            type="button"
            aria-pressed={areaLevel === 'subdistrict'}
            onClick={() => handleAreaLevelChange('subdistrict')}
          >
            <Filter size={16} /> ระดับตำบล ({subdistrictRows.length})
          </button>
        </div>
      </section>

      {/* Filters, Learner Search & Export Toolbar */}
      <section className="analytics-toolbar">
        <div className="analytics-filters-grid">
          <label className="filter-search-wide">
            <span><Search size={13} /> ค้นหา (คำนำหน้า ชื่อ นามสกุล อำเภอ ตำบล)</span>
            <input
              type="text"
              placeholder="เช่น นาย, นางสาว, ชื่อ-นามสกุล, อำเภอ, ตำบล..."
              value={detailSearch}
              onChange={e => { setDetailSearch(e.target.value); setDetailPage(1); }}
            />
          </label>

          <label>
            <span>คำนำหน้าชื่อ</span>
            <select
              value={prefixFilter}
              onChange={e => { setPrefixFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกคำนำหน้า</option>
              {NAME_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label>
            <span>อำเภอ</span>
            <select value={districtFilter} onChange={e => handleDistrictChange(e.target.value)}>
              <option value="all">ทุกอำเภอ ({areaOptions.districts.length})</option>
              {areaOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label>
            <span>ตำบล</span>
            <select
              value={subdistrictFilter}
              onChange={e => {
                setSubdistrictFilter(e.target.value);
                if (e.target.value !== 'all') setAreaLevel('subdistrict');
                setDetailPage(1);
              }}
            >
              <option value="all">ทุกตำบล ({areaOptions.subdistricts.length})</option>
              {areaOptions.subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label>
            <span>เพศ</span>
            <select
              value={genderFilter}
              onChange={e => { setGenderFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="ไม่ระบุ">ไม่ระบุ</option>
            </select>
          </label>

          <label>
            <span>สถานะผลการประเมิน</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="passed">ผ่าน (ครบ 4 ทักษะ ≥70%)</option>
              <option value="failed">ไม่ผ่าน (ครบ 4 ทักษะ &lt;70%)</option>
              <option value="incomplete">ยังไม่ครบ (ยังไม่ครบ 4 ทักษะ)</option>
            </select>
          </label>

          <label>
            <span>กลุ่มผู้เรียน</span>
            <select
              value={enrollmentFilter}
              onChange={e => { setEnrollmentFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="literacy">ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ</option>
              <option value="all">ผู้เรียนทั้งหมด</option>
              <option value="other">ไม่ใช่ผู้เรียนกิจกรรมฯ</option>
            </select>
          </label>

          <label>
            <span>ช่วงเวลาการสอบ</span>
            <select
              value={dateRange}
              onChange={e => { setDateRange(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="week">7 วันล่าสุด</option>
              <option value="month">30 วันล่าสุด</option>
            </select>
          </label>

          <div className="analytics-reset-wrap">
            <button type="button" className="btn-secondary analytics-reset-btn" onClick={resetAllFilters}>
              <RotateCcw size={15} /> ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Dual Export Bar: Excel (.xlsx) & CSV matching current filters */}
        <div className="analytics-export-bar">
          <div>
            <span className="analytics-export-label">ดาวน์โหลดและส่งออกข้อมูลรายงาน (ตรงตามตัวกรองปัจจุบัน)</span>
            <small className="analytics-export-hint">รองรับทั้งไฟล์ Excel (.xlsx) พร้อมจัดรูปแบบ และไฟล์ CSV (UTF-8)</small>
          </div>
          <div className="analytics-export-cards">
            <div className="analytics-export-unit">
              <span>ภาพรวมระดับจังหวัด</span>
              <div>
                <button
                  type="button"
                  className="analytics-export-btn excel"
                  onClick={() => exportExcel('province', 'รายงานภาพรวมระดับจังหวัด')}
                >
                  <FileDown size={14} /> Excel
                </button>
                <button
                  type="button"
                  className="analytics-export-btn"
                  onClick={() => onDownloadCsv(
                    buildProvinceOverviewCsv(summary, {
                      description: activeFilterSummaryText,
                      exportedAt: new Date().toLocaleString('th-TH'),
                    }),
                    `รายงานภาพรวมระดับจังหวัด_${dateTag}.csv`
                  )}
                >
                  <FileSpreadsheet size={14} /> CSV
                </button>
              </div>
            </div>

            <div className="analytics-export-unit">
              <span>ข้อมูลรายอำเภอ ({districtRows.length})</span>
              <div>
                <button
                  type="button"
                  className="analytics-export-btn excel"
                  onClick={() => exportExcel('district', 'รายงานข้อมูลรายอำเภอ')}
                >
                  <FileDown size={14} /> Excel
                </button>
                <button
                  type="button"
                  className="analytics-export-btn"
                  onClick={() => onDownloadCsv(
                    buildAreaSummaryCsv(districtRows, 'district'),
                    `รายงานข้อมูลรายอำเภอ_${dateTag}.csv`
                  )}
                >
                  <FileSpreadsheet size={14} /> CSV
                </button>
              </div>
            </div>

            <div className="analytics-export-unit">
              <span>ข้อมูลรายตำบล ({subdistrictRows.length})</span>
              <div>
                <button
                  type="button"
                  className="analytics-export-btn excel"
                  onClick={() => exportExcel('subdistrict', 'รายงานข้อมูลรายตำบล')}
                >
                  <FileDown size={14} /> Excel
                </button>
                <button
                  type="button"
                  className="analytics-export-btn"
                  onClick={() => onDownloadCsv(
                    buildAreaSummaryCsv(subdistrictRows, 'subdistrict'),
                    `รายงานข้อมูลรายตำบล_${dateTag}.csv`
                  )}
                >
                  <FileSpreadsheet size={14} /> CSV
                </button>
              </div>
            </div>

            <div className="analytics-export-unit">
              <span>รายบุคคล 4 ทักษะ ({filtered.learners.length})</span>
              <div>
                <button
                  type="button"
                  className="analytics-export-btn excel"
                  onClick={() => exportExcel('learners', 'รายงานรายบุคคล_4ทักษะ')}
                >
                  <FileDown size={14} /> Excel
                </button>
                <button
                  type="button"
                  className="analytics-export-btn"
                  onClick={() => onDownloadCsv(
                    buildLearnersCsv(filtered.learners, formatDate),
                    `รายงานรายบุคคล_4ทักษะ_${dateTag}.csv`
                  )}
                >
                  <FileSpreadsheet size={14} /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <p className="admin-muted" role="status">กำลังโหลดข้อมูลภาพรวม...</p>
      )}

      {/* 1. Overall KPI Cards */}
      <div className="analytics-kpis">
        <div className="analytics-kpi purple">
          <div className="kpi-icon"><Users size={22} /></div>
          <div>
            <span>ผู้เรียนเข้ารับการประเมิน</span>
            <strong>{summary.assessedLearners.toLocaleString()} <small>คน</small></strong>
            <p>จากผู้เรียนในระบบ {summary.totalLearners.toLocaleString()} คน (ยังไม่ประเมิน {summary.unassessedLearners} คน)</p>
          </div>
        </div>

        <div className="analytics-kpi blue">
          <div className="kpi-icon"><UserCheck size={22} /></div>
          <div>
            <span>จำแนกเพศ ชาย – หญิง</span>
            <strong>
              ชาย {summary.assessedMale} <small>/ หญิง {summary.assessedFemale}</small>
            </strong>
            <p>
              ชาย {summary.assessedMalePct}% · หญิง {summary.assessedFemalePct}%
              {summary.assessedOtherGender > 0 ? ` · ไม่ระบุ ${summary.assessedOtherGender}` : ''}
            </p>
          </div>
        </div>

        <div className="analytics-kpi green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div>
            <span>ผลการประเมิน (ผ่าน / ไม่ผ่าน)</span>
            <strong>
              ผ่าน {summary.passedLearners} <small>({summary.learnerPassRatePct}%)</small>
            </strong>
            <p>ไม่ผ่าน {summary.notPassedLearners} คน ({summary.learnerFailRatePct}%) · จากผู้ครบ 4 ทักษะ</p>
          </div>
        </div>

        <div className="analytics-kpi amber">
          <div className="kpi-icon"><BookOpen size={22} /></div>
          <div>
            <span>ความครบถ้วนแบบทดสอบ 4 ทักษะ</span>
            <strong>
              ครบ {summary.completed4Learners} <small>({summary.completed4RatePct}%)</small>
            </strong>
            <p>ยังทำไม่ครบ {summary.incomplete4Learners} คน ({summary.incomplete4RatePct}%)</p>
          </div>
        </div>

        <div className="analytics-kpi indigo">
          <div className="kpi-icon"><MapPin size={22} /></div>
          <div>
            <span>พื้นที่ดำเนินการ</span>
            <strong>{summary.districtCount} <small>อำเภอ</small></strong>
            <p>แยกย่อย {summary.subdistrictCount} ตำบล · สอบรวม {summary.totalAttempts} ครั้ง</p>
          </div>
        </div>
      </div>

      {/* 2. Skill-by-Skill Summary Section (Cards + Formal Table + Chart) */}
      <section className="analytics-panel">
        <div className="analytics-panel-header">
          <div>
            <h3><Award size={18} /> ผลการประเมินแยกตาม ๔ ทักษะ (จำแนกเพศ ชาย–หญิง และร้อยละ)</h3>
            <p className="admin-muted">เกณฑ์ผ่านการประเมินแต่ละทักษะ ≥ 70% ของคะแนนเต็มในทักษะนั้น</p>
          </div>
        </div>

        <div className="analytics-skill-cards">
          {summary.skillBreakdown.map(s => (
            <div key={s.key} className="analytics-skill-card" style={{ borderTopColor: s.color }}>
              <div className="skill-card-head">
                <strong>{s.formalName}</strong>
                <span className="skill-max-tag">เต็ม {s.maxScore}</span>
              </div>
              <div className="skill-card-rates">
                <div>
                  <small>ผ่านการประเมิน</small>
                  <strong className="text-green">{s.passedCount} คน ({s.passRatePct}%)</strong>
                </div>
                <div>
                  <small>ไม่ผ่านการประเมิน</small>
                  <strong className="text-rose">{s.failedCount} คน ({s.failRatePct}%)</strong>
                </div>
              </div>
              <div className="skill-card-foot">
                <span>เข้าประเมิน {s.assessedCount} (ช {s.assessedMale} / ญ {s.assessedFemale})</span>
                <span>ยังไม่ประเมิน {s.unassessedCount}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="analytics-table-wrap" style={{ marginTop: '16px' }}>
          <table className="analytics-table analytics-skill-table">
            <thead>
              <tr>
                <th rowSpan={2}>ทักษะการประเมิน</th>
                <th colSpan={3} className="group-head">ผู้เข้ารับการประเมิน (คน)</th>
                <th colSpan={3} className="group-head green-head">ผ่านการประเมิน (คน)</th>
                <th colSpan={3} className="group-head rose-head">ไม่ผ่านการประเมิน (คน)</th>
                <th rowSpan={2} className="num">ยังไม่ได้ประเมิน / ไม่มีผล</th>
                <th rowSpan={2} className="num">ร้อยละผ่าน</th>
                <th rowSpan={2} className="num">ร้อยละไม่ผ่าน</th>
                <th rowSpan={2} className="num">เฉลี่ย</th>
              </tr>
              <tr>
                <th className="num">รวม</th>
                <th className="num">ชาย</th>
                <th className="num">หญิง</th>
                <th className="num">รวม</th>
                <th className="num">ชาย</th>
                <th className="num">หญิง</th>
                <th className="num">รวม</th>
                <th className="num">ชาย</th>
                <th className="num">หญิง</th>
              </tr>
            </thead>
            <tbody>
              {summary.skillBreakdown.map(s => (
                <tr key={s.key}>
                  <td className="area-primary">
                    <span className="skill-dot" style={{ background: s.color }} /> {s.formalName}
                  </td>
                  <td className="num"><strong>{s.assessedCount}</strong></td>
                  <td className="num">{s.assessedMale}</td>
                  <td className="num">{s.assessedFemale}</td>
                  <td className="num text-green"><strong>{s.passedCount}</strong></td>
                  <td className="num text-green">{s.passedMale}</td>
                  <td className="num text-green">{s.passedFemale}</td>
                  <td className="num text-rose"><strong>{s.failedCount}</strong></td>
                  <td className="num text-rose">{s.failedMale}</td>
                  <td className="num text-rose">{s.failedFemale}</td>
                  <td className="num">
                    {s.unassessedCount}
                    {s.pendingCount > 0 && <div className="sub-meta">(รอตรวจ {s.pendingCount})</div>}
                  </td>
                  <td className="num">
                    <span className="analytics-pill green">{s.passRatePct}%</span>
                  </td>
                  <td className="num">
                    <span className="analytics-pill red">{s.failRatePct}%</span>
                  </td>
                  <td className="num">{s.avgScore}/{s.maxScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visual Charts Row: 4-Skill Comparison + Gender & Completeness Pies */}
      <div className="analytics-charts-grid">
        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><Award size={18} /> กราฟผลการประเมินราย 4 ทักษะ</h3>
              <p className="admin-muted">เปรียบเทียบจำนวนผู้ผ่าน/ไม่ผ่าน และสัดส่วนชาย–หญิงในแต่ละทักษะ</p>
            </div>
            <div className="analytics-seg">
              <button
                type="button"
                aria-pressed={skillChartMode === 'passFail'}
                onClick={() => setSkillChartMode('passFail')}
              >ผ่าน / ไม่ผ่าน</button>
              <button
                type="button"
                aria-pressed={skillChartMode === 'gender'}
                onClick={() => setSkillChartMode('gender')}
              >จำแนกชาย – หญิง</button>
            </div>
          </div>
          <div className="analytics-chart-box">
            <ResponsiveContainer width="100%" height={290}>
              {skillChartMode === 'passFail' ? (
                <BarChart data={summary.skillBreakdown} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="shortName" tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={32} />
                  <Bar dataKey="passedCount" name="ผ่านการประเมิน" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failedCount" name="ไม่ผ่านการประเมิน" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unassessedCount" name="ยังไม่ได้ประเมิน" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={summary.skillBreakdown} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="shortName" tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={32} />
                  <Bar dataKey="passedMale" name="ผ่าน (ชาย)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="passedFemale" name="ผ่าน (หญิง)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failedMale" name="ไม่ผ่าน (ชาย)" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failedFemale" name="ไม่ผ่าน (หญิง)" fill="#f9a8d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><CheckCircle size={18} /> สัดส่วนเพศ ผลประเมิน และความครบถ้วน</h3>
              <p className="admin-muted">ผู้เข้ารับการประเมินจำแนกเพศ และผลการทำแบบทดสอบครบ 4 ทักษะ</p>
            </div>
          </div>
          <div className="analytics-pies-wrap">
            <div className="analytics-pie-item">
              <h4>เพศผู้เข้ารับการประเมิน ({summary.assessedLearners} คน)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={summary.genderDistribution.filter(d => d.count > 0)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {summary.genderDistribution.filter(d => d.count > 0).map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v) => `${v} คน`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="analytics-pie-item">
              <h4>ผลการประเมินภาพรวม ({summary.totalLearners} คน)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={summary.outcomeDistribution.filter(d => d.count > 0)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {summary.outcomeDistribution.filter(d => d.count > 0).map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v) => `${v} คน`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Area Breakdown Charts (District 13 & Subdistrict) */}
      <div className="analytics-charts-grid">
        {areaLevel !== 'subdistrict' && (
          <section className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h3><Layers size={18} /> กราฟจำแนกตามอำเภอ ({districtRows.length} แห่ง)</h3>
                <p className="admin-muted">จำนวนผู้เรียนผ่าน/ไม่ผ่าน, เพศชาย–หญิง และอัตราผ่านรายอำเภอ</p>
              </div>
              <div className="analytics-seg">
                <button
                  type="button"
                  aria-pressed={districtChartMode === 'counts'}
                  onClick={() => setDistrictChartMode('counts')}
                >ผ่าน / ไม่ครบ</button>
                <button
                  type="button"
                  aria-pressed={districtChartMode === 'gender'}
                  onClick={() => setDistrictChartMode('gender')}
                >ชาย – หญิง</button>
                <button
                  type="button"
                  aria-pressed={districtChartMode === 'passRate'}
                  onClick={() => setDistrictChartMode('passRate')}
                >อัตราผ่าน (%)</button>
              </div>
            </div>
            <div className="analytics-chart-box">
              {districtChartData.length === 0 ? (
                <p className="admin-empty">ยังไม่มีข้อมูล</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  {districtChartMode === 'counts' ? (
                    <BarChart data={districtChartData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-22} textAnchor="end" height={64} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="passedLearnerCount" name="ผ่านเกณฑ์" stackId="a" fill="#10b981" />
                      <Bar dataKey="failedLearnerCount" name="ไม่ผ่านเกณฑ์" stackId="a" fill="#f43f5e" />
                      <Bar dataKey="incomplete4Count" name="ยังไม่ครบ 4 ทักษะ" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : districtChartMode === 'gender' ? (
                    <BarChart data={districtChartData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-22} textAnchor="end" height={64} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="maleCount" name="เพศชาย" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="femaleCount" name="เพศหญิง" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={districtChartData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-22} textAnchor="end" height={64} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                      <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => `${v ?? 0}%`} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="exactPassRate" name="ร้อยละผ่าน (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avgPct" name="คะแนนเฉลี่ย (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </section>
        )}

        <section className="analytics-card" style={areaLevel === 'subdistrict' ? { gridColumn: '1 / -1' } : undefined}>
          <div className="analytics-card-header">
            <div>
              <h3><MapPin size={18} /> กราฟจำแนกตามตำบล</h3>
              <p className="admin-muted">
                {districtFilter === 'all' ? 'แสดงสูงสุด 15 ตำบลที่มีข้อมูลมากที่สุด' : `ตำบลภายในอำเภอ${districtFilter}`}
              </p>
            </div>
            <div className="analytics-seg">
              <button
                type="button"
                aria-pressed={subdistrictChartMode === 'counts'}
                onClick={() => setSubdistrictChartMode('counts')}
              >ผ่าน / ไม่ครบ</button>
              <button
                type="button"
                aria-pressed={subdistrictChartMode === 'gender'}
                onClick={() => setSubdistrictChartMode('gender')}
              >ชาย – หญิง</button>
              <button
                type="button"
                aria-pressed={subdistrictChartMode === 'passRate'}
                onClick={() => setSubdistrictChartMode('passRate')}
              >อัตราผ่าน (%)</button>
            </div>
          </div>
          <div className="analytics-chart-box">
            {subdistrictChartData.length === 0 ? (
              <p className="admin-empty">ยังไม่มีข้อมูลตำบลตามตัวกรอง</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                {subdistrictChartMode === 'counts' ? (
                  <BarChart data={subdistrictChartData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="subdistrict" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-22} textAnchor="end" height={64} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="passedLearnerCount" name="ผ่านเกณฑ์" stackId="s" fill="#10b981" />
                    <Bar dataKey="failedLearnerCount" name="ไม่ผ่านเกณฑ์" stackId="s" fill="#f43f5e" />
                    <Bar dataKey="incomplete4Count" name="ยังไม่ครบ 4 ทักษะ" stackId="s" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : subdistrictChartMode === 'gender' ? (
                  <BarChart data={subdistrictChartData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="subdistrict" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-22} textAnchor="end" height={64} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="maleCount" name="เพศชาย" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="femaleCount" name="เพศหญิง" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={subdistrictChartData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="subdistrict" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-22} textAnchor="end" height={64} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => `${v ?? 0}%`} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="exactPassRate" name="ร้อยละผ่าน (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgPct" name="คะแนนเฉลี่ย (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* Daily Trend */}
      {summary.dailyTrend.length > 0 && (
        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><TrendingUp size={18} /> แนวโน้มจำนวนการสอบและคะแนนเฉลี่ยรายวัน</h3>
              <p className="admin-muted">จำนวนครั้งที่ส่งคำตอบเทียบกับคะแนนเฉลี่ยในแต่ละวัน</p>
            </div>
          </div>
          <div className="analytics-chart-box">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={summary.dailyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="top" height={32} />
                <Area yAxisId="left" type="monotone" dataKey="attempts" name="จำนวนครั้งที่สอบ" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="avgPct" name="คะแนนเฉลี่ย (%)" stroke="#10b981" fill="#d1fae5" fillOpacity={0.35} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Area Breakdown Tables */}
      {areaLevel !== 'subdistrict' && (
        <AreaBreakdownTable
          title={`ข้อมูลผลการประเมินระดับอำเภอ (ทั้งหมด ${districtRows.length} แห่ง — คลิกแถวเพื่อดูรายตำบล)`}
          subtitle="แสดงจำนวนผู้เรียนชาย–หญิง ความครบถ้วน 4 ทักษะ และผลรายทักษะแต่ละอำเภอ"
          rows={districtRows}
          mode="district"
          selectedDistrict={districtFilter}
          selectedSubdistrict={subdistrictFilter}
          onSelectRow={(row) => {
            if (districtFilter === row.district) {
              setDistrictFilter('all');
              setSubdistrictFilter('all');
            } else {
              setDistrictFilter(row.district);
              setSubdistrictFilter('all');
              setAreaLevel('subdistrict');
            }
            setDetailPage(1);
          }}
          onExportExcel={() => exportExcel('district', 'รายงานข้อมูลรายอำเภอ')}
          onExportCsv={() => onDownloadCsv(
            buildAreaSummaryCsv(districtRows, 'district'),
            `รายงานข้อมูลรายอำเภอ_${dateTag}.csv`
          )}
        />
      )}

      <AreaBreakdownTable
        title={
          districtFilter !== 'all'
            ? `ข้อมูลผลการประเมินระดับตำบล — อำเภอ${districtFilter} (${subdistrictRows.length} ตำบล)`
            : `ข้อมูลผลการประเมินระดับตำบล (${subdistrictRows.length} ตำบล)`
        }
        subtitle="แสดงจำนวนผู้เรียนชาย–หญิง ความครบถ้วน 4 ทักษะ และผลรายทักษะแต่ละตำบล (คลิกแถวเพื่อกรองรายชื่อด้านล่าง)"
        rows={subdistrictRows}
        mode="subdistrict"
        selectedDistrict={districtFilter}
        selectedSubdistrict={subdistrictFilter}
        onSelectRow={(row) => {
          const isSame = subdistrictFilter === row.subdistrict;
          if (isSame) {
            setSubdistrictFilter('all');
          } else {
            if (row.district && row.district !== 'ไม่ระบุ') setDistrictFilter(row.district);
            setSubdistrictFilter(row.subdistrict);
          }
          setDetailPage(1);
        }}
        onExportExcel={() => exportExcel('subdistrict', 'รายงานข้อมูลรายตำบล')}
        onExportCsv={() => onDownloadCsv(
          buildAreaSummaryCsv(subdistrictRows, 'subdistrict'),
          `รายงานข้อมูลรายตำบล_${dateTag}.csv`
        )}
      />

      {/* 4. Individual Learner Search & Verification Table */}
      <section className="analytics-panel">
        <div className="analytics-panel-header">
          <div>
            <h3><Search size={18} /> ข้อมูลรายบุคคลพร้อมผลการประเมินทั้ง ๔ ทักษะ ({activeRows.length} รายการ)</h3>
            <p className="admin-muted">ตรวจสอบรายชื่อ คำนำหน้า เพศ อำเภอ ตำบล สถานะผลประเมิน และคะแนนรายทักษะ</p>
          </div>
          <div className="analytics-detail-controls">
            <div className="analytics-seg">
              <button
                type="button"
                aria-pressed={detailMode === 'learners'}
                onClick={() => { setDetailMode('learners'); setDetailPage(1); }}
              >รายผู้เรียน ({filtered.learners.length})</button>
              <button
                type="button"
                aria-pressed={detailMode === 'attempts'}
                onClick={() => { setDetailMode('attempts'); setDetailPage(1); }}
              >รายครั้งการสอบ ({filtered.attempts.length})</button>
            </div>
            {detailMode === 'learners' ? (
              <>
                <button
                  type="button"
                  className="analytics-export-btn excel"
                  onClick={() => exportExcel('learners', 'รายงานรายบุคคล_4ทักษะ')}
                >
                  <FileDown size={15} /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  className="analytics-export-btn"
                  onClick={() => onDownloadCsv(buildLearnersCsv(filtered.learners, formatDate), `รายงานรายบุคคล_4ทักษะ_${dateTag}.csv`)}
                >
                  <FileSpreadsheet size={15} /> CSV ({filtered.learners.length})
                </button>
              </>
            ) : (
              <button
                type="button"
                className="analytics-export-btn"
                onClick={() => onDownloadCsv(
                  buildHistoryCsv({ history: filtered.attempts, users, surveys, formatDate }),
                  `ประวัติผลสอบแยกย่อย_${dateTag}.csv`
                )}
              >
                <FileSpreadsheet size={15} /> ส่งออก CSV ประวัติสอบ ({filtered.attempts.length})
              </button>
            )}
          </div>
        </div>

        {pagedDetailRows.length === 0 ? (
          <div className="admin-empty">
            <p>ไม่พบข้อมูลผู้เรียนที่ตรงกับคำค้นหาหรือตัวกรอง</p>
            <button type="button" className="btn-secondary" onClick={resetAllFilters}>ล้างตัวกรองทั้งหมด</button>
          </div>
        ) : (
          <div className="analytics-table-wrap">
            {detailMode === 'learners' ? (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>ชื่อ-นามสกุล (คำนำหน้า)</th>
                    <th>เพศ</th>
                    <th>ตำบล</th>
                    <th>อำเภอ</th>
                    <th>ความครบถ้วน</th>
                    <th>สถานะผลประเมิน</th>
                    <th className="num">การฟัง (25)</th>
                    <th className="num">การพูด (15)</th>
                    <th className="num">การอ่าน (30)</th>
                    <th className="num">การเขียน (30)</th>
                    <th>ตรวจสอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDetailRows.map(l => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.name || 'ไม่ระบุชื่อ'}</strong>
                        <div className="sub-meta">
                          @{l.username}
                          {l.age ? ` · ${l.age} ปี` : ''}
                          {l.is_literacy_learner ? ' · รู้หนังสือ' : ''}
                        </div>
                      </td>
                      <td>
                        <span className={`analytics-pill ${l.gender === 'ชาย' ? 'blue' : l.gender === 'หญิง' ? 'pink' : 'gray'}`}>
                          {l.gender || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td>{l.subdistrict}</td>
                      <td>{l.district}</td>
                      <td>
                        <span className={`analytics-pill ${l.completedAll4Skills ? 'green' : 'amber'}`}>
                          {l.assessedSkillCount}/4 ทักษะ
                        </span>
                      </td>
                      <td>
                        <span className={`analytics-pill ${l.assessmentStatus === 'passed' ? 'green' : l.assessmentStatus === 'failed' ? 'red' : 'gray'}`}>
                          {l.assessmentStatusLabel}
                          {l.overallPct !== null ? ` (${l.overallPct}%)` : ''}
                        </span>
                      </td>
                      <td className="num"><SkillBadge skill={l.skills?.listening} /></td>
                      <td className="num"><SkillBadge skill={l.skills?.speaking} /></td>
                      <td className="num"><SkillBadge skill={l.skills?.reading} /></td>
                      <td className="num"><SkillBadge skill={l.skills?.writing} /></td>
                      <td>
                        <button type="button" className="analytics-mini-btn" onClick={() => setInspectedLearner(l)}>
                          <Eye size={14} /> รายบุคคล
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>วันที่สอบ</th>
                    <th>ผู้เข้าสอบ</th>
                    <th>เพศ</th>
                    <th>ตำบล</th>
                    <th>อำเภอ</th>
                    <th>แบบทดสอบ</th>
                    <th className="num">คะแนน</th>
                    <th className="num">ร้อยละ</th>
                    <th>ระดับ</th>
                    <th className="num">ฟัง</th>
                    <th className="num">พูด</th>
                    <th className="num">อ่าน</th>
                    <th className="num">เขียน</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDetailRows.map((a, idx) => (
                    <tr key={a.id || idx}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.taken_at)}</td>
                      <td>
                        <strong>{a.user?.name}</strong>
                        <div className="sub-meta">@{a.user?.username}</div>
                      </td>
                      <td>{a.gender || 'ไม่ระบุ'}</td>
                      <td>{a.subdistrict}</td>
                      <td>{a.district}</td>
                      <td>{SKILL_LABELS[a.skill] || a.skill}</td>
                      <td className="num"><strong>{a.score}/{a.max_score}</strong></td>
                      <td className="num">{a.pct}%</td>
                      <td>
                        <span className={`analytics-pill ${a.isReviewed ? (a.passed ? 'green' : 'red') : 'amber'}`}>
                          {a.isReviewed ? `${a.passed ? 'ผ่าน' : 'ไม่ผ่าน'} (${a.grade})` : 'รอตรวจ'}
                        </span>
                      </td>
                      <td className="num">{a.breakdown?.listening?.score ?? '—'}</td>
                      <td className="num">{a.breakdown?.speaking?.score ?? '—'}</td>
                      <td className="num">{a.breakdown?.reading?.score ?? '—'}</td>
                      <td className="num">{a.breakdown?.writing?.score ?? '—'}</td>
                      <td>
                        <button type="button" className="analytics-mini-btn" onClick={() => onInspectAttempt(a)}>
                          <Eye size={14} /> ตรวจละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeRows.length > DETAIL_PAGE_SIZE && (
          <div className="admin-pagination">
            <span>
              แสดง {(currentDetailPage - 1) * DETAIL_PAGE_SIZE + 1}–{Math.min(currentDetailPage * DETAIL_PAGE_SIZE, activeRows.length)} จาก {activeRows.length} รายการ
            </span>
            <div>
              <button
                type="button"
                className="btn-secondary"
                disabled={currentDetailPage === 1}
                onClick={() => setDetailPage(currentDetailPage - 1)}
              >ก่อนหน้า</button>
              <span>{currentDetailPage} / {detailPageCount}</span>
              <button
                type="button"
                className="btn-secondary"
                disabled={currentDetailPage === detailPageCount}
                onClick={() => setDetailPage(currentDetailPage + 1)}
              >ถัดไป</button>
            </div>
          </div>
        )}
      </section>

      {/* Individual Learner 4-Skill Scorecard Modal */}
      {inspectedLearner && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setInspectedLearner(null)}>
            <div className="modal-card analytics-learner-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="admin-eyebrow">รายงานผลประเมินรายบุคคล · 4 ทักษะ</p>
                  <h3>{inspectedLearner.name || 'ไม่ระบุชื่อ'}</h3>
                  <p className="admin-muted">
                    @{inspectedLearner.username}
                    {inspectedLearner.gender ? ` · เพศ${inspectedLearner.gender}` : ''}
                    {inspectedLearner.age ? ` · อายุ ${inspectedLearner.age} ปี` : ''}
                  </p>
                </div>
                <button type="button" className="modal-close" aria-label="ปิด" onClick={() => setInspectedLearner(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="learner-modal-meta">
                <div>
                  <span>ภูมิลำเนา</span>
                  <strong>ต.{inspectedLearner.subdistrict} อ.{inspectedLearner.district} จ.{inspectedLearner.province}</strong>
                </div>
                <div>
                  <span>กลุ่มผู้เรียน</span>
                  <strong>{inspectedLearner.is_literacy_learner ? 'ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ' : 'ผู้เรียนทั่วไป'}</strong>
                </div>
                <div>
                  <span>ความครบถ้วน</span>
                  <strong>{inspectedLearner.assessedSkillCount} / 4 ทักษะ ({inspectedLearner.completedAll4Skills ? 'ครบแล้ว' : 'ยังไม่ครบ'})</strong>
                </div>
                <div>
                  <span>สรุปผลประเมิน</span>
                  <span className={`analytics-pill ${inspectedLearner.assessmentStatus === 'passed' ? 'green' : inspectedLearner.assessmentStatus === 'failed' ? 'red' : 'amber'}`}>
                    {inspectedLearner.assessmentStatusLabel}
                    {inspectedLearner.overallPct !== null ? ` · ${inspectedLearner.overallPct}%` : ''}
                  </span>
                </div>
              </div>

              <div className="learner-modal-skills">
                {SKILL_META.map(meta => {
                  const sk = inspectedLearner.skills?.[meta.key];
                  return (
                    <div key={meta.key} className="learner-skill-row" style={{ borderLeftColor: meta.color }}>
                      <div>
                        <strong>{meta.formalName}</strong>
                        <small>
                          {sk?.assessed
                            ? `ประเมินล่าสุด: ${sk.taken_at ? formatDate(sk.taken_at) : 'บันทึกผลแล้ว'}`
                            : (sk?.pending ? 'อยู่ระหว่างรอเจ้าหน้าที่ตรวจคำตอบ' : 'ยังไม่มีผลการประเมิน')}
                        </small>
                      </div>
                      <div className="learner-skill-score">
                        {sk?.assessed ? (
                          <>
                            <strong>{sk.score} / {sk.max} คะแนน</strong>
                            <span className={`analytics-pill ${sk.passed ? 'green' : 'red'}`}>
                              {sk.passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'} ({sk.exactPct}%)
                            </span>
                          </>
                        ) : (
                          <span className="analytics-pill gray">
                            {sk?.pending ? 'รอตรวจ' : 'ยังไม่ได้ประเมิน'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!inspectedLearner.completedAll4Skills && (
                <p className="learner-modal-note">
                  <AlertCircle size={15} /> ผู้เรียนรายนี้ยังทำแบบทดสอบไม่ครบทั้ง 4 ทักษะ
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const target = inspectedLearner;
                    setInspectedLearner(null);
                    onInspectUser(target);
                  }}
                >
                  <Eye size={16} /> เปิดดูประวัติและคำตอบทั้งหมด
                </button>
                <button type="button" className="btn-secondary" onClick={() => setInspectedLearner(null)}>
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
