import { extractDistrictAndProvince } from './addressHelper.js';
import { buildLatestSurveyMap, buildUserMap, csvCell } from './csvExport.js';

const SKILL_META = [
  { key: 'listening', name: 'การฟัง', max: 25, color: '#8b5cf6' },
  { key: 'speaking', name: 'การพูด', max: 15, color: '#3b82f6' },
  { key: 'reading', name: 'การอ่าน', max: 30, color: '#10b981' },
  { key: 'writing', name: 'การเขียน', max: 30, color: '#f59e0b' },
];

const UNKNOWN_LABEL = 'ไม่ระบุ';
const normalizeAreaLabel = (val) => (!val || val === '-' ? UNKNOWN_LABEL : String(val).trim());

export function getGradeLabel(pct) {
  if (pct >= 80) return 'ดีมาก';
  if (pct >= 60) return 'ดี';
  if (pct >= 50) return 'พอใช้';
  return 'ปรับปรุง';
}

function withinDateRange(isoStr, dateRange, now = new Date()) {
  if (dateRange === 'all') return true;
  if (!isoStr) return false;
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return false;
  if (dateRange === 'today') return d.toDateString() === now.toDateString();
  const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (dateRange === 'week') return diffDays <= 7;
  if (dateRange === 'month') return diffDays <= 30;
  return true;
}

export function enrichAnalyticsData({ users = [], history = [], surveys = [] }) {
  const usersMap = buildUserMap(users);
  const surveyMap = buildLatestSurveyMap(surveys);

  // Track latest full_test breakdown per user for learner-level 4-skill breakdown
  const latestBreakdownByUser = new Map();
  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(b.taken_at || 0).getTime() - new Date(a.taken_at || 0).getTime()
  );
  for (const h of sortedHistory) {
    const uid = String(h.user_id || h.user?.id || h.user?._id || '');
    if (!uid) continue;
    if (!latestBreakdownByUser.has(uid) && h.breakdown && Object.keys(h.breakdown).length > 0) {
      latestBreakdownByUser.set(uid, h.breakdown);
    }
  }

  const enrichedLearners = (users || [])
    .filter(u => u.role !== 'admin')
    .map(u => {
      const uid = String(u.id || u._id || '');
      const survey = uid ? surveyMap.get(uid) : null;
      const loc = extractDistrictAndProvince(u.address, u.district, u.province, survey, u.subdistrict);
      const breakdown = latestBreakdownByUser.get(uid) || {};
      return {
        ...u,
        id: uid,
        subdistrict: normalizeAreaLabel(loc.subdistrict),
        district: normalizeAreaLabel(loc.district),
        province: normalizeAreaLabel(loc.province),
        breakdown,
      };
    });

  const enrichedAttempts = sortedHistory.map(h => {
    const uid = String(h.user_id || h.user?.id || h.user?._id || '');
    const latestUser = uid ? usersMap.get(uid) : null;
    const effectiveUser = latestUser ? { ...h.user, ...latestUser } : (h.user || {});
    const userSurvey = uid ? surveyMap.get(uid) : null;

    const loc = extractDistrictAndProvince(
      effectiveUser?.address || '',
      latestUser?.district || userSurvey?.district || h.user?.district || '',
      latestUser?.province || userSurvey?.province || h.user?.province || '',
      userSurvey,
      latestUser?.subdistrict || userSurvey?.subdistrict || h.user?.subdistrict || ''
    );

    const maxScore = h.max_score || 100;
    const pct = Math.round(((h.score || 0) / maxScore) * 100);
    const isReviewed = !(h.pending_count > 0);
    const passed = isReviewed && pct >= 70;

    return {
      ...h,
      user: {
        ...effectiveUser,
        name: effectiveUser?.name || 'ผู้ใช้งานทั่วไป',
        username: effectiveUser?.username || '-',
      },
      is_literacy_learner: Boolean(effectiveUser?.is_literacy_learner),
      subdistrict: normalizeAreaLabel(loc.subdistrict),
      district: normalizeAreaLabel(loc.district),
      province: normalizeAreaLabel(loc.province),
      pct,
      isReviewed,
      passed,
      grade: getGradeLabel(pct),
    };
  });

  return { learners: enrichedLearners, attempts: enrichedAttempts };
}

