import { useMemo, useState, useRef, useEffect } from 'react';
import ModalPortal from './ModalPortal';
import logoImg from '../assets/logo.jpg';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, PieChart, Pie, LabelList
} from 'recharts';
import {
  Users, ClipboardCheck, Hourglass, Search, FileSpreadsheet,
  ChevronDown, ChevronRight, Calendar, MapPin, Headphones, MessageCircle, BookOpen,
  PenTool, RotateCcw, AlertCircle, X, Eye, UserCheck, UserRound, Check, X as XIcon
} from 'lucide-react';
import {
  SKILL_META,
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

const SKILL_ICONS = {
  listening: Headphones,
  speaking: MessageCircle,
  reading: BookOpen,
  writing: PenTool,
};

const DETAIL_PAGE_SIZE = 25;
const RADIAN = Math.PI / 180;

const fmtPct = (v) => `${Number(v || 0).toFixed(2)}%`;

function renderDonutSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (!percent || percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(2)}%`}
    </text>
  );
}

function SkillStatusBadge({ skill }) {
  if (!skill || !skill.assessed) {
    return (
      <span className="exec-skill-dash" title={skill?.pending ? 'อยู่ระหว่างรอตรวจ' : 'ยังไม่ได้ประเมิน'}>
        —
      </span>
    );
  }
  const tip = `${skill.score}/${skill.max} (${skill.exactPct}%)`;
  if (skill.passed) {
    return (
      <span className="exec-circle-mark pass" title={`ผ่าน · ${tip}`}>
        <Check size={12} strokeWidth={3.2} />
      </span>
    );
  }
  return (
    <span className="exec-circle-mark fail" title={`ไม่ผ่าน · ${tip}`}>
      <XIcon size={12} strokeWidth={3.2} />
    </span>
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
}) {
  // Navigation & UI state
  const [areaLevel, setAreaLevel] = useState('province'); // 'province' | 'district' | 'subdistrict'
  const [showLearnerFilters, setShowLearnerFilters] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const searchSectionRef = useRef(null);
  const searchInputRef = useRef(null);

  // Unified filters
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subdistrictFilter, setSubdistrictFilter] = useState('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState('literacy'); // 'literacy' | 'all' | 'other'
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prefixFilter, setPrefixFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [detailSearch, setDetailSearch] = useState('');

  const [detailPage, setDetailPage] = useState(1);
  const [inspectedLearner, setInspectedLearner] = useState(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
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
      includeAllNarathiwatDistricts: districtFilter === 'all',
    }),
    [filtered.learners, filtered.attempts, districtFilter]
  );

  const subdistrictRows = useMemo(
    () => aggregateByArea(filtered.learners, filtered.attempts, 'subdistrict'),
    [filtered.learners, filtered.attempts]
  );

  const isSubdistrictAreaView = areaLevel === 'subdistrict' || districtFilter !== 'all';
  const activeAreaRows = isSubdistrictAreaView ? subdistrictRows : districtRows;
  const visibleAreaRows = showAllAreas ? activeAreaRows : activeAreaRows.slice(0, 5);

  const areaTotals = useMemo(() => {
    const sum = activeAreaRows.reduce((acc, r) => {
      acc.total += r.learnerCount || 0;
      acc.male += r.maleCount || 0;
      acc.female += r.femaleCount || 0;
      acc.passed += r.passedLearnerCount || 0;
      acc.failed += r.failedLearnerCount ?? r.notPassedLearnerCount ?? 0;
      return acc;
    }, { total: 0, male: 0, female: 0, passed: 0, failed: 0 });
    const denom = sum.passed + sum.failed;
    const passRate = denom > 0 ? Number(((sum.passed / denom) * 100).toFixed(2)) : 0;
    return { ...sum, passRate };
  }, [activeAreaRows]);

  const overallPieData = useMemo(() => ([
    { name: 'ผ่านการประเมิน', value: summary.passedLearners, pct: summary.learnerPassRatePct, color: '#7c3aed' },
    { name: 'ไม่ผ่านการประเมิน', value: summary.notPassedLearners, pct: summary.learnerFailRatePct, color: '#f472b6' },
  ]), [summary]);

  const genderPieData = useMemo(() => ([
    { name: 'ชาย', value: summary.assessedMale, pct: summary.assessedMalePct, color: '#3b82f6' },
    { name: 'หญิง', value: summary.assessedFemale, pct: summary.assessedFemalePct, color: '#f472b6' },
    ...(summary.assessedOtherGender > 0
      ? [{ name: 'ไม่ระบุ', value: summary.assessedOtherGender, pct: Number((100 - summary.assessedMalePct - summary.assessedFemalePct).toFixed(2)), color: '#94a3b8' }]
      : []),
  ]), [summary]);

  const skillBarData = useMemo(
    () => summary.skillBreakdown.map(s => ({
      name: s.shortName,
      passRatePct: s.assessedCount > 0 ? s.passRatePct : 0,
      failRatePct: s.assessedCount > 0 ? s.failRatePct : 0,
      passLabel: s.assessedCount > 0 && s.passRatePct >= 12 ? `${s.passRatePct.toFixed(2)}%` : '',
      failLabel: s.assessedCount > 0 && s.failRatePct >= 10 ? `${s.failRatePct.toFixed(2)}%` : '',
      passedCount: s.passedCount,
      failedCount: s.failedCount,
    })),
    [summary.skillBreakdown]
  );

  // Pagination for learner list
  const detailPageCount = Math.max(1, Math.ceil(filtered.learners.length / DETAIL_PAGE_SIZE));
  const currentDetailPage = Math.min(detailPage, detailPageCount);
  const pagedLearners = filtered.learners.slice(
    (currentDetailPage - 1) * DETAIL_PAGE_SIZE,
    currentDetailPage * DETAIL_PAGE_SIZE
  );

  const handleAreaLevelChange = (level) => {
    setAreaLevel(level);
    if (level === 'province') {
      setDistrictFilter('all');
      setSubdistrictFilter('all');
    } else if (level === 'district') {
      setSubdistrictFilter('all');
    }
    setDetailPage(1);
  };

  const handleDistrictChange = (val) => {
    setDistrictFilter(val);
    setSubdistrictFilter('all');
    if (val !== 'all' && areaLevel === 'province') {
      setAreaLevel('subdistrict');
    } else if (val === 'all' && areaLevel === 'subdistrict') {
      setAreaLevel('district');
    }
    setDetailPage(1);
  };

  const openLearnerSearch = () => {
    setShowLearnerFilters(true);
    setTimeout(() => {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      searchInputRef.current?.focus();
    }, 60);
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

  const hasCustomFilter =
    Boolean(detailSearch) ||
    prefixFilter !== 'all' ||
    genderFilter !== 'all' ||
    statusFilter !== 'all' ||
    enrollmentFilter !== 'literacy' ||
    districtFilter !== 'all' ||
    subdistrictFilter !== 'all' ||
    dateRange !== 'all';

  const dateTag = new Date().toISOString().slice(0, 10);
  const activeFilterSummaryText = useMemo(() => {
    const parts = [
      enrollmentFilter === 'literacy'
        ? 'กลุ่ม: ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ'
        : (enrollmentFilter === 'other' ? 'กลุ่ม: บุคคลทั่วไป' : 'กลุ่ม: ผู้เรียนทั้งหมด'),
      districtFilter === 'all' ? 'จังหวัดนราธิวาส (ทุกอำเภอ)' : `อ.${districtFilter}`,
      subdistrictFilter !== 'all' ? `ต.${subdistrictFilter}` : null,
      genderFilter !== 'all' ? `เพศ${genderFilter}` : null,
      statusFilter !== 'all' ? `สถานะ: ${statusFilter}` : null,
    ].filter(Boolean);
    return parts.join(' | ');
  }, [enrollmentFilter, districtFilter, subdistrictFilter, genderFilter, statusFilter]);

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
    } else if (target === 'learners') {
      onDownloadCsv(buildLearnersCsv(filtered.learners, formatDate), `รายงานรายบุคคล_4ทักษะ_${dateTag}.csv`);
    } else {
      onDownloadCsv(
        buildHistoryCsv({ history: filtered.attempts, users, surveys, formatDate }),
        `ประวัติผลสอบทั้งหมด_${dateTag}.csv`
      );
    }
    setShowExportMenu(false);
  };

  const subtitleLabel =
    enrollmentFilter === 'literacy'
      ? 'ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ'
      : (enrollmentFilter === 'other' ? 'ผู้เรียนทั่วไป (นอกกิจกรรมฯ)' : 'ผู้เรียนทั้งหมดในระบบ');

  return (
    <div className="exec-dashboard animate-fade-in">
      {/* 1. Top Official Banner */}
      <header className="exec-hero">
        <div className="exec-hero-left">
          <h2>แดชบอร์ดผลการประเมินทักษะภาษาไทย</h2>
          <p>{subtitleLabel}</p>
        </div>

        <div className="exec-hero-right">
          <label className="exec-fy-picker">
            <Calendar size={16} color="#5b21b6" />
            <select
              aria-label="ปีงบประมาณหรือช่วงเวลา"
              value={dateRange}
              onChange={e => { setDateRange(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกปีงบประมาณ</option>
              <option value="fy2570">ปีงบประมาณ พ.ศ. 2570</option>
              <option value="fy2569">ปีงบประมาณ พ.ศ. 2569</option>
              <option value="fy2568">ปีงบประมาณ พ.ศ. 2568</option>
              <option value="month">30 วันล่าสุด</option>
              <option value="week">7 วันล่าสุด</option>
              <option value="today">วันนี้</option>
            </select>
          </label>

          <div className="exec-agency-badge">
            <MapPin size={18} color="#4c1d95" />
            <div>
              <strong>สำนักงานส่งเสริมการเรียนรู้</strong>
              <span>ประจำจังหวัดนราธิวาส</span>
            </div>
            <img src={logoImg} alt="ตราสัญลักษณ์" className="exec-agency-logo" />
          </div>
        </div>
      </header>

      {/* 2. Control & Filter Toolbar */}
      <section className="exec-controls-bar">
        <div className="exec-control-group">
          <span className="exec-ctrl-label">ระดับข้อมูล :</span>
          <div className="exec-level-pills" role="group" aria-label="เลือกระดับข้อมูล">
            <button type="button" aria-pressed={areaLevel === 'province'} onClick={() => handleAreaLevelChange('province')}>
              ภาพรวมจังหวัด
            </button>
            <button type="button" aria-pressed={areaLevel === 'district'} onClick={() => handleAreaLevelChange('district')}>
              รายอำเภอ
            </button>
            <button type="button" aria-pressed={areaLevel === 'subdistrict'} onClick={() => handleAreaLevelChange('subdistrict')}>
              รายตำบล
            </button>
          </div>
        </div>

        <label className="exec-control-select">
          <span className="exec-ctrl-label">อำเภอ :</span>
          <select value={districtFilter} onChange={e => handleDistrictChange(e.target.value)}>
            <option value="all">ทุกอำเภอ</option>
            {areaOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label className="exec-control-select">
          <span className="exec-ctrl-label">ตำบล :</span>
          <select
            value={subdistrictFilter}
            onChange={e => {
              setSubdistrictFilter(e.target.value);
              if (e.target.value !== 'all') setAreaLevel('subdistrict');
              setDetailPage(1);
            }}
          >
            <option value="all">ทุกตำบล</option>
            {areaOptions.subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <div className="exec-control-actions">
          {anomalyCount > 0 && onOpenLocationCleanup && (
            <button type="button" className="exec-warn-btn" onClick={onOpenLocationCleanup}>
              <AlertCircle size={15} /> แก้ชื่อพื้นที่ ({anomalyCount})
            </button>
          )}

          <button type="button" className="exec-purple-btn" onClick={openLearnerSearch}>
            <Search size={15} /> ค้นหารายชื่อผู้เรียน
          </button>

          <div className="exec-export-wrap" ref={exportMenuRef}>
            <button
              type="button"
              className="exec-green-btn"
              aria-expanded={showExportMenu}
              onClick={() => setShowExportMenu(v => !v)}
            >
              <FileSpreadsheet size={15} /> ดาวน์โหลดข้อมูล <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="clean-export-menu" role="menu">
                <div className="clean-export-menu-head">ส่งออกตรงตามตัวกรองปัจจุบัน</div>
                {[
                  { key: 'province', label: 'ข้อมูลภาพรวมระดับจังหวัด', excelName: 'รายงานภาพรวมระดับจังหวัด' },
                  { key: 'district', label: `ข้อมูลรายอำเภอ (${districtRows.length})`, excelName: 'รายงานข้อมูลรายอำเภอ' },
                  { key: 'subdistrict', label: `ข้อมูลรายตำบล (${subdistrictRows.length})`, excelName: 'รายงานข้อมูลรายตำบล' },
                  { key: 'learners', label: `รายบุคคล 4 ทักษะ (${filtered.learners.length})`, excelName: 'รายงานรายบุคคล_4ทักษะ' },
                ].map(item => (
                  <div key={item.key} className="clean-export-row">
                    <span>{item.label}</span>
                    <div>
                      <button type="button" className="mini-dl excel" onClick={() => exportExcel(item.key, item.excelName)}>Excel</button>
                      <button type="button" className="mini-dl csv" onClick={() => exportCsvTarget(item.key)}>CSV</button>
                    </div>
                  </div>
                ))}
                <div className="clean-export-row">
                  <span>ประวัติผลสอบทั้งหมด ({filtered.attempts.length})</span>
                  <div>
                    <button type="button" className="mini-dl csv" onClick={() => exportCsvTarget('history')}>CSV</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {loading && <p className="admin-muted" role="status">กำลังโหลดข้อมูล...</p>}

      {/* 3. 7-Card KPI Strip */}
      <section className="exec-kpi-strip" aria-label="สรุปตัวชี้วัดหลัก">
        <div className="exec-kpi-card exec-kpi-first">
          <div className="exec-kpi-icon purple"><Users size={22} /></div>
          <div className="exec-kpi-body">
            <span>ผู้เข้ารับการประเมิน<br />ทั้งหมด</span>
            <strong>{summary.assessedLearners.toLocaleString()} <small>คน</small></strong>
          </div>
        </div>

        <div className="exec-kpi-card">
          <div className="exec-kpi-icon solid-blue"><UserCheck size={18} /></div>
          <div className="exec-kpi-body">
            <span>เพศชาย</span>
            <strong>{summary.assessedMale.toLocaleString()} <small>คน</small></strong>
            <em>({fmtPct(summary.assessedMalePct)})</em>
          </div>
        </div>

        <div className="exec-kpi-card">
          <div className="exec-kpi-icon solid-pink"><UserRound size={18} /></div>
          <div className="exec-kpi-body">
            <span>เพศหญิง</span>
            <strong>{summary.assessedFemale.toLocaleString()} <small>คน</small></strong>
            <em>({fmtPct(summary.assessedFemalePct)})</em>
          </div>
        </div>

        <div className="exec-kpi-card">
          <div className="exec-kpi-icon solid-green"><Check size={18} strokeWidth={3} /></div>
          <div className="exec-kpi-body">
            <span>ผ่านการประเมิน</span>
            <strong>{summary.passedLearners.toLocaleString()} <small>คน</small></strong>
            <em className="text-green">({fmtPct(summary.learnerPassRatePct)})</em>
          </div>
        </div>

        <div className="exec-kpi-card">
          <div className="exec-kpi-icon solid-rose"><XIcon size={18} strokeWidth={3} /></div>
          <div className="exec-kpi-body">
            <span>ไม่ผ่านการประเมิน</span>
            <strong>{summary.notPassedLearners.toLocaleString()} <small>คน</small></strong>
            <em className="text-rose">({fmtPct(summary.learnerFailRatePct)})</em>
          </div>
        </div>

        <div className="exec-kpi-card">
          <div className="exec-kpi-icon solid-indigo"><ClipboardCheck size={18} /></div>
          <div className="exec-kpi-body">
            <span>ประเมินครบ 4 ทักษะ</span>
            <strong>{summary.completed4Learners.toLocaleString()} <small>คน</small></strong>
            <em>({fmtPct(summary.completed4RatePct)})</em>
          </div>
        </div>

        <div className="exec-kpi-card">
          <div className="exec-kpi-icon solid-amber"><Hourglass size={18} /></div>
          <div className="exec-kpi-body">
            <span>ยังไม่ครบ 4 ทักษะ</span>
            <strong>{summary.incomplete4Learners.toLocaleString()} <small>คน</small></strong>
            <em>({fmtPct(summary.incomplete4RatePct)})</em>
          </div>
        </div>
      </section>

      {/* 4. 3-Column Charts Row */}
      <section className="exec-charts-row">
        {/* Chart 1: Overall Pass / Fail Donut */}
        <div className="exec-card">
          <div className="exec-card-title centered">ผลการประเมินโดยรวม</div>
          <div className="exec-donut-layout">
            <div className="exec-donut-canvas">
              {summary.evaluatedLearners === 0 ? (
                <p className="exec-empty-chart">ยังไม่มีข้อมูลผู้ประเมินครบ</p>
              ) : (
                <ResponsiveContainer width="100%" height={205}>
                  <PieChart>
                    <Pie
                      data={overallPieData.filter(d => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={78}
                      startAngle={90}
                      endAngle={-270}
                      labelLine={false}
                      label={renderDonutSliceLabel}
                    >
                      {overallPieData.filter(d => d.value > 0).map(entry => (
                        <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v, name) => [`${Number(v).toLocaleString()} คน`, name]} />
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="exec-donut-center-num">
                      {summary.evaluatedLearners.toLocaleString()}
                    </text>
                    <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" className="exec-donut-center-sub">
                      คน
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="exec-legend-list">
              {overallPieData.map(item => (
                <div key={item.name} className="exec-legend-item">
                  <span className="exec-legend-dot" style={{ background: item.color }} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.value.toLocaleString()} คน ({fmtPct(item.pct)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: 4-Skill 100% Stacked Bar */}
        <div className="exec-card">
          <div className="exec-card-title centered">ผลการประเมินรายทักษะ (ผ่าน/ไม่ผ่าน)</div>
          <div className="exec-bar-canvas">
            <ResponsiveContainer width="100%" height={205}>
              <BarChart data={skillBarData} margin={{ top: 10, right: 4, left: -16, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 700 }} />
                <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} unit="%" tick={{ fontSize: 11, fill: '#475569' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                  formatter={(value, name, props) => {
                    const cnt = name === 'ผ่าน' ? props.payload.passedCount : props.payload.failedCount;
                    return [`${Number(value).toFixed(2)}% (${cnt} คน)`, name];
                  }}
                />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="square" wrapperStyle={{ fontSize: '12px', paddingLeft: '4px' }} />
                <Bar dataKey="passRatePct" name="ผ่าน" stackId="sk" fill="#6d28d9">
                  <LabelList dataKey="passLabel" position="center" fill="#ffffff" fontSize={10.5} fontWeight={700} />
                </Bar>
                <Bar dataKey="failRatePct" name="ไม่ผ่าน" stackId="sk" fill="#f472b6" radius={[5, 5, 0, 0]}>
                  <LabelList dataKey="failLabel" position="center" fill="#ffffff" fontSize={10.5} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Gender Donut */}
        <div className="exec-card">
          <div className="exec-card-title centered">จำนวนผู้เข้ารับการประเมิน จำแนกตามเพศ</div>
          <div className="exec-donut-layout">
            <div className="exec-donut-canvas">
              {summary.assessedLearners === 0 ? (
                <p className="exec-empty-chart">ยังไม่มีข้อมูลผู้ประเมิน</p>
              ) : (
                <ResponsiveContainer width="100%" height={205}>
                  <PieChart>
                    <Pie
                      data={genderPieData.filter(d => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={78}
                      startAngle={90}
                      endAngle={-270}
                      labelLine={false}
                      label={renderDonutSliceLabel}
                    >
                      {genderPieData.filter(d => d.value > 0).map(entry => (
                        <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v, name) => [`${Number(v).toLocaleString()} คน`, name]} />
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="exec-donut-center-num">
                      {summary.assessedLearners.toLocaleString()}
                    </text>
                    <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" className="exec-donut-center-sub">
                      คน
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="exec-legend-list">
              {genderPieData.map(item => (
                <div key={item.name} className="exec-legend-item">
                  <span className="exec-legend-dot" style={{ background: item.color }} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.value.toLocaleString()} คน ({fmtPct(item.pct)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Side-by-Side Tables: 4-Skill Summary (Left) + Area Breakdown (Right) */}
      <section className="exec-tables-row">
        {/* Left: 4-Skill Summary Table */}
        <div className="exec-panel">
          <div className="exec-panel-head">
            <h3>สรุปผลการประเมินรายทักษะ</h3>
          </div>
          <div className="exec-table-wrap">
            <table className="exec-table exec-skill-summary-table">
              <thead>
                <tr>
                  <th rowSpan={2}>ทักษะ</th>
                  <th colSpan={3} className="group">ผู้เข้ารับการประเมิน (คน)</th>
                  <th colSpan={3} className="group">ผ่านการประเมิน (คน)</th>
                  <th colSpan={3} className="group">ไม่ผ่านการประเมิน (คน)</th>
                  <th rowSpan={2} className="center">ร้อยละผ่าน</th>
                </tr>
                <tr>
                  <th className="num">ชาย</th>
                  <th className="num">หญิง</th>
                  <th className="num">รวม</th>
                  <th className="num">ชาย</th>
                  <th className="num">หญิง</th>
                  <th className="num">รวม</th>
                  <th className="num">ชาย</th>
                  <th className="num">หญิง</th>
                  <th className="num">รวม</th>
                </tr>
              </thead>
              <tbody>
                {summary.skillBreakdown.map(s => {
                  const Icon = SKILL_ICONS[s.key] || BookOpen;
                  return (
                    <tr key={s.key}>
                      <td className="skill-name-cell">
                        <Icon size={15} color={s.color} />
                        <strong>{s.shortName}</strong>
                      </td>
                      <td className="num group-start">{s.assessedMale.toLocaleString()}</td>
                      <td className="num">{s.assessedFemale.toLocaleString()}</td>
                      <td className="num strong">{s.assessedCount.toLocaleString()}</td>
                      <td className="num group-start">{s.passedMale.toLocaleString()}</td>
                      <td className="num">{s.passedFemale.toLocaleString()}</td>
                      <td className="num strong">{s.passedCount.toLocaleString()}</td>
                      <td className="num group-start">{s.failedMale.toLocaleString()}</td>
                      <td className="num">{s.failedFemale.toLocaleString()}</td>
                      <td className="num strong">{s.failedCount.toLocaleString()}</td>
                      <td className="center rate-col-cell">
                        <span className="exec-rate-text">{fmtPct(s.passRatePct)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: District / Subdistrict Breakdown Table */}
        <div className="exec-panel">
          <div className="exec-panel-head">
            <h3>
              {isSubdistrictAreaView
                ? (districtFilter !== 'all'
                    ? `จำนวนผู้เข้ารับการประเมินรายตำบล (อ.${districtFilter})`
                    : 'จำนวนผู้เข้ารับการประเมินรายตำบล')
                : 'จำนวนผู้เข้ารับการประเมินรายอำเภอ'}
            </h3>
            {activeAreaRows.length > 5 && (
              <button
                type="button"
                className="exec-see-all-btn"
                onClick={() => setShowAllAreas(v => !v)}
              >
                {showAllAreas ? 'ย่อลง' : 'ดูทั้งหมด'} <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="exec-table-wrap">
            <table className="exec-table exec-area-summary-table">
              <thead>
                <tr>
                  <th>{isSubdistrictAreaView ? 'ตำบล' : 'อำเภอ'}</th>
                  <th className="num">รวม (คน)</th>
                  <th className="num">ชาย (คน)</th>
                  <th className="num">หญิง (คน)</th>
                  <th className="num">ผ่าน (คน)</th>
                  <th className="num">ไม่ผ่าน (คน)</th>
                  <th className="center">ร้อยละผ่าน</th>
                </tr>
              </thead>
              <tbody>
                {visibleAreaRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="exec-no-rows">ไม่มีข้อมูลพื้นที่ตามตัวกรอง</td>
                  </tr>
                ) : (
                  <>
                    {visibleAreaRows.map(row => {
                      const passVal = row.exactPassRate ?? row.passRate;
                      return (
                        <tr
                          key={row.key}
                          className="clickable-row"
                          onClick={() => {
                            if (isSubdistrictAreaView) {
                              const same = subdistrictFilter === row.subdistrict;
                              setSubdistrictFilter(same ? 'all' : row.subdistrict);
                            } else {
                              setDistrictFilter(row.district);
                              setSubdistrictFilter('all');
                              setAreaLevel('subdistrict');
                            }
                            setDetailPage(1);
                          }}
                          title={isSubdistrictAreaView ? 'คลิกเพื่อกรองตำบลนี้' : 'คลิกเพื่อดูตำบลในอำเภอนี้'}
                        >
                          <td className="strong">
                            {isSubdistrictAreaView ? row.subdistrict : row.district}
                            {isSubdistrictAreaView && districtFilter === 'all' && (
                              <span className="area-sub-dist"> (อ.{row.district})</span>
                            )}
                          </td>
                          <td className="num">{row.learnerCount.toLocaleString()}</td>
                          <td className="num">{(row.maleCount ?? 0).toLocaleString()}</td>
                          <td className="num">{(row.femaleCount ?? 0).toLocaleString()}</td>
                          <td className="num">{(row.passedLearnerCount ?? 0).toLocaleString()}</td>
                          <td className="num">{(row.failedLearnerCount ?? row.notPassedLearnerCount ?? 0).toLocaleString()}</td>
                          <td className="center rate-col-cell">
                            {passVal === null ? '—' : <span className="exec-rate-text">{fmtPct(passVal)}</span>}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="exec-total-row">
                      <td>{districtFilter !== 'all' ? `รวม อ.${districtFilter}` : 'รวมทั้งจังหวัด'}</td>
                      <td className="num">{areaTotals.total.toLocaleString()}</td>
                      <td className="num">{areaTotals.male.toLocaleString()}</td>
                      <td className="num">{areaTotals.female.toLocaleString()}</td>
                      <td className="num">{areaTotals.passed.toLocaleString()}</td>
                      <td className="num">{areaTotals.failed.toLocaleString()}</td>
                      <td className="center">{fmtPct(areaTotals.passRate)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Bottom Learner Table */}
      <section className="exec-panel" ref={searchSectionRef}>
        <div className="exec-panel-head exec-learner-head">
          <h3>รายชื่อผู้เรียน</h3>

          <div className="exec-learner-head-right">
            <span className="exec-learner-count">{filtered.learners.length.toLocaleString()} คน</span>
            <button
              type="button"
              className="exec-filter-toggle-btn"
              onClick={() => setShowLearnerFilters(v => !v)}
            >
              <Search size={13} /> {showLearnerFilters ? 'ซ่อนตัวกรอง' : 'ค้นหา / กรอง'}
            </button>
          </div>
        </div>

        {(showLearnerFilters || hasCustomFilter) && (
          <div className="exec-learner-filter-bar">
            <div className="exec-inline-search">
              <Search size={14} color="#64748b" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ค้นหาคำนำหน้า ชื่อ-นามสกุล, อำเภอ, ตำบล..."
                value={detailSearch}
                onChange={e => { setDetailSearch(e.target.value); setDetailPage(1); }}
              />
            </div>

            <select
              aria-label="กรองคำนำหน้า"
              value={prefixFilter}
              onChange={e => { setPrefixFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกคำนำหน้า</option>
              {NAME_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              aria-label="กรองเพศ"
              value={genderFilter}
              onChange={e => { setGenderFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="ไม่ระบุ">ไม่ระบุ</option>
            </select>

            <select
              aria-label="กรองสถานะผลประเมิน"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="passed">ผ่าน</option>
              <option value="failed">ไม่ผ่าน</option>
              <option value="incomplete">ยังไม่ครบ</option>
            </select>

            <select
              aria-label="กรองกลุ่มผู้เรียน"
              value={enrollmentFilter}
              onChange={e => { setEnrollmentFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="literacy">ผู้เรียนกิจกรรมรู้หนังสือ</option>
              <option value="all">ผู้เรียนทั้งหมด</option>
              <option value="other">ผู้เรียนทั่วไป</option>
            </select>

            {hasCustomFilter && (
              <button type="button" className="exec-reset-btn" onClick={resetAllFilters}>
                <RotateCcw size={13} /> ล้างตัวกรอง
              </button>
            )}
          </div>
        )}

        <div className="exec-table-wrap">
          <table className="exec-table exec-learner-table">
            <thead>
              <tr>
                <th rowSpan={2} className="center">ลำดับ</th>
                <th rowSpan={2}>คำนำหน้า</th>
                <th rowSpan={2}>ชื่อ - นามสกุล</th>
                <th rowSpan={2}>อำเภอ</th>
                <th rowSpan={2}>ตำบล</th>
                <th rowSpan={2} className="center">เพศ</th>
                <th colSpan={4} className="group">ผลการประเมินรายทักษะ</th>
                <th rowSpan={2} className="center">ผลรวม</th>
                <th rowSpan={2} className="center">สถานะ</th>
              </tr>
              <tr>
                <th className="center sub-skill-head">การฟัง</th>
                <th className="center sub-skill-head">การพูด</th>
                <th className="center sub-skill-head">การอ่าน</th>
                <th className="center sub-skill-head">การเขียน</th>
              </tr>
            </thead>
            <tbody>
              {pagedLearners.length === 0 ? (
                <tr>
                  <td colSpan={12} className="exec-no-rows">ไม่พบรายชื่อผู้เรียนตามเงื่อนไขที่เลือก</td>
                </tr>
              ) : (
                pagedLearners.map((l, idx) => {
                  const rowNum = (currentDetailPage - 1) * DETAIL_PAGE_SIZE + idx + 1;
                  const statusClass =
                    l.assessmentStatus === 'passed'
                      ? 'pass'
                      : (l.assessmentStatus === 'failed' ? 'fail' : 'incomplete');
                  const overallWord =
                    l.assessmentStatus === 'passed'
                      ? 'ผ่าน'
                      : (l.assessmentStatus === 'failed' ? 'ไม่ผ่าน' : 'ยังไม่ครบ');

                  return (
                    <tr
                      key={l.id}
                      className="clickable-row"
                      onClick={() => setInspectedLearner(l)}
                      title="คลิกเพื่อดูคะแนนและรายละเอียดทั้ง 4 ทักษะ"
                    >
                      <td className="center">{rowNum}</td>
                      <td>{l.prefix || '-'}</td>
                      <td className="strong">{l.nameWithoutPrefix || l.name || 'ไม่ระบุชื่อ'}</td>
                      <td>{l.district}</td>
                      <td>{l.subdistrict}</td>
                      <td className="center">{l.gender || 'ไม่ระบุ'}</td>
                      <td className="center"><SkillStatusBadge skill={l.skills?.listening} /></td>
                      <td className="center"><SkillStatusBadge skill={l.skills?.speaking} /></td>
                      <td className="center"><SkillStatusBadge skill={l.skills?.reading} /></td>
                      <td className="center"><SkillStatusBadge skill={l.skills?.writing} /></td>
                      <td className="center strong">{overallWord}</td>
                      <td className="center">
                        <span className={`exec-status-pill ${statusClass}`}>
                          {overallWord}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.learners.length > DETAIL_PAGE_SIZE && (
          <div className="admin-pagination">
            <span>
              แสดง {(currentDetailPage - 1) * DETAIL_PAGE_SIZE + 1}–{Math.min(currentDetailPage * DETAIL_PAGE_SIZE, filtered.learners.length)} จาก {filtered.learners.length.toLocaleString()} รายการ
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
