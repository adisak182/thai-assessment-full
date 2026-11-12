import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
  Users, Award, CheckCircle, MapPin, FileSpreadsheet, Filter, RotateCcw,
  Eye, ClipboardList, Search, TrendingUp, Layers
} from 'lucide-react';
import {
  enrichAnalyticsData,
  getAreaFilterOptions,
  filterAnalyticsData,
  aggregateByArea,
  buildAnalyticsSummary,
  buildAreaSummaryCsv,
  buildLearnersCsv
} from '../utils/adminAnalytics';
import { buildHistoryCsv } from '../utils/csvExport';

const SKILL_LABELS = {
  full_test: 'แบบทดสอบรวม 100 ข้อ',
  listening: 'การฟัง',
  conversation: 'การพูด',
  speaking: 'การพูด',
  reading: 'การอ่าน',
  writing: 'การเขียน',
};

const DETAIL_PAGE_SIZE = 25;

function AreaBreakdownTable({
  title,
  subtitle,
  rows,
  mode,
  selectedDistrict,
  selectedSubdistrict,
  onSelectRow,
  onExportCsv,
}) {
  const isSub = mode === 'subdistrict';
  return (
    <section className="analytics-panel">
      <div className="analytics-panel-header">
        <div>
          <h3>{title}</h3>
          <p className="admin-muted">{subtitle}</p>
        </div>
        <button type="button" className="analytics-export-btn" onClick={onExportCsv}>
          <FileSpreadsheet size={16} /> ส่งออก CSV ({rows.length})
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="admin-empty">ไม่มีข้อมูลพื้นที่ตามเงื่อนไขที่เลือก</p>
      ) : (
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                {isSub && <th>ตำบล</th>}
                <th>อำเภอ</th>
                <th>จังหวัด</th>
                {!isSub && <th className="num">ตำบล</th>}
                <th className="num">ผู้เรียน</th>
                <th className="num">รู้หนังสือ</th>
                <th className="num">เข้าสอบ</th>
                <th className="num">ผ่าน (≥70%)</th>
                <th className="num">ไม่ผ่าน</th>
                <th className="num">ครั้งที่สอบ</th>
                <th className="num">อัตราผ่าน</th>
                <th className="num">เฉลี่ยรวม</th>
                <th className="num">ฟัง (25)</th>
                <th className="num">พูด (15)</th>
                <th className="num">อ่าน (30)</th>
                <th className="num">เขียน (30)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isSelected = isSub
                  ? selectedSubdistrict === row.subdistrict && (selectedDistrict === 'all' || selectedDistrict === row.district)
                  : selectedDistrict === row.district;
                return (
                  <tr
                    key={row.key}
                    onClick={() => onSelectRow(row)}
                    className={isSelected ? 'selected-row' : 'clickable-row'}
                    title={isSub ? 'คลิกเพื่อกรองดูข้อมูลตำบลนี้' : 'คลิกเพื่อกรองดูตำบลและผู้เรียนในอำเภอนี้'}
                  >
                    {isSub && <td className="area-primary">{row.subdistrict}</td>}
                    <td className={isSub ? '' : 'area-primary'}>{row.district}</td>
                    <td>{row.province}</td>
                    {!isSub && <td className="num">{row.subdistrictCount}</td>}
                    <td className="num"><strong>{row.learnerCount}</strong></td>
                    <td className="num">{row.literacyCount}</td>
                    <td className="num">{row.testedLearnerCount}</td>
                    <td className="num text-green">{row.passedLearnerCount}</td>
                    <td className="num text-rose">{row.notPassedLearnerCount}</td>
                    <td className="num">{row.attemptCount}</td>
                    <td className="num">
                      {row.passRate === null ? '—' : (
                        <span className={`analytics-pill ${row.passRate >= 70 ? 'green' : row.passRate >= 50 ? 'amber' : 'red'}`}>
                          {row.passRate}%
                        </span>
                      )}
                    </td>
                    <td className="num">{row.avgPct === null ? '—' : `${row.avgPct}%`}</td>
                    <td className="num">{row.avgListening ?? '—'}</td>
                    <td className="num">{row.avgSpeaking ?? '—'}</td>
                    <td className="num">{row.avgReading ?? '—'}</td>
                    <td className="num">{row.avgWriting ?? '—'}</td>
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
  onInspectUser,
  onInspectAttempt,
}) {
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subdistrictFilter, setSubdistrictFilter] = useState('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const [districtChartMode, setDistrictChartMode] = useState('counts'); // 'counts' | 'scores'
  const [subdistrictChartMode, setSubdistrictChartMode] = useState('counts'); // 'counts' | 'scores'
  const [detailMode, setDetailMode] = useState('learners'); // 'learners' | 'attempts'
  const [detailSearch, setDetailSearch] = useState('');
  const [detailPage, setDetailPage] = useState(1);

  const enriched = useMemo(
    () => enrichAnalyticsData({ users, history, surveys }),
    [users, history, surveys]
  );

  const areaOptions = useMemo(
    () => getAreaFilterOptions(enriched.learners, enriched.attempts, districtFilter),
    [enriched.learners, enriched.attempts, districtFilter]
  );

  const filtered = useMemo(
    () => filterAnalyticsData(enriched, {
      district: districtFilter,
      subdistrict: subdistrictFilter,
      enrollment: enrollmentFilter,
      dateRange,
    }),
    [enriched, districtFilter, subdistrictFilter, enrollmentFilter, dateRange]
  );

  const summary = useMemo(
    () => buildAnalyticsSummary(filtered.learners, filtered.attempts),
    [filtered.learners, filtered.attempts]
  );

  const districtRows = useMemo(
    () => aggregateByArea(filtered.learners, filtered.attempts, 'district'),
    [filtered.learners, filtered.attempts]
  );

  const subdistrictRows = useMemo(
    () => aggregateByArea(filtered.learners, filtered.attempts, 'subdistrict'),
    [filtered.learners, filtered.attempts]
  );

  const districtChartData = useMemo(() => districtRows.slice(0, 15), [districtRows]);
  const subdistrictChartData = useMemo(() => subdistrictRows.slice(0, 15), [subdistrictRows]);

  const searchedLearners = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    if (!q) return filtered.learners;
    return filtered.learners.filter(l =>
      [l.name, l.username, l.subdistrict, l.district, l.province, l.status]
        .some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [filtered.learners, detailSearch]);

  const searchedAttempts = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    if (!q) return filtered.attempts;
    return filtered.attempts.filter(a =>
      [a.user?.name, a.user?.username, a.subdistrict, a.district, a.province, a.skill]
        .some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [filtered.attempts, detailSearch]);

  const activeRows = detailMode === 'learners' ? searchedLearners : searchedAttempts;
  const detailPageCount = Math.max(1, Math.ceil(activeRows.length / DETAIL_PAGE_SIZE));
  const currentDetailPage = Math.min(detailPage, detailPageCount);
  const pagedDetailRows = activeRows.slice(
    (currentDetailPage - 1) * DETAIL_PAGE_SIZE,
    currentDetailPage * DETAIL_PAGE_SIZE
  );

  const handleDistrictChange = (val) => {
    setDistrictFilter(val);
    setSubdistrictFilter('all');
    setDetailPage(1);
  };

  const resetAllFilters = () => {
    setDistrictFilter('all');
    setSubdistrictFilter('all');
    setEnrollmentFilter('all');
    setDateRange('all');
    setDetailSearch('');
    setDetailPage(1);
  };

  const dateTag = new Date().toISOString().slice(0, 10);

  return (
    <div className="analytics-dashboard animate-fade-in">
      {/* Filters & Bulk Export Toolbar */}
      <section className="analytics-toolbar">
        <div className="analytics-filters">
          <label>
            <span><Filter size={13} /> อำเภอ</span>
            <select value={districtFilter} onChange={e => handleDistrictChange(e.target.value)}>
              <option value="all">ทุกอำเภอ ({areaOptions.districts.length})</option>
              {areaOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label>
            <span><MapPin size={13} /> ตำบล</span>
            <select
              value={subdistrictFilter}
              onChange={e => { setSubdistrictFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ทุกตำบล ({areaOptions.subdistricts.length})</option>
              {areaOptions.subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label>
            <span>กลุ่มผู้เรียน</span>
            <select
              value={enrollmentFilter}
              onChange={e => { setEnrollmentFilter(e.target.value); setDetailPage(1); }}
            >
              <option value="all">ผู้เรียนทั้งหมด</option>
              <option value="literacy">ผู้เรียนกิจกรรมรู้หนังสือ</option>
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

        <div className="analytics-export-bar">
          <span className="analytics-export-label">ดึงข้อมูลทั้งหมดออก (CSV):</span>
          <div className="analytics-export-actions">
            <button
              type="button"
              className="analytics-export-btn primary"
              onClick={() => onDownloadCsv(
                buildAreaSummaryCsv(districtRows, 'district'),
                `สรุปผลแยกตามอำเภอ_${dateTag}.csv`
              )}
            >
              <FileSpreadsheet size={16} /> สรุปรายอำเภอ ({districtRows.length})
            </button>
            <button
              type="button"
              className="analytics-export-btn primary"
              onClick={() => onDownloadCsv(
                buildAreaSummaryCsv(subdistrictRows, 'subdistrict'),
                `สรุปผลแยกตามตำบล_${dateTag}.csv`
              )}
            >
              <FileSpreadsheet size={16} /> สรุปรายตำบล ({subdistrictRows.length})
            </button>
            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => onDownloadCsv(
                buildLearnersCsv(filtered.learners, formatDate),
                `ข้อมูลผู้เรียนทั้งหมด_${dateTag}.csv`
              )}
            >
              <FileSpreadsheet size={16} /> ผู้เรียนทั้งหมด ({filtered.learners.length})
            </button>
            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => onDownloadCsv(
                buildHistoryCsv({ history: filtered.attempts, users, surveys, formatDate }),
                `ผลสอบทั้งหมด_${dateTag}.csv`
              )}
            >
              <FileSpreadsheet size={16} /> ผลสอบทั้งหมด ({filtered.attempts.length})
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <p className="admin-muted" role="status">กำลังโหลดข้อมูลภาพรวม...</p>
      )}

      {/* KPI Summary Cards */}
      <div className="analytics-kpis">
        <div className="analytics-kpi purple">
          <div className="kpi-icon"><Users size={22} /></div>
          <div>
            <span>ผู้เรียนทั้งหมด</span>
            <strong>{summary.totalLearners.toLocaleString()} <small>คน</small></strong>
            <p>กิจกรรมรู้หนังสือ {summary.literacyLearners} · ทั่วไป {summary.generalLearners}</p>
          </div>
        </div>
        <div className="analytics-kpi blue">
          <div className="kpi-icon"><ClipboardList size={22} /></div>
          <div>
            <span>จำนวนครั้งที่สอบ</span>
            <strong>{summary.totalAttempts.toLocaleString()} <small>ครั้ง</small></strong>
            <p>เข้าสอบแบบรวม {summary.testedLearners} คน · ยังไม่สอบ {summary.untestedLearners} คน</p>
          </div>
        </div>
        <div className="analytics-kpi green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div>
            <span>อัตราการสอบผ่าน (≥70%)</span>
            <strong>{summary.passRate === null ? '—' : `${summary.passRate}%`}</strong>
            <p>ผ่าน {summary.passedAttempts} ครั้ง · ไม่ผ่าน {summary.failedAttempts} ครั้ง</p>
          </div>
        </div>
        <div className="analytics-kpi amber">
          <div className="kpi-icon"><Award size={22} /></div>
          <div>
            <span>คะแนนเฉลี่ยรวม</span>
            <strong>{summary.avgPct === null ? '—' : `${summary.avgPct}%`}</strong>
            <p>ผู้เรียนผ่านเกณฑ์รวม {summary.passedLearners} / {summary.testedLearners} คน</p>
          </div>
        </div>
        <div className="analytics-kpi indigo">
          <div className="kpi-icon"><MapPin size={22} /></div>
          <div>
            <span>พื้นที่ครอบคลุม</span>
            <strong>{summary.districtCount} <small>อำเภอ</small></strong>
            <p>แยกย่อย {summary.subdistrictCount} ตำบล</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Chart 1: District Breakdown Chart */}
        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><Layers size={18} /> กราฟเปรียบเทียบแยกตามอำเภอ</h3>
              <p className="admin-muted">แสดงสูงสุด 15 อำเภอที่มีข้อมูลมากที่สุด</p>
            </div>
            <div className="analytics-seg">
              <button
                type="button"
                aria-pressed={districtChartMode === 'counts'}
                onClick={() => setDistrictChartMode('counts')}
              >จำนวนผู้เรียน</button>
              <button
                type="button"
                aria-pressed={districtChartMode === 'scores'}
                onClick={() => setDistrictChartMode('scores')}
              >คะแนนเฉลี่ย / อัตราผ่าน</button>
            </div>
          </div>
          <div className="analytics-chart-box">
            {districtChartData.length === 0 ? (
              <p className="admin-empty">ยังไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                {districtChartMode === 'counts' ? (
                  <BarChart data={districtChartData} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="district" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" height={54} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="passedLearnerCount" name="ผ่านเกณฑ์" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="notPassedLearnerCount" name="ยังไม่ผ่าน" stackId="a" fill="#f43f5e" />
                    <Bar dataKey="untestedLearnerCount" name="ยังไม่สอบ" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={districtChartData} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="district" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" height={54} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => `${v ?? 0}%`} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="avgPct" name="คะแนนเฉลี่ย (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passRate" name="อัตราผ่าน (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Chart 2: Subdistrict Breakdown Chart */}
        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><MapPin size={18} /> กราฟเปรียบเทียบแยกตามตำบล</h3>
              <p className="admin-muted">
                {districtFilter === 'all' ? 'แสดงสูงสุด 15 ตำบลที่มีข้อมูลมากที่สุด' : `ตำบลในอำเภอ${districtFilter}`}
              </p>
            </div>
            <div className="analytics-seg">
              <button
                type="button"
                aria-pressed={subdistrictChartMode === 'counts'}
                onClick={() => setSubdistrictChartMode('counts')}
              >จำนวนผู้เรียน</button>
              <button
                type="button"
                aria-pressed={subdistrictChartMode === 'scores'}
                onClick={() => setSubdistrictChartMode('scores')}
              >คะแนนเฉลี่ย / อัตราผ่าน</button>
            </div>
          </div>
          <div className="analytics-chart-box">
            {subdistrictChartData.length === 0 ? (
              <p className="admin-empty">ยังไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                {subdistrictChartMode === 'counts' ? (
                  <BarChart data={subdistrictChartData} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="subdistrict" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={-18} textAnchor="end" height={58} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="passedLearnerCount" name="ผ่านเกณฑ์" stackId="s" fill="#10b981" />
                    <Bar dataKey="notPassedLearnerCount" name="ยังไม่ผ่าน" stackId="s" fill="#f43f5e" />
                    <Bar dataKey="untestedLearnerCount" name="ยังไม่สอบ" stackId="s" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={subdistrictChartData} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="subdistrict" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={-18} textAnchor="end" height={58} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => `${v ?? 0}%`} />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="avgPct" name="คะแนนเฉลี่ย (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passRate" name="อัตราผ่าน (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Chart 3: Skill Averages */}
        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><Award size={18} /> คะแนนเฉลี่ยแยกตาม 4 ทักษะ</h3>
              <p className="admin-muted">เปรียบเทียบร้อยละคะแนนเฉลี่ยในแต่ละทักษะ</p>
            </div>
          </div>
          <div className="analytics-chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={summary.skillBreakdown} layout="vertical" margin={{ top: 8, right: 24, left: 20, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  formatter={(value, _name, item) => [`${value}% (เฉลี่ย ${item.payload.avgScore}/${item.payload.maxScore} คะแนน)`, 'คะแนนเฉลี่ย']}
                />
                <Bar dataKey="avgPct" radius={[0, 6, 6, 0]} barSize={28}>
                  {summary.skillBreakdown.map(entry => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 4: Outcome & Grade Distributions */}
        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3><CheckCircle size={18} /> สัดส่วนผลการประเมินและระดับคุณภาพ</h3>
              <p className="admin-muted">สถานะผู้เรียนทั้งหมดและระดับคะแนนการสอบ</p>
            </div>
          </div>
          <div className="analytics-pies-wrap">
            <div className="analytics-pie-item">
              <h4>สถานะผู้เรียน ({summary.totalLearners} คน)</h4>
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
            <div className="analytics-pie-item">
              <h4>ระดับคะแนน ({summary.reviewedAttempts} ครั้ง)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={summary.gradeDistribution.filter(d => d.count > 0)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {summary.gradeDistribution.filter(d => d.count > 0).map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v) => `${v} ครั้ง`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Chart 5: Daily Trend */}
      {summary.dailyTrend.length > 0 && (
        <section className="analytics-card" style={{ marginBottom: '24px' }}>
          <div className="analytics-card-header">
            <div>
              <h3><TrendingUp size={18} /> แนวโน้มจำนวนการสอบและคะแนนเฉลี่ยรายวัน</h3>
              <p className="admin-muted">จำนวนครั้งที่ส่งคำตอบเทียบกับคะแนนเฉลี่ยในแต่ละวัน</p>
            </div>
          </div>
          <div className="analytics-chart-box">
            <ResponsiveContainer width="100%" height={260}>
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
      <AreaBreakdownTable
        title="ข้อมูลสรุปแยกตามอำเภอ (คลิกแถวเพื่อกรองดูตำบล)"
        subtitle={`แสดงทั้งหมด ${districtRows.length} อำเภอ`}
        rows={districtRows}
        mode="district"
        selectedDistrict={districtFilter}
        selectedSubdistrict={subdistrictFilter}
        onSelectRow={(row) => {
          const next = districtFilter === row.district ? 'all' : row.district;
          handleDistrictChange(next);
        }}
        onExportCsv={() => onDownloadCsv(
          buildAreaSummaryCsv(districtRows, 'district'),
          `สรุปผลแยกตามอำเภอ_${dateTag}.csv`
        )}
      />

      <AreaBreakdownTable
        title="ข้อมูลสรุปแยกตามตำบล (คลิกแถวเพื่อกรองดูรายชื่อด้านล่าง)"
        subtitle={`แสดงทั้งหมด ${subdistrictRows.length} ตำบล`}
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
        onExportCsv={() => onDownloadCsv(
          buildAreaSummaryCsv(subdistrictRows, 'subdistrict'),
          `สรุปผลแยกตามตำบล_${dateTag}.csv`
        )}
      />

      {/* Granular Detailed Breakdown Table */}
      <section className="analytics-panel">
        <div className="analytics-panel-header">
          <div>
            <h3>ข้อมูลแยกย่อยทั้งหมด ({activeRows.length} รายการ)</h3>
            <p className="admin-muted">ดูรายละเอียดรายบุคคลหรือรายครั้งที่สอบตามพื้นที่ที่เลือก</p>
          </div>
          <div className="analytics-detail-controls">
            <div className="analytics-seg">
              <button
                type="button"
                aria-pressed={detailMode === 'learners'}
                onClick={() => { setDetailMode('learners'); setDetailPage(1); }}
              >รายผู้เรียน ({searchedLearners.length})</button>
              <button
                type="button"
                aria-pressed={detailMode === 'attempts'}
                onClick={() => { setDetailMode('attempts'); setDetailPage(1); }}
              >รายครั้งการสอบ ({searchedAttempts.length})</button>
            </div>
            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => {
                if (detailMode === 'learners') {
                  onDownloadCsv(buildLearnersCsv(searchedLearners, formatDate), `ข้อมูลผู้เรียนแยกย่อย_${dateTag}.csv`);
                } else {
                  onDownloadCsv(
                    buildHistoryCsv({ history: searchedAttempts, users, surveys, formatDate }),
                    `ประวัติผลสอบแยกย่อย_${dateTag}.csv`
                  );
                }
              }}
            >
              <FileSpreadsheet size={16} /> ส่งออก CSV รายการนี้ ({activeRows.length})
            </button>
          </div>
        </div>

        <div className="analytics-detail-search">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, Username, ตำบล, อำเภอ..."
            value={detailSearch}
            onChange={e => { setDetailSearch(e.target.value); setDetailPage(1); }}
          />
        </div>

        {pagedDetailRows.length === 0 ? (
          <p className="admin-empty">ไม่พบข้อมูลแยกย่อยที่ตรงกับตัวกรอง</p>
        ) : (
          <div className="analytics-table-wrap">
            {detailMode === 'learners' ? (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ตำบล</th>
                    <th>อำเภอ</th>
                    <th>จังหวัด</th>
                    <th>กลุ่มผู้เรียน</th>
                    <th className="num">สอบ (ครั้ง)</th>
                    <th className="num">คะแนนสูงสุด</th>
                    <th>ผลประเมิน</th>
                    <th className="num">ฟัง</th>
                    <th className="num">พูด</th>
                    <th className="num">อ่าน</th>
                    <th className="num">เขียน</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDetailRows.map(l => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.name || 'ไม่ระบุชื่อ'}</strong>
                        <div className="sub-meta">@{l.username}{l.age ? ` · ${l.age} ปี` : ''}</div>
                      </td>
                      <td>{l.subdistrict}</td>
                      <td>{l.district}</td>
                      <td>{l.province}</td>
                      <td>
                        <span className={`analytics-pill ${l.is_literacy_learner ? 'blue' : 'gray'}`}>
                          {l.is_literacy_learner ? 'รู้หนังสือ' : 'ทั่วไป'}
                        </span>
                      </td>
                      <td className="num">{l.full_test_attempts || 0}</td>
                      <td className="num"><strong>{l.full_test_completed ? `${l.full_test_score}/100` : '—'}</strong></td>
                      <td>
                        <span className={`analytics-pill ${l.full_test_completed ? (l.full_test_passed ? 'green' : 'red') : 'gray'}`}>
                          {l.full_test_completed ? (l.full_test_passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน') : 'ยังไม่สอบ'}
                        </span>
                      </td>
                      <td className="num">{l.breakdown?.listening?.score ?? '—'}</td>
                      <td className="num">{l.breakdown?.speaking?.score ?? '—'}</td>
                      <td className="num">{l.breakdown?.reading?.score ?? '—'}</td>
                      <td className="num">{l.breakdown?.writing?.score ?? '—'}</td>
                      <td>
                        <button type="button" className="analytics-mini-btn" onClick={() => onInspectUser(l)}>
                          <Eye size={14} /> ดูรายละเอียด
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
                    <th>ตำบล</th>
                    <th>อำเภอ</th>
                    <th>จังหวัด</th>
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
                      <td>{a.subdistrict}</td>
                      <td>{a.district}</td>
                      <td>{a.province}</td>
                      <td>{SKILL_LABELS[a.skill] || a.skill}</td>
                      <td className="num"><strong>{a.score}/{a.max_score}</strong></td>
                      <td className="num">{a.pct}%</td>
                      <td>
                        <span className={`analytics-pill ${a.passed ? 'green' : 'red'}`}>
                          {a.passed ? 'ผ่าน' : 'ไม่ผ่าน'} ({a.grade})
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
    </div>
  );
}