export function getAreaFilterOptions(learners = [], attempts = [], selectedDistrict = 'all') {
  const districtSet = new Set();
  const subdistrictSet = new Set();

  for (const item of [...learners, ...attempts]) {
    if (item.district && item.district !== UNKNOWN_LABEL) districtSet.add(item.district);
    if (
      item.subdistrict &&
      item.subdistrict !== UNKNOWN_LABEL &&
      (selectedDistrict === 'all' || item.district === selectedDistrict)
    ) {
      subdistrictSet.add(item.subdistrict);
    }
  }

  return {
    districts: Array.from(districtSet).sort((a, b) => a.localeCompare(b, 'th')),
    subdistricts: Array.from(subdistrictSet).sort((a, b) => a.localeCompare(b, 'th')),
  };
}

export function filterAnalyticsData(
  { learners = [], attempts = [] },
  { district = 'all', subdistrict = 'all', enrollment = 'all', dateRange = 'all', now = new Date() } = {}
) {
  const matchesAreaAndEnrollment = (item) => {
    if (district !== 'all' && item.district !== district) return false;
    if (subdistrict !== 'all' && item.subdistrict !== subdistrict) return false;
    if (enrollment === 'literacy' && !item.is_literacy_learner) return false;
    if (enrollment === 'other' && item.is_literacy_learner) return false;
    return true;
  };

  const filteredAttempts = attempts.filter(
    a => matchesAreaAndEnrollment(a) && withinDateRange(a.taken_at, dateRange, now)
  );

  const activeUserIds = dateRange === 'all'
    ? null
    : new Set(filteredAttempts.map(a => String(a.user_id || a.user?.id || '')));

  const filteredLearners = learners.filter(l => {
    if (!matchesAreaAndEnrollment(l)) return false;
    if (activeUserIds && !activeUserIds.has(String(l.id)) && !withinDateRange(l.created_at, dateRange, now)) {
      return false;
    }
    return true;
  });

  return { learners: filteredLearners, attempts: filteredAttempts };
}

