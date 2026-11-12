import { useMemo, useState, useRef, useEffect } from 'react';
import ModalPortal from './ModalPortal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
  Users, Award, CheckCircle, MapPin, FileSpreadsheet, Filter, RotateCcw,
  Eye, Search, FileDown, X, AlertCircle, BookOpen, ChevronDown, SlidersHorizontal,
  BarChart2, Layers, ArrowRight
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

function SkillScoreText({ skill }) {
  if (!skill || !skill.assessed) {
    return (
      <span className="clean-skill-cell muted">
        {skill?.pending ? 'รอตรวจ' : '—'}
      </span>
    );
  }
  return (
    <div className="clean-skill-cell">
      <span className="clean-skill-num">{skill.score}/{skill.max}</span>
      <small className={skill.passed ? 'text-green' : 'text-rose'}>
        {skill.passed ? 'ผ่าน' : 'ไม่ผ่าน'} ({skill.pct}%)
      </small>
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
    <section className="clean-panel">
      <div className="clean-panel-header">
        <div>
          <h3>{title}</h3>
          <p className="admin-muted">{subtitle}</p>
        </div>
        <div className="clean-panel-actions">
          <button type="button" className="clean-btn-outline excel" onClick={onExportExcel}>
            <FileDown size={15} /> Excel
          </button>
          <button type="button" className="clean-btn-outline" onClick={onExportCsv}>
            <FileSpreadsheet size={15} /> CSV ({rows.length})
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="admin-empty">ไม่มีข้อมูลพื้นที่ตามเงื่อนไขที่เลือก</p>
      ) : (
        <div className="clean-table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>{isSub ? 'ตำบล / อำเภอ' : 'อำเภอ (13 แห่ง)'}</th>
                {!isSub && <th className="num">ตำบล</th>}
                <th className="num">ผู้เรียน (ช / ญ)</th>
                <th className="num">ครบ 4 ทักษะ</th>
                <th className="num">ยังไม่ครบ</th>
                <th className="num">ผ่าน (≥70%)</th>
                <th className="num">ไม่ผ่าน</th>
                <th className="num">อัตราผ่าน</th>
                <th className="num">ฟัง</th>
                <th className="num">พูด</th>
                <th className="num">อ่าน</th>
                <th className="num">เขียน</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isSelected = isSub
                  ? selectedSubdistrict === row.subdistrict && (selectedDistrict === 'all' || selectedDistrict === row.district)
                  : selectedDistrict === row.district;
                const sk = row.skillStats || {};
                const fmtSkill = (key) => {
                  const s = sk[key];
                  if (!s || !s.assessed) return <span className="muted-dash">—</span>;
                  return (
                    <span title={`ผ่าน ${s.passed} จาก ${s.assessed} คน`}>
                      <strong>{s.passed}</strong>/{s.assessed}
                    </span>
                  );
                };
                const passVal = row.exactPassRate ?? row.passRate;
                return (
                  <tr
                    key={row.key}
                    onClick={() => onSelectRow(row)}
                    className={isSelected ? 'selected-row' : 'clickable-row'}
                    title={isSub ? 'คลิกเพื่อกรองดูรายชื่อผู้เรียนในตำบลนี้' : 'คลิกเพื่อดูข้อมูลระดับตำบลในอำเภอนี้'}
                  >
                    <td>
                      <strong className="primary-cell">{isSub ? row.subdistrict : row.district}</strong>
                      {isSub && <div className="sub-meta">อ.{row.district}</div>}
                    </td>
                    {!isSub && <td className="num">{row.subdistrictCount}</td>}
                    <td className="num">
                      <strong>{row.learnerCount}</strong>
                      <div className="sub-meta">ช {row.maleCount ?? 0} · ญ {row.femaleCount ?? 0}</div>
                    </td>
                    <td className="num">{row.completed4Count ?? 0}</td>
                    <td className="num">{row.incomplete4Count ?? 0}</td>
                    <td className="num text-green">{row.passedLearnerCount ?? 0}</td>
                    <td className="num text-rose">{row.failedLearnerCount ?? row.notPassedLearnerCount ?? 0}</td>
                    <td className="num">
                      {passVal === null ? '—' : (
                        <strong className={passVal >= 70 ? 'text-green' : passVal >= 50 ? 'text-amber' : 'text-rose'}>
                          {passVal}%
                        </strong>
                      )}
                    </td>
                    <td className="num">{fmtSkill('listening')}</td>
                    <td className="num">{fmtSkill('speaking')}</td>
                    <td className="num">{fmtSkill('reading')}</td>
                    <td className="num">{fmtSkill('writing')}</td>
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
  anomalyCount = 0,
  onOpenLocationCleanup,
  onInspectUser,
  onInspectAttempt,
}) {
  // Primary navigation & view state
  const [sectionTab, setSectionTab] = useState('overview'); // 'overview' | 'skills' | 'areas' | 'learners'
  const [areaLevel, setAreaLevel] = useState('province'); // 'province' | 'district' | 'subdistrict'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Unified filters (default focus: literacy learners)
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subdistrictFilter, setSubdistrictFilter] = useState('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState('literacy');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prefixFilter, setPrefixFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [detailSearch, setDetailSearch] = useState('');

  // Chart toggles & detail pagination
  const [skillChartMode, setSkillChartMode] = useState('passFail'); // 'passFail' | 'gender'
  const [areaChartMode, setAreaChartMode] = useState('counts'); // 'counts' | 'gender' | 'passRate'
  const [detailMode, setDetailMode] = useState('learners'); // 'learners' | 'attempts'
  const [detailPage, setDetailPage] = useState(1);
  const [inspectedLearner, setInspectedLearner] = useState(null);

  useEffect(() => {
    const closeMenu = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

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

  const districtChartData = useMemo(() => districtRows.slice(0, 13), [districtRows]);
  const subdistrictChartData = useMemo(() => subdistrictRows.slice(0, 15), [subdistrictRows]);

  const activeRows = detailMode === 'learners' ? filtered.learners : filtered.attempts;
  const detailPageCount = Math.max(1, Math.ceil(activeRows.length / DETAIL_PAGE_SIZE));
  const currentDetailPage = Math.min(detailPage, detailPageCount);
  const pagedDetailRows = activeRows.slice(
    (currentDetailPage - 1) * DETAIL_PAGE_SIZE,
    currentDetailPage * DETAIL_PAGE_SIZE
  );

  const advancedFilterCount = [
    genderFilter !== 'all',
    statusFilter !== 'all',
    prefixFilter !== 'all',
    enrollmentFilter !== 'literacy',
    dateRange !== 'all',
  ].filter(Boolean).length;

  const hasAnyFilter =
    districtFilter !== 'all' ||
    subdistrictFilter !== 'all' ||
    detailSearch.trim() !== '' ||
    advancedFilterCount > 0;

  const handleAreaLevelChange = (level) => {
    setAreaLevel(level);
    if (level === 'province') {
      setDistrictFilter('all');
      setSubdistrictFilter('all');
    } else if (level === 'district') {
      setSubdistrictFilter('all');
      if (sectionTab === 'overview') setSectionTab('areas');
    } else if (level === 'subdistrict') {
      if (sectionTab === 'overview') setSectionTab('areas');
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
        ? 'ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ'
        : (enrollmentFilter === 'other' ? 'ผู้เรียนทั่วไป' : 'ผู้เรียนทั้งหมด'),
      districtFilter === 'all' ? 'จังหวัดนราธิวาส (13 อำเภอ)' : `อ.${districtFilter}`,
      subdistrictFilter !== 'all' ? `ต.${subdistrictFilter}` : null,
      genderFilter !== 'all' ? `เพศ${genderFilter}` : null,
      statusFilter === 'passed'
        ? 'ผ่าน'
        : (statusFilter === 'failed' ? 'ไม่ผ่าน' : (statusFilter === 'incomplete' ? 'ยังไม่ครบ' : null)),
      prefixFilter !== 'all' ? `คำนำหน้า: ${prefixFilter}` : null,
      detailSearch.trim() ? `ค้นหา "${detailSearch.trim()}"` : null,
    ].filter(Boolean);
    return parts.join(' · ');
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
    setShowExportMenu(false);
  };

  const exportCsvTarget = (target) => {
    if (target === 'province') {
      onDownloadCsv(
        buildProvinceOverviewCsv(summary, {
          description: activeFilterSummaryText,
          exportedAt: new Date().toLocaleString('th-TH'),
        }),
        `รายงานภาพรวมระดับจังหวัด_${dateTag}.csv`
      );
    } else if (target === 'district') {
      onDownloadCsv(buildAreaSummaryCsv(districtRows, 'district'), `รายงานข้อมูลรายอำเภอ_${dateTag}.csv`);
    } else if (target === 'subdistrict') {
      onDownloadCsv(buildAreaSummaryCsv(subdistrictRows, 'subdistrict'), `รายงานข้อมูลรายตำบล_${dateTag}.csv`);
    } else {
      onDownloadCsv(buildLearnersCsv(filtered.learners, formatDate), `รายงานรายบุคคล_4ทักษะ_${dateTag}.csv`);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="clean-dashboard animate-fade-in">
      {/* Calm Formal Report Header */}
      <header className="clean-header-card">
        <div className="clean-header-title">
          <span className="clean-eyebrow">รายงานผลการประเมินการรู้หนังสือ · จังหวัดนราธิวาส</span>
          <h2>ภาพรวมผลการประเมินทักษะภาษาไทย</h2>
          <p className="clean-scope-line">{activeFilterSummaryText}</p>
        </div>

        <div className="clean-header-actions">
          {anomalyCount > 0 && onOpenLocationCleanup && (
            <button
              type="button"
              className="clean-warn-pill"
              onClick={onOpenLocationCleanup}
              title="ตรวจสอบและรวมชื่ออำเภอ/ตำบลที่พิมพ์ผิด"
            >
              <AlertCircle size={15} /> พบชื่อพื้นที่ไม่มาตรฐาน ({anomalyCount})
            </button>
          )}

          <div className="clean-export-dropdown" ref={exportMenuRef}>
            <button
              type="button"
              className="clean-export-trigger"
              aria-expanded={showExportMenu}
              onClick={() => setShowExportMenu(v => !v)}
            >
              <FileDown size={16} /> ดาวน์โหลดรายงาน (Excel / CSV) <ChevronDown size={15} />
            </button>

            {showExportMenu && (
              <div className="clean-export-menu" role="menu">
                <div className="clean-export-menu-head">
                  ส่งออกตรงตามตัวกรองที่เลือกอยู่
                </div>
                {[
                  { key: 'province', label: 'ภาพรวมระดับจังหวัด', excelName: 'รายงานภาพรวมระดับจังหวัด' },
                  { key: 'district', label: `ข้อมูลรายอำเภอ (${districtRows.length})`, excelName: 'รายงานข้อมูลรายอำเภอ' },
                  { key: 'subdistrict', label: `ข้อมูลรายตำบล (${subdistrictRows.length})`, excelName: 'รายงานข้อมูลรายตำบล' },
                  { key: 'learners', label: `รายบุคคล 4 ทักษะ (${filtered.learners.length})`, excelName: 'รายงานรายบุคคล_4ทักษะ' },
                ].map(item => (
                  <div key={item.key} className="clean-export-row">
                    <span>{item.label}</span>
                    <div>
                      <button type="button" className="mini-dl excel" onClick={() => exportExcel(item.key, item.excelName)}>
                        Excel
                      </button>
                      <button type="button" className="mini-dl csv" onClick={() => exportCsvTarget(item.key)}>
                        CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Compact Single-Line Filter Bar + Collapsible Extra Filters */}
      <section className="clean-filter-bar">
        <div className="clean-filter-primary">
          <div className="clean-field">
            <label>ระดับข้อมูล</label>
            <select value={areaLevel} onChange={e => handleAreaLevelChange(e.target.value)}>
              <option value="province">ระดับจังหวัด (นราธิวาส)</option>
              <option value="district">ระดับอำเภอ ({NARATHIWAT_DISTRICT_NAMES.length} แห่ง)</option>
              <option value="subdistrict">ระดับตำบล ({subdistrictRows.length})</option>
            </select>
          </div>

          <div className="clean-field">
            <label>อำเภอ</label>
            <select value={districtFilter} onChange={e => handleDistrictChange(e.target.value)}>
              <option value="all">ทุกอำเภอ ({areaOptions.districts.length})</option>
              {areaOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="clean-field">
            <label>ตำบล</label>
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
          </div>

          <div className="clean-field clean-field-search">
            <label>ค้นหาผู้เรียน</label>
            <div className="clean-search-input">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="คำนำหน้า, ชื่อ-นามสกุล, อำเภอ, ตำบล..."
                value={detailSearch}
                onChange={e => {
                  setDetailSearch(e.target.value);
                  setDetailPage(1);
                }}
              />
            </div>
          </div>

          <div className="clean-filter-btns">
            <button
              type="button"
              className={`clean-toggle-adv ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(v => !v)}
            >
              <SlidersHorizontal size={15} />
              ตัวกรองเพิ่มเติม
              {advancedFilterCount > 0 && <span className="adv-count">{advancedFilterCount}</span>}
            </button>
            {hasAnyFilter && (
              <button type="button" className="clean-reset-icon" onClick={resetAllFilters} title="ล้างตัวกรองทั้งหมด">
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="clean-filter-secondary">
            <div className="clean-field">
              <label>เพศ</label>
              <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setDetailPage(1); }}>
                <option value="all">ทุกเพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="ไม่ระบุ">ไม่ระบุ</option>
              </select>
            </div>

            <div className="clean-field">
              <label>สถานะผลประเมิน</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setDetailPage(1); }}>
                <option value="all">ทุกสถานะ</option>
                <option value="passed">ผ่าน (ครบ 4 ทักษะ ≥70%)</option>
                <option value="failed">ไม่ผ่าน (ครบ 4 ทักษะ &lt;70%)</option>
                <option value="incomplete">ยังไม่ครบ (ยังไม่ครบ 4 ทักษะ)</option>
              </select>
            </div>

            <div className="clean-field">
              <label>คำนำหน้าชื่อ</label>
              <select value={prefixFilter} onChange={e => { setPrefixFilter(e.target.value); setDetailPage(1); }}>
                <option value="all">ทุกคำนำหน้า</option>
                {NAME_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="clean-field">
              <label>กลุ่มผู้เรียน</label>
              <select value={enrollmentFilter} onChange={e => { setEnrollmentFilter(e.target.value); setDetailPage(1); }}>
                <option value="literacy">ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ</option>
                <option value="all">ผู้เรียนทั้งหมด</option>
                <option value="other">ไม่ใช่ผู้เรียนกิจกรรมฯ</option>
              </select>
            </div>

            <div className="clean-field">
              <label>ช่วงเวลาการสอบ</label>
              <select value={dateRange} onChange={e => { setDateRange(e.target.value); setDetailPage(1); }}>
                <option value="all">ทุกช่วงเวลา</option>
                <option value="today">วันนี้</option>
                <option value="week">7 วันล่าสุด</option>
                <option value="month">30 วันล่าสุด</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Sub-Navigation Tabs: One Focused View at a Time */}
      <nav className="clean-subtabs" aria-label="หมวดหมู่รายงานผลการประเมิน">
        <button
          type="button"
          aria-pressed={sectionTab === 'overview'}
          onClick={() => setSectionTab('overview')}
        >
          <BarChart2 size={16} /> ภาพรวม &amp; กราฟ
        </button>
        <button
          type="button"
          aria-pressed={sectionTab === 'skills'}
          onClick={() => setSectionTab('skills')}
        >
          <Award size={16} /> ผลประเมินราย 4 ทักษะ
        </button>
        <button
          type="button"
          aria-pressed={sectionTab === 'areas'}
          onClick={() => setSectionTab('areas')}
        >
          <Layers size={16} /> จำแนกพื้นที่ (อำเภอ / ตำบล)
        </button>
        <button
          type="button"
          aria-pressed={sectionTab === 'learners'}
          onClick={() => setSectionTab('learners')}
        >
          <Users size={16} /> รายชื่อรายบุคคล ({filtered.learners.length})
        </button>
      </nav>

      {loading && <p className="admin-muted" role="status">กำลังโหลดข้อมูลภาพรวม...</p>}

      {/* ==================== TAB 1: OVERVIEW ==================== */}
      {sectionTab === 'overview' && (
        <div className="clean-section-stack">
          {/* 4 Balanced, Spacious KPI Cards */}
          <div className="clean-kpis">
            <div className="clean-kpi indigo">
              <span className="kpi-label"><Users size={15} /> ผู้เรียนเข้ารับการประเมิน</span>
              <div className="kpi-main">
                <strong>{summary.assessedLearners.toLocaleString()}</strong>
                <span>คน (จาก {summary.totalLearners.toLocaleString()} คน)</span>
              </div>
              <p className="kpi-sub">
                เพศชาย {summary.assessedMale} คน ({summary.assessedMalePct}%) · หญิง {summary.assessedFemale} คน ({summary.assessedFemalePct}%)
              </p>
            </div>

            <div className="clean-kpi emerald">
              <span className="kpi-label"><CheckCircle size={15} /> ผ่านการประเมิน (≥70%)</span>
              <div className="kpi-main">
                <strong>{summary.learnerPassRatePct}%</strong>
                <span>ผ่าน {summary.passedLearners} / ไม่ผ่าน {summary.notPassedLearners} คน</span>
              </div>
              <p className="kpi-sub">คิดเป็นไม่ผ่าน {summary.learnerFailRatePct}% (จากผู้ประเมินครบ 4 ทักษะ)</p>
            </div>

            <div className="clean-kpi amber">
              <span className="kpi-label"><BookOpen size={15} /> ความครบถ้วน 4 ทักษะ</span>
              <div className="kpi-main">
                <strong>{summary.completed4Learners.toLocaleString()}</strong>
                <span>ครบ ({summary.completed4RatePct}%)</span>
              </div>
              <p className="kpi-sub">ยังทำไม่ครบ {summary.incomplete4Learners} คน ({summary.incomplete4RatePct}%)</p>
            </div>

            <div className="clean-kpi slate">
              <span className="kpi-label"><MapPin size={15} /> พื้นที่ดำเนินการ</span>
              <div className="kpi-main">
                <strong>{summary.districtCount}</strong>
                <span>อำเภอ · {summary.subdistrictCount} ตำบล</span>
              </div>
              <p className="kpi-sub">บันทึกการทำข้อสอบรวม {summary.totalAttempts.toLocaleString()} ครั้ง</p>
            </div>
          </div>

          {/* 2 Clean Overview Charts Side-by-Side */}
          <div className="clean-charts-pair">
            <section className="clean-panel">
              <div className="clean-panel-header">
                <div>
                  <h3>สรุปผลการประเมินราย 4 ทักษะ</h3>
                  <p className="admin-muted">การฟัง การพูด การอ่าน และการเขียน (เกณฑ์ผ่าน ≥ 70%)</p>
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
                  >ชาย – หญิง</button>
                </div>
              </div>
              <div className="analytics-chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  {skillChartMode === 'passFail' ? (
                    <BarChart data={summary.skillBreakdown} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="shortName" tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="passedCount" name="ผ่านเกณฑ์" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="failedCount" name="ไม่ผ่านเกณฑ์" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={summary.skillBreakdown} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="shortName" tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="passedMale" name="ผ่าน (ชาย)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="passedFemale" name="ผ่าน (หญิง)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="failedMale" name="ไม่ผ่าน (ชาย)" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="failedFemale" name="ไม่ผ่าน (หญิง)" fill="#fbcfe8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </section>

            <section className="clean-panel">
              <div className="clean-panel-header">
                <div>
                  <h3>สัดส่วนเพศ และสถานะผลการประเมิน</h3>
                  <p className="admin-muted">ภาพรวมผู้เรียนในขอบเขตที่เลือก ({summary.totalLearners} คน)</p>
                </div>
              </div>
              <div className="analytics-pies-wrap">
                <div className="analytics-pie-item">
                  <h4>จำแนกเพศ ({summary.assessedLearners} คน)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={summary.genderDistribution.filter(d => d.count > 0)}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={72}
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
                  <h4>ผลการประเมิน ({summary.totalLearners} คน)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={summary.outcomeDistribution.filter(d => d.count > 0)}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={72}
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

          {summary.dailyTrend.length > 0 && (
            <section className="clean-panel">
              <div className="clean-panel-header">
                <div>
                  <h3>แนวโน้มการประเมินรายวัน</h3>
                  <p className="admin-muted">จำนวนการสอบและคะแนนเฉลี่ยในแต่ละวัน</p>
                </div>
              </div>
              <div className="analytics-chart-box">
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={summary.dailyTrend} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <Legend verticalAlign="top" height={30} />
                    <Area yAxisId="left" type="monotone" dataKey="attempts" name="ครั้งที่สอบ" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="avgPct" name="คะแนนเฉลี่ย (%)" stroke="#10b981" fill="#d1fae5" fillOpacity={0.35} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Quick Links to Deep-Dive Tabs */}
          <div className="clean-quick-links">
            <button type="button" onClick={() => setSectionTab('skills')}>
              <span>ดูตารางผล 4 ทักษะ (ชาย/หญิง/ร้อยละ)</span> <ArrowRight size={15} />
            </button>
            <button type="button" onClick={() => setSectionTab('areas')}>
              <span>ดูข้อมูลรายอำเภอ 13 แห่ง &amp; รายตำบล</span> <ArrowRight size={15} />
            </button>
            <button type="button" onClick={() => setSectionTab('learners')}>
              <span>ค้นหารายชื่อ &amp; ตรวจผลรายบุคคล</span> <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: 4 SKILLS ==================== */}
      {sectionTab === 'skills' && (
        <div className="clean-section-stack">
          <section className="clean-panel">
            <div className="clean-panel-header">
              <div>
                <h3>ตารางผลการประเมินจำแนกราย ๔ ทักษะ (ชาย–หญิง และร้อยละ)</h3>
                <p className="admin-muted">
                  ประเมินตามเกณฑ์ ≥ 70% ของคะแนนเต็มแต่ละทักษะ (ผู้เรียนในขอบเขต {summary.totalLearners} คน)
                </p>
              </div>
              <div className="clean-panel-actions">
                <button type="button" className="clean-btn-outline excel" onClick={() => exportExcel('province', 'รายงานภาพรวมและผลรายทักษะ')}>
                  <FileDown size={15} /> Excel
                </button>
                <button type="button" className="clean-btn-outline" onClick={() => exportCsvTarget('province')}>
                  <FileSpreadsheet size={15} /> CSV
                </button>
              </div>
            </div>

            <div className="clean-table-wrap">
              <table className="clean-table analytics-skill-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>ทักษะการประเมิน</th>
                    <th colSpan={3} className="group-head">เข้ารับการประเมิน (คน)</th>
                    <th colSpan={3} className="group-head green-head">ผ่านการประเมิน (คน)</th>
                    <th colSpan={3} className="group-head rose-head">ไม่ผ่านการประเมิน (คน)</th>
                    <th rowSpan={2} className="num">ร้อยละผ่าน</th>
                    <th rowSpan={2} className="num">ร้อยละไม่ผ่าน</th>
                    <th rowSpan={2} className="num">คะแนนเฉลี่ย</th>
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
                      <td className="primary-cell">
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
                      <td className="num"><strong className="text-green">{s.passRatePct}%</strong></td>
                      <td className="num"><strong className="text-rose">{s.failRatePct}%</strong></td>
                      <td className="num">{s.avgScore} / {s.maxScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="clean-panel">
            <div className="clean-panel-header">
              <div>
                <h3>กราฟเปรียบเทียบผลแต่ละทักษะ</h3>
                <p className="admin-muted">สลับมุมมองผ่าน/ไม่ผ่าน หรือแยกตามเพศชาย–หญิง</p>
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
                  <BarChart data={summary.skillBreakdown} margin={{ top: 10, right: 16, left: -10, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="passedCount" name="ผ่านการประเมิน" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failedCount" name="ไม่ผ่านการประเมิน" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={summary.skillBreakdown} margin={{ top: 10, right: 16, left: -10, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="passedMale" name="ผ่าน (ชาย)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passedFemale" name="ผ่าน (หญิง)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failedMale" name="ไม่ผ่าน (ชาย)" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failedFemale" name="ไม่ผ่าน (หญิง)" fill="#fbcfe8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* ==================== TAB 3: AREAS ==================== */}
      {sectionTab === 'areas' && (
        <div className="clean-section-stack">
          <section className="clean-panel">
            <div className="clean-panel-header">
              <div>
                <h3>
                  {areaLevel === 'subdistrict'
                    ? (districtFilter !== 'all' ? `กราฟเปรียบเทียบรายตำบล — อำเภอ${districtFilter}` : 'กราฟเปรียบเทียบรายตำบล (สูงสุด 15 ตำบล)')
                    : `กราฟเปรียบเทียบรายอำเภอ (${districtRows.length} แห่ง)`}
                </h3>
                <p className="admin-muted">สลับมุมมองผลการประเมิน จำนวนชาย–หญิง หรือร้อยละผ่านเกณฑ์</p>
              </div>
              <div className="analytics-seg">
                <button
                  type="button"
                  aria-pressed={areaChartMode === 'counts'}
                  onClick={() => setAreaChartMode('counts')}
                >ผ่าน / ไม่ครบ</button>
                <button
                  type="button"
                  aria-pressed={areaChartMode === 'gender'}
                  onClick={() => setAreaChartMode('gender')}
                >ชาย – หญิง</button>
                <button
                  type="button"
                  aria-pressed={areaChartMode === 'passRate'}
                  onClick={() => setAreaChartMode('passRate')}
                >อัตราผ่าน (%)</button>
              </div>
            </div>

            <div className="analytics-chart-box">
              {(areaLevel === 'subdistrict' ? subdistrictChartData : districtChartData).length === 0 ? (
                <p className="admin-empty">ยังไม่มีข้อมูลพื้นที่ตามตัวกรอง</p>
              ) : (
                <ResponsiveContainer width="100%" height={290}>
                  {areaChartMode === 'counts' ? (
                    <BarChart
                      data={areaLevel === 'subdistrict' ? subdistrictChartData : districtChartData}
                      margin={{ top: 10, right: 14, left: -12, bottom: 28 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey={areaLevel === 'subdistrict' ? 'subdistrict' : 'district'} tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-20} textAnchor="end" height={58} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="passedLearnerCount" name="ผ่านเกณฑ์" stackId="a" fill="#10b981" />
                      <Bar dataKey="failedLearnerCount" name="ไม่ผ่านเกณฑ์" stackId="a" fill="#f43f5e" />
                      <Bar dataKey="incomplete4Count" name="ยังไม่ครบ 4 ทักษะ" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : areaChartMode === 'gender' ? (
                    <BarChart
                      data={areaLevel === 'subdistrict' ? subdistrictChartData : districtChartData}
                      margin={{ top: 10, right: 14, left: -12, bottom: 28 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey={areaLevel === 'subdistrict' ? 'subdistrict' : 'district'} tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-20} textAnchor="end" height={58} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="maleCount" name="เพศชาย" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="femaleCount" name="เพศหญิง" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart
                      data={areaLevel === 'subdistrict' ? subdistrictChartData : districtChartData}
                      margin={{ top: 10, right: 14, left: -12, bottom: 28 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey={areaLevel === 'subdistrict' ? 'subdistrict' : 'district'} tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-20} textAnchor="end" height={58} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} formatter={(v) => `${v ?? 0}%`} />
                      <Legend verticalAlign="top" height={32} />
                      <Bar dataKey="exactPassRate" name="ร้อยละผ่าน (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avgPct" name="คะแนนเฉลี่ย (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {areaLevel !== 'subdistrict' && (
            <AreaBreakdownTable
              title={`ตารางสรุประดับอำเภอ (${districtRows.length} แห่ง)`}
              subtitle="คลิกแถวอำเภอเพื่อเจาะดูรายตำบลภายในอำเภอนั้น"
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
              onExportCsv={() => exportCsvTarget('district')}
            />
          )}

          {(areaLevel === 'subdistrict' || areaLevel === 'province') && (
            <AreaBreakdownTable
              title={
                districtFilter !== 'all'
                  ? `ตารางสรุประดับตำบล — อำเภอ${districtFilter} (${subdistrictRows.length} ตำบล)`
                  : `ตารางสรุประดับตำบล (${subdistrictRows.length} ตำบล)`
              }
              subtitle="คลิกแถวตำบลเพื่อกรองดูรายชื่อผู้เรียนในตำบลนั้น"
              rows={subdistrictRows}
              mode="subdistrict"
              selectedDistrict={districtFilter}
              selectedSubdistrict={subdistrictFilter}
              onSelectRow={(row) => {
                if (subdistrictFilter === row.subdistrict) {
                  setSubdistrictFilter('all');
                } else {
                  if (row.district && row.district !== 'ไม่ระบุ') setDistrictFilter(row.district);
                  setSubdistrictFilter(row.subdistrict);
                }
                setSectionTab('learners');
                setDetailPage(1);
              }}
              onExportExcel={() => exportExcel('subdistrict', 'รายงานข้อมูลรายตำบล')}
              onExportCsv={() => exportCsvTarget('subdistrict')}
            />
          )}
        </div>
      )}

      {/* ==================== TAB 4: LEARNERS ==================== */}
      {sectionTab === 'learners' && (
        <section className="clean-panel">
          <div className="clean-panel-header">
            <div>
              <h3>รายชื่อผู้เรียนและผลการประเมิน 4 ทักษะ ({activeRows.length} รายการ)</h3>
              <p className="admin-muted">คลิก "ดูรายบุคคล" เพื่อตรวจสอบคะแนนและสถานะทั้ง 4 ทักษะอย่างละเอียด</p>
            </div>
            <div className="clean-panel-actions">
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
                >รายครั้งสอบ ({filtered.attempts.length})</button>
              </div>
              {detailMode === 'learners' ? (
                <>
                  <button type="button" className="clean-btn-outline excel" onClick={() => exportExcel('learners', 'รายงานรายบุคคล_4ทักษะ')}>
                    <FileDown size={15} /> Excel
                  </button>
                  <button type="button" className="clean-btn-outline" onClick={() => exportCsvTarget('learners')}>
                    <FileSpreadsheet size={15} /> CSV
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="clean-btn-outline"
                  onClick={() => onDownloadCsv(
                    buildHistoryCsv({ history: filtered.attempts, users, surveys, formatDate }),
                    `ประวัติผลสอบแยกย่อย_${dateTag}.csv`
                  )}
                >
                  <FileSpreadsheet size={15} /> CSV ประวัติสอบ
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
            <div className="clean-table-wrap">
              {detailMode === 'learners' ? (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>ชื่อ-นามสกุล (เพศ)</th>
                      <th>พื้นที่ (ตำบล / อำเภอ)</th>
                      <th>ผลประเมิน (ความครบถ้วน)</th>
                      <th className="num">ฟัง (25)</th>
                      <th className="num">พูด (15)</th>
                      <th className="num">อ่าน (30)</th>
                      <th className="num">เขียน (30)</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedDetailRows.map(l => (
                      <tr key={l.id}>
                        <td>
                          <strong className="primary-cell">{l.name || 'ไม่ระบุชื่อ'}</strong>
                          <div className="sub-meta">
                            เพศ{l.gender || 'ไม่ระบุ'}
                            {l.age ? ` · ${l.age} ปี` : ''}
                            {` · @${l.username}`}
                          </div>
                        </td>
                        <td>
                          <div>ต.{l.subdistrict}</div>
                          <div className="sub-meta">อ.{l.district}</div>
                        </td>
                        <td>
                          <span className={`analytics-pill ${l.assessmentStatus === 'passed' ? 'green' : l.assessmentStatus === 'failed' ? 'red' : 'amber'}`}>
                            {l.assessmentStatusLabel}
                            {l.overallPct !== null ? ` (${l.overallPct}%)` : ''}
                          </span>
                          <div className="sub-meta">ทำแล้ว {l.assessedSkillCount}/4 ทักษะ</div>
                        </td>
                        <td className="num"><SkillScoreText skill={l.skills?.listening} /></td>
                        <td className="num"><SkillScoreText skill={l.skills?.speaking} /></td>
                        <td className="num"><SkillScoreText skill={l.skills?.reading} /></td>
                        <td className="num"><SkillScoreText skill={l.skills?.writing} /></td>
                        <td>
                          <button type="button" className="analytics-mini-btn" onClick={() => setInspectedLearner(l)}>
                            <Eye size={14} /> ดูรายบุคคล
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>วันที่สอบ</th>
                      <th>ผู้เข้าสอบ</th>
                      <th>ตำบล / อำเภอ</th>
                      <th>แบบทดสอบ</th>
                      <th className="num">คะแนน (%)</th>
                      <th>ผลประเมิน</th>
                      <th className="num">ฟัง</th>
                      <th className="num">พูด</th>
                      <th className="num">อ่าน</th>
                      <th className="num">เขียน</th>
                      <th>ตรวจละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedDetailRows.map((a, idx) => (
                      <tr key={a.id || idx}>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.taken_at)}</td>
                        <td>
                          <strong className="primary-cell">{a.user?.name}</strong>
                          <div className="sub-meta">เพศ{a.gender || 'ไม่ระบุ'} · @{a.user?.username}</div>
                        </td>
                        <td>
                          <div>ต.{a.subdistrict}</div>
                          <div className="sub-meta">อ.{a.district}</div>
                        </td>
                        <td>{SKILL_LABELS[a.skill] || a.skill}</td>
                        <td className="num">
                          <strong>{a.score}/{a.max_score}</strong>
                          <div className="sub-meta">{a.pct}%</div>
                        </td>
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
                            <Eye size={14} /> ตรวจข้อสอบ
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
      )}

      {/* Individual Learner 4-Skill Scorecard Modal */}
      {inspectedLearner && (
        <ModalPortal label="รายงานผลประเมินรายบุคคล" onClose={() => setInspectedLearner(null)}>
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