export function aggregateByArea(learners = [], attempts = [], mode = 'district') {
  const buckets = new Map();

  const ensureBucket = (item) => {
    const district = item.district || UNKNOWN_LABEL;
    const province = item.province || UNKNOWN_LABEL;
    const subdistrict = item.subdistrict || UNKNOWN_LABEL;
    const key = mode === 'subdistrict' ? `${subdistrict}__${district}__${province}` : `${district}__${province}`;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        key,
        subdistrict: mode === 'subdistrict' ? subdistrict : '',
        district,
        province,
        subdistrictSet: new Set(),
        learnerCount: 0,
        literacyCount: 0,
        testedLearnerCount: 0,
        passedLearnerCount: 0,
        notPassedLearnerCount: 0,
        untestedLearnerCount: 0,
        attemptCount: 0,
        reviewedAttemptCount: 0,
        passedAttemptCount: 0,
        failedAttemptCount: 0,
        pctSum: 0,
        skills: {
          listening: { sum: 0, count: 0 },
          speaking: { sum: 0, count: 0 },
          reading: { sum: 0, count: 0 },
          writing: { sum: 0, count: 0 },
        },
      };
      buckets.set(key, bucket);
    }
    if (subdistrict !== UNKNOWN_LABEL) bucket.subdistrictSet.add(subdistrict);
    return bucket;
  };

  for (const l of learners) {
    const b = ensureBucket(l);
    b.learnerCount += 1;
    if (l.is_literacy_learner) b.literacyCount += 1;
    if (l.full_test_completed) {
      b.testedLearnerCount += 1;
      if (l.full_test_passed) b.passedLearnerCount += 1;
      else b.notPassedLearnerCount += 1;
    } else {
      b.untestedLearnerCount += 1;
    }
  }

  for (const a of attempts) {
    const b = ensureBucket(a);
    b.attemptCount += 1;
    if (a.isReviewed) {
      b.reviewedAttemptCount += 1;
      b.pctSum += a.pct;
      if (a.passed) b.passedAttemptCount += 1;
      else b.failedAttemptCount += 1;
    }
    const bd = a.breakdown || {};
    for (const { key } of SKILL_META) {
      if (bd[key] && typeof bd[key].score === 'number') {
        b.skills[key].sum += bd[key].score;
        b.skills[key].count += 1;
      }
    }
  }

  return Array.from(buckets.values())
    .map(b => {
      const avgPct = b.reviewedAttemptCount ? Math.round(b.pctSum / b.reviewedAttemptCount) : null;
      const passRate = b.reviewedAttemptCount
        ? Math.round((b.passedAttemptCount / b.reviewedAttemptCount) * 100)
        : (b.testedLearnerCount ? Math.round((b.passedLearnerCount / b.testedLearnerCount) * 100) : null);

      const avgSkill = (key) =>
        b.skills[key].count ? Number((b.skills[key].sum / b.skills[key].count).toFixed(1)) : null;

      return {
        key: b.key,
        name: mode === 'subdistrict' ? b.subdistrict : b.district,
        subdistrict: b.subdistrict,
        district: b.district,
        province: b.province,
        subdistrictCount: b.subdistrictSet.size,
        learnerCount: b.learnerCount,
        literacyCount: b.literacyCount,
        testedLearnerCount: b.testedLearnerCount,
        passedLearnerCount: b.passedLearnerCount,
        notPassedLearnerCount: b.notPassedLearnerCount,
        untestedLearnerCount: b.untestedLearnerCount,
        attemptCount: b.attemptCount,
        reviewedAttemptCount: b.reviewedAttemptCount,
        passedAttemptCount: b.passedAttemptCount,
        failedAttemptCount: b.failedAttemptCount,
        passRate,
        avgPct,
        avgListening: avgSkill('listening'),
        avgSpeaking: avgSkill('speaking'),
        avgReading: avgSkill('reading'),
        avgWriting: avgSkill('writing'),
      };
    })
    .sort((a, b) => {
      const aUnknown = a.name === UNKNOWN_LABEL ? 1 : 0;
      const bUnknown = b.name === UNKNOWN_LABEL ? 1 : 0;
      if (aUnknown !== bUnknown) return aUnknown - bUnknown;
      if (b.learnerCount !== a.learnerCount) return b.learnerCount - a.learnerCount;
      return b.attemptCount - a.attemptCount;
    });
}

export function buildAnalyticsSummary(learners = [], attempts = []) {
  const totalLearners = learners.length;
  const literacyLearners = learners.filter(l => l.is_literacy_learner).length;
  const generalLearners = totalLearners - literacyLearners;
  const testedLearners = learners.filter(l => l.full_test_completed).length;
  const passedLearners = learners.filter(l => l.full_test_passed).length;
  const notPassedLearners = learners.filter(l => l.full_test_completed && !l.full_test_passed).length;
  const untestedLearners = totalLearners - testedLearners;

  const reviewed = attempts.filter(a => a.isReviewed);
  const passedAttempts = reviewed.filter(a => a.passed).length;
  const failedAttempts = reviewed.length - passedAttempts;
  const avgPct = reviewed.length
    ? Math.round(reviewed.reduce((sum, a) => sum + a.pct, 0) / reviewed.length)
    : null;
  const passRate = reviewed.length ? Math.round((passedAttempts / reviewed.length) * 100) : null;

  const districtSet = new Set();
  const subdistrictSet = new Set();
  for (const item of [...learners, ...attempts]) {
    if (item.district && item.district !== UNKNOWN_LABEL) districtSet.add(item.district);
    if (item.subdistrict && item.subdistrict !== UNKNOWN_LABEL) subdistrictSet.add(item.subdistrict);
  }

  const skillBreakdown = SKILL_META.map(meta => {
    let sum = 0;
    let count = 0;
    for (const a of reviewed) {
      const s = a.breakdown?.[meta.key];
      if (s && typeof s.score === 'number') {
        sum += s.score;
        count += 1;
      }
    }
    const avgScore = count ? Number((sum / count).toFixed(2)) : 0;
    return {
      key: meta.key,
      name: `${meta.name} (${meta.max})`,
      shortName: meta.name,
      maxScore: meta.max,
      avgScore,
      avgPct: count ? Math.round((avgScore / meta.max) * 100) : 0,
      sampleCount: count,
      color: meta.color,
    };
  });

  const gradeBuckets = { 'ดีมาก': 0, 'ดี': 0, 'พอใช้': 0, 'ปรับปรุง': 0 };
  for (const a of reviewed) {
    gradeBuckets[a.grade] = (gradeBuckets[a.grade] || 0) + 1;
  }
  const gradeDistribution = [
    { name: 'ดีมาก (≥80%)', count: gradeBuckets['ดีมาก'], color: '#10b981' },
    { name: 'ดี (60–79%)', count: gradeBuckets['ดี'], color: '#3b82f6' },
    { name: 'พอใช้ (50–59%)', count: gradeBuckets['พอใช้'], color: '#f59e0b' },
    { name: 'ปรับปรุง (<50%)', count: gradeBuckets['ปรับปรุง'], color: '#ef4444' },
  ];

  const outcomeDistribution = [
    { name: 'ผ่านเกณฑ์ (≥70%)', count: passedLearners, color: '#10b981' },
    { name: 'ยังไม่ผ่านเกณฑ์', count: notPassedLearners, color: '#ef4444' },
    { name: 'ยังไม่ได้สอบแบบรวม', count: untestedLearners, color: '#94a3b8' },
  ];

  // Daily trend sorted ascending
  const dailyMap = new Map();
  for (const a of attempts) {
    if (!a.taken_at) continue;
    const d = new Date(a.taken_at);
    if (Number.isNaN(d.getTime())) continue;
    const isoDay = d.toISOString().slice(0, 10);
    let entry = dailyMap.get(isoDay);
    if (!entry) {
      entry = {
        date: isoDay,
        label: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        attempts: 0,
        passed: 0,
        pctSum: 0,
        reviewed: 0,
      };
      dailyMap.set(isoDay, entry);
    }
    entry.attempts += 1;
    if (a.isReviewed) {
      entry.reviewed += 1;
      entry.pctSum += a.pct;
      if (a.passed) entry.passed += 1;
    }
  }
  const dailyTrend = Array.from(dailyMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      date: d.date,
      label: d.label,
      attempts: d.attempts,
      passed: d.passed,
      avgPct: d.reviewed ? Math.round(d.pctSum / d.reviewed) : 0,
    }));

  return {
    totalLearners,
    literacyLearners,
    generalLearners,
    testedLearners,
    passedLearners,
    notPassedLearners,
    untestedLearners,
    totalAttempts: attempts.length,
    reviewedAttempts: reviewed.length,
    passedAttempts,
    failedAttempts,
    avgPct,
    passRate,
    districtCount: districtSet.size,
    subdistrictCount: subdistrictSet.size,
    skillBreakdown,
    gradeDistribution,
    outcomeDistribution,
    dailyTrend,
  };
}

export function buildAreaSummaryCsv(rows = [], mode = 'district') {
  const headers = mode === 'subdistrict'
    ? [
        'ตำบล', 'อำเภอ', 'จังหวัด',
        'ผู้เรียนทั้งหมด (คน)', 'กิจกรรมรู้หนังสือ (คน)', 'เข้าสอบแบบรวม (คน)', 'ผู้เรียนที่ผ่าน (คน)', 'ผู้เรียนยังไม่ผ่าน (คน)', 'ยังไม่สอบ (คน)',
        'จำนวนครั้งที่สอบ', 'ครั้งที่ผ่าน', 'ครั้งที่ไม่ผ่าน', 'อัตราผ่าน (%)', 'คะแนนเฉลี่ย (%)',
        'เฉลี่ยการฟัง (25)', 'เฉลี่ยการพูด (15)', 'เฉลี่ยการอ่าน (30)', 'เฉลี่ยการเขียน (30)'
      ]
    : [
        'อำเภอ', 'จังหวัด', 'จำนวนตำบล',
        'ผู้เรียนทั้งหมด (คน)', 'กิจกรรมรู้หนังสือ (คน)', 'เข้าสอบแบบรวม (คน)', 'ผู้เรียนที่ผ่าน (คน)', 'ผู้เรียนยังไม่ผ่าน (คน)', 'ยังไม่สอบ (คน)',
        'จำนวนครั้งที่สอบ', 'ครั้งที่ผ่าน', 'ครั้งที่ไม่ผ่าน', 'อัตราผ่าน (%)', 'คะแนนเฉลี่ย (%)',
        'เฉลี่ยการฟัง (25)', 'เฉลี่ยการพูด (15)', 'เฉลี่ยการอ่าน (30)', 'เฉลี่ยการเขียน (30)'
      ];

  const csvRows = (rows || []).map(r => {
    const areaCols = mode === 'subdistrict'
      ? [csvCell(r.subdistrict, '-'), csvCell(r.district, '-'), csvCell(r.province, '-')]
      : [csvCell(r.district, '-'), csvCell(r.province, '-'), r.subdistrictCount ?? 0];

    return [
      ...areaCols,
      r.learnerCount,
      r.literacyCount,
      r.testedLearnerCount,
      r.passedLearnerCount,
      r.notPassedLearnerCount,
      r.untestedLearnerCount,
      r.attemptCount,
      r.passedAttemptCount,
      r.failedAttemptCount,
      r.passRate ?? '-',
      r.avgPct ?? '-',
      r.avgListening ?? '-',
      r.avgSpeaking ?? '-',
      r.avgReading ?? '-',
      r.avgWriting ?? '-',
    ];
  });

  return '\uFEFF' + headers.join(',') + '\n' + csvRows.map(r => r.join(',')).join('\n');
}

export function buildLearnersCsv(learners = [], formatDate = (d) => String(d || '-')) {
  const headers = [
    'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'อายุ', 'เพศ', 'สถานะ', 'ข้อมูลเพิ่มเติม', 'ผู้เรียนกิจกรรมรู้หนังสือ',
    'ตำบล', 'อำเภอ', 'จังหวัด', 'จำนวนครั้งสอบรวม', 'คะแนนสูงสุด (100)', 'ผลการประเมิน',
    'การฟัง (25)', 'การพูด (15)', 'การอ่าน (30)', 'การเขียน (30)', 'วันที่สมัคร', 'วันที่สอบล่าสุด'
  ];

  const rows = (learners || []).map(l => {
    const bd = l.breakdown || {};
    const statusLabel = l.full_test_completed
      ? (l.full_test_passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน')
      : (l.full_test_pending > 0 ? 'รอตรวจ' : 'ยังไม่ได้สอบ');

    return [
      csvCell(l.name, '-'),
      csvCell(l.username, '-'),
      l.age ?? '-',
      csvCell(l.gender, '-'),
      csvCell(l.status, '-'),
      csvCell(l.education_level || l.employment_status, '-'),
      l.is_literacy_learner ? 'ใช่' : 'ไม่ใช่',
      csvCell(l.subdistrict, '-'),
      csvCell(l.district, '-'),
      csvCell(l.province, '-'),
      l.full_test_attempts || 0,
      l.full_test_completed ? (l.full_test_score ?? 0) : '-',
      statusLabel,
      bd.listening?.score ?? '-',
      bd.speaking?.score ?? '-',
      bd.reading?.score ?? '-',
      bd.writing?.score ?? '-',
      csvCell(l.created_at ? formatDate(l.created_at) : '-', '-'),
      csvCell(l.full_test_last_at ? formatDate(l.full_test_last_at) : '-', '-'),
    ];
  });

  return '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
}
