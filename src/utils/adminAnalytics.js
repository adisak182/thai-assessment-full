import { extractDistrictAndProvince, NARATHIWAT_DISTRICT_NAMES } from './addressHelper.js';
import { buildLatestSurveyMap, buildUserMap, csvCell } from './csvExport.js';
import { splitNamePrefix } from './namePrefix.js';

export const SKILL_META = [
  { key: 'listening', name: 'การฟัง', formalName: '๑. ทักษะการฟัง', max: 25, color: '#8b5cf6' },
  { key: 'speaking', name: 'การพูด', formalName: '๒. ทักษะการพูด', max: 15, color: '#3b82f6' },
  { key: 'reading', name: 'การอ่าน', formalName: '๓. ทักษะการอ่าน', max: 30, color: '#10b981' },
  { key: 'writing', name: 'การเขียน', formalName: '๔. ทักษะการเขียน', max: 30, color: '#f59e0b' },
];

export { NARATHIWAT_DISTRICT_NAMES };

const UNKNOWN_LABEL = 'ไม่ระบุ';
const normalizeAreaLabel = (val) => (!val || val === '-' ? UNKNOWN_LABEL : String(val).trim());

export function getGradeLabel(pct) {
  if (pct >= 80) return 'ดีมาก';
  if (pct >= 60) return 'ดี';
  if (pct >= 50) return 'พอใช้';
  return 'ปรับปรุง';
}

export function resolveGender(user = {}, survey = null, detectedPrefix = '') {
  const raw = String(user?.gender || survey?.gender || '').trim().toLowerCase();
  if (raw === 'ชาย' || raw === 'male' || raw === 'm') return 'ชาย';
  if (raw === 'หญิง' || raw === 'female' || raw === 'f') return 'หญิง';

  if (detectedPrefix === 'นาย' || detectedPrefix === 'ด.ช.') return 'ชาย';
  if (detectedPrefix === 'นาง' || detectedPrefix === 'นางสาว' || detectedPrefix === 'ด.ญ.') return 'หญิง';
  return UNKNOWN_LABEL;
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

function extractSkillResultForLearner(learnerAttempts = [], meta) {
  let best = null;
  let hasPending = false;

  for (const a of learnerAttempts) {
    const attemptPending = Boolean(a.pending_count > 0);
    const bdEntry = a.breakdown?.[meta.key];
    const isStandaloneMatch = a.skill === meta.key || (meta.key === 'speaking' && a.skill === 'conversation');

    if (bdEntry && typeof bdEntry.score === 'number') {
      const entryPending = attemptPending || Boolean(bdEntry.pending > 0);
      if (entryPending) {
        hasPending = true;
        continue;
      }
      const max = bdEntry.max > 0 ? bdEntry.max : meta.max;
      const score = bdEntry.score;
      const ratio = max > 0 ? score / max : 0;
      const ts = new Date(a.taken_at || 0).getTime();
      if (!best || ratio > best.ratio || (ratio === best.ratio && ts > best.ts)) {
        best = { score, max, ratio, ts, taken_at: a.taken_at || null };
      }
    } else if (isStandaloneMatch && typeof a.score === 'number') {
      if (attemptPending) {
        hasPending = true;
        continue;
      }
      const max = a.max_score > 0 ? a.max_score : meta.max;
      const score = a.score;
      const ratio = max > 0 ? score / max : 0;
      const ts = new Date(a.taken_at || 0).getTime();
      if (!best || ratio > best.ratio || (ratio === best.ratio && ts > best.ts)) {
        best = { score, max, ratio, ts, taken_at: a.taken_at || null };
      }
    }
  }

  if (best) {
    const exactPct = Number((best.ratio * 100).toFixed(1));
    const pct = Math.round(best.ratio * 100);
    const passed = best.ratio >= 0.7;
    return {
      assessed: true,
      passed,
      status: passed ? 'passed' : 'failed',
      statusLabel: passed ? 'ผ่าน' : 'ไม่ผ่าน',
      score: best.score,
      max: best.max,
      pct,
      exactPct,
      pending: false,
      taken_at: best.taken_at,
    };
  }

  return {
    assessed: false,
    passed: false,
    status: 'unassessed',
    statusLabel: hasPending ? 'รอตรวจ' : 'ยังไม่ประเมิน',
    score: null,
    max: meta.max,
    pct: null,
    exactPct: null,
    pending: hasPending,
    taken_at: null,
  };
}

function roundPct(part, whole) {
  if (!whole) return 0;
  return Number(((part / whole) * 100).toFixed(1));
}

export function enrichAnalyticsData({ users = [], history = [], surveys = [] }) {
  const usersMap = buildUserMap(users);
  const surveyMap = buildLatestSurveyMap(surveys);

  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(b.taken_at || 0).getTime() - new Date(a.taken_at || 0).getTime()
  );

  // Group all attempts by user_id and track latest breakdown
  const attemptsByUser = new Map();
  const latestBreakdownByUser = new Map();
  for (const h of sortedHistory) {
    const uid = String(h.user_id || h.user?.id || h.user?._id || '');
    if (!uid) continue;
    if (!attemptsByUser.has(uid)) attemptsByUser.set(uid, []);
    attemptsByUser.get(uid).push(h);
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
      const { prefix, nameWithoutPrefix } = splitNamePrefix(u.name || '');
      const gender = resolveGender(u, survey, prefix);

      const learnerAttempts = uid ? (attemptsByUser.get(uid) || []) : [];
      const breakdown = latestBreakdownByUser.get(uid) || {};

      const skills = {};
      let assessedSkillCount = 0;
      let passedSkillCount = 0;
      let totalSkillScore = 0;
      let totalSkillMax = 0;

      for (const meta of SKILL_META) {
        const res = extractSkillResultForLearner(learnerAttempts, meta);
        skills[meta.key] = res;
        if (res.assessed) {
          assessedSkillCount += 1;
          totalSkillScore += res.score;
          totalSkillMax += res.max;
          if (res.passed) passedSkillCount += 1;
        }
      }

      const completedAll4Skills = assessedSkillCount === SKILL_META.length;
      const hasAssessed = assessedSkillCount > 0 || Boolean(u.full_test_completed) || learnerAttempts.length > 0;

      let assessmentStatus = 'incomplete';
      let assessmentStatusLabel = assessedSkillCount === 0 ? 'ยังไม่ได้ประเมิน' : 'ยังไม่ครบ 4 ทักษะ';
      let overallPassed = false;
      let overallScore = totalSkillMax > 0 ? totalSkillScore : null;
      let overallMax = totalSkillMax > 0 ? totalSkillMax : 100;
      let overallPct = totalSkillMax > 0 ? Math.round((totalSkillScore / totalSkillMax) * 100) : null;

      if (u.full_test_completed) {
        overallScore = u.full_test_score ?? totalSkillScore ?? 0;
        overallMax = 100;
        overallPct = Math.round((overallScore / 100) * 100);
      }

      if (completedAll4Skills) {
        overallPassed = u.full_test_completed
          ? Boolean(u.full_test_passed)
          : (totalSkillMax > 0 && (totalSkillScore / totalSkillMax) >= 0.7);
        assessmentStatus = overallPassed ? 'passed' : 'failed';
        assessmentStatusLabel = overallPassed ? 'ผ่าน' : 'ไม่ผ่าน';
      } else if (u.full_test_completed) {
        // Legacy fixture fallback where full_test_completed is true without per-skill breakdown
        overallPassed = Boolean(u.full_test_passed);
      }

      return {
        ...u,
        id: uid,
        prefix,
        nameWithoutPrefix,
        gender,
        subdistrict: normalizeAreaLabel(loc.subdistrict),
        district: normalizeAreaLabel(loc.district),
        province: normalizeAreaLabel(loc.province),
        breakdown,
        skills,
        assessedSkillCount,
        passedSkillCount,
        completedAll4Skills,
        hasAssessed,
        anyAttemptCount: learnerAttempts.length,
        assessmentStatus,
        assessmentStatusLabel,
        overallPassed,
        overallScore,
        overallMax,
        overallPct,
      };
    });

  const learnerMap = new Map(enrichedLearners.map(l => [l.id, l]));

  const enrichedAttempts = sortedHistory.map(h => {
    const uid = String(h.user_id || h.user?.id || h.user?._id || '');
    const latestUser = uid ? (learnerMap.get(uid) || usersMap.get(uid)) : null;
    const effectiveUser = latestUser ? { ...h.user, ...latestUser } : (h.user || {});
    const userSurvey = uid ? surveyMap.get(uid) : null;

    const loc = extractDistrictAndProvince(
      effectiveUser?.address || '',
      latestUser?.district !== UNKNOWN_LABEL ? (latestUser?.district || userSurvey?.district || h.user?.district || '') : (userSurvey?.district || h.user?.district || ''),
      latestUser?.province !== UNKNOWN_LABEL ? (latestUser?.province || userSurvey?.province || h.user?.province || '') : (userSurvey?.province || h.user?.province || ''),
      userSurvey,
      latestUser?.subdistrict !== UNKNOWN_LABEL ? (latestUser?.subdistrict || userSurvey?.subdistrict || h.user?.subdistrict || '') : (userSurvey?.subdistrict || h.user?.subdistrict || '')
    );

    const { prefix, nameWithoutPrefix } = splitNamePrefix(effectiveUser?.name || '');
    const gender = latestUser?.gender || resolveGender(effectiveUser, userSurvey, prefix);

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
        prefix,
        nameWithoutPrefix,
        gender,
      },
      prefix,
      gender,
      is_literacy_learner: Boolean(effectiveUser?.is_literacy_learner),
      assessmentStatus: latestUser?.assessmentStatus || 'incomplete',
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

export function getAreaFilterOptions(
  learners = [],
  attempts = [],
  selectedDistrict = 'all',
  { includeAllNarathiwatDistricts = false } = {}
) {
  const districtSet = new Set(includeAllNarathiwatDistricts ? NARATHIWAT_DISTRICT_NAMES : []);
  const subdistrictSet = new Set();
  const provinceSet = new Set();

  for (const item of [...learners, ...attempts]) {
    if (item.province && item.province !== UNKNOWN_LABEL) provinceSet.add(item.province);
    if (item.district && item.district !== UNKNOWN_LABEL) districtSet.add(item.district);
    if (
      item.subdistrict &&
      item.subdistrict !== UNKNOWN_LABEL &&
      (selectedDistrict === 'all' || item.district === selectedDistrict)
    ) {
      subdistrictSet.add(item.subdistrict);
    }
  }

  let districts;
  if (includeAllNarathiwatDistricts) {
    const extra = Array.from(districtSet)
      .filter(d => !NARATHIWAT_DISTRICT_NAMES.includes(d))
      .sort((a, b) => a.localeCompare(b, 'th'));
    districts = [...NARATHIWAT_DISTRICT_NAMES, ...extra];
  } else {
    districts = Array.from(districtSet).sort((a, b) => a.localeCompare(b, 'th'));
  }

  return {
    provinces: Array.from(provinceSet).sort((a, b) => a.localeCompare(b, 'th')),
    districts,
    subdistricts: Array.from(subdistrictSet).sort((a, b) => a.localeCompare(b, 'th')),
  };
}

export function filterAnalyticsData(
  { learners = [], attempts = [] },
  {
    province = 'all',
    district = 'all',
    subdistrict = 'all',
    enrollment = 'all',
    gender = 'all',
    assessmentStatus = 'all',
    prefix = 'all',
    search = '',
    dateRange = 'all',
    now = new Date(),
  } = {}
) {
  const q = String(search || '').trim().toLowerCase();

  const matchesLearnerFields = (item, userObj = item) => {
    if (province !== 'all' && item.province !== province) return false;
    if (district !== 'all' && item.district !== district) return false;
    if (subdistrict !== 'all' && item.subdistrict !== subdistrict) return false;
    if (enrollment === 'literacy' && !item.is_literacy_learner) return false;
    if (enrollment === 'other' && item.is_literacy_learner) return false;
    if (gender !== 'all' && item.gender !== gender) return false;
    if (prefix === 'none' && item.prefix) return false;
    if (prefix !== 'all' && prefix !== 'none' && item.prefix !== prefix) return false;
    if (assessmentStatus !== 'all' && item.assessmentStatus !== assessmentStatus) return false;
    if (q) {
      const haystacks = [
        userObj?.name,
        userObj?.prefix,
        userObj?.nameWithoutPrefix,
        userObj?.username,
        item.subdistrict,
        item.district,
        item.province,
        userObj?.status,
      ];
      if (!haystacks.some(v => String(v || '').toLowerCase().includes(q))) return false;
    }
    return true;
  };

  const filteredAttempts = attempts.filter(
    a => matchesLearnerFields(a, a.user) && withinDateRange(a.taken_at, dateRange, now)
  );

  const activeUserIds = dateRange === 'all'
    ? null
    : new Set(filteredAttempts.map(a => String(a.user_id || a.user?.id || '')));

  const filteredLearners = learners.filter(l => {
    if (!matchesLearnerFields(l, l)) return false;
    if (activeUserIds && !activeUserIds.has(String(l.id)) && !withinDateRange(l.created_at, dateRange, now)) {
      return false;
    }
    return true;
  });

  return { learners: filteredLearners, attempts: filteredAttempts };
}

export function buildSkillEvaluationSummary(learners = [], attempts = []) {
  const reviewedAttempts = attempts.filter(a => a.isReviewed);

  return SKILL_META.map(meta => {
    let assessedCount = 0;
    let assessedMale = 0;
    let assessedFemale = 0;
    let assessedOther = 0;

    let passedCount = 0;
    let passedMale = 0;
    let passedFemale = 0;
    let passedOther = 0;

    let failedCount = 0;
    let failedMale = 0;
    let failedFemale = 0;
    let failedOther = 0;

    let unassessedCount = 0;
    let unassessedMale = 0;
    let unassessedFemale = 0;
    let unassessedOther = 0;
    let pendingCount = 0;

    let scoreSum = 0;
    let maxSum = 0;

    for (const l of learners) {
      const sk = l.skills?.[meta.key];
      const g = l.gender || UNKNOWN_LABEL;

      if (sk && sk.assessed) {
        assessedCount += 1;
        scoreSum += sk.score;
        maxSum += sk.max;
        if (g === 'ชาย') assessedMale += 1;
        else if (g === 'หญิง') assessedFemale += 1;
        else assessedOther += 1;

        if (sk.passed) {
          passedCount += 1;
          if (g === 'ชาย') passedMale += 1;
          else if (g === 'หญิง') passedFemale += 1;
          else passedOther += 1;
        } else {
          failedCount += 1;
          if (g === 'ชาย') failedMale += 1;
          else if (g === 'หญิง') failedFemale += 1;
          else failedOther += 1;
        }
      } else {
        unassessedCount += 1;
        if (sk?.pending) pendingCount += 1;
        if (g === 'ชาย') unassessedMale += 1;
        else if (g === 'หญิง') unassessedFemale += 1;
        else unassessedOther += 1;
      }
    }

    // Fallback average score from attempts if learner skills map empty in standalone attempt calls
    let avgScore = assessedCount ? Number((scoreSum / assessedCount).toFixed(2)) : 0;
    let avgPct = maxSum ? Math.round((scoreSum / maxSum) * 100) : 0;

    if (!assessedCount && reviewedAttempts.length) {
      let aSum = 0;
      let aCount = 0;
      for (const a of reviewedAttempts) {
        const s = a.breakdown?.[meta.key];
        if (s && typeof s.score === 'number') {
          aSum += s.score;
          aCount += 1;
        }
      }
      if (aCount) {
        avgScore = Number((aSum / aCount).toFixed(2));
        avgPct = Math.round((avgScore / meta.max) * 100);
      }
    }

    const passRatePct = assessedCount > 0 ? roundPct(passedCount, assessedCount) : 0;
    const failRatePct = assessedCount > 0 ? Number((100 - passRatePct).toFixed(1)) : 0;

    return {
      key: meta.key,
      name: `${meta.name} (${meta.max})`,
      shortName: meta.name,
      formalName: meta.formalName,
      maxScore: meta.max,
      color: meta.color,
      assessedCount,
      assessedMale,
      assessedFemale,
      assessedOther,
      passedCount,
      passedMale,
      passedFemale,
      passedOther,
      failedCount,
      failedMale,
      failedFemale,
      failedOther,
      unassessedCount,
      unassessedMale,
      unassessedFemale,
      unassessedOther,
      pendingCount,
      passRatePct,
      failRatePct,
      avgScore,
      avgPct,
      sampleCount: assessedCount,
    };
  });
}

export function aggregateByArea(
  learners = [],
  attempts = [],
  mode = 'district',
  { includeAllNarathiwatDistricts = false } = {}
) {
  const buckets = new Map();

  const createEmptyBucket = ({ key, subdistrict, district, province }) => ({
    key,
    subdistrict,
    district,
    province,
    subdistrictSet: new Set(),
    learnerCount: 0,
    literacyCount: 0,
    maleCount: 0,
    femaleCount: 0,
    otherGenderCount: 0,
    assessedLearnerCount: 0,
    assessedMaleCount: 0,
    assessedFemaleCount: 0,
    assessedOtherCount: 0,
    completed4Count: 0,
    incomplete4Count: 0,
    testedLearnerCount: 0,
    passedLearnerCount: 0,
    failedLearnerCount: 0,
    notPassedLearnerCount: 0,
    untestedLearnerCount: 0,
    passedMaleCount: 0,
    passedFemaleCount: 0,
    failedMaleCount: 0,
    failedFemaleCount: 0,
    attemptCount: 0,
    reviewedAttemptCount: 0,
    passedAttemptCount: 0,
    failedAttemptCount: 0,
    pctSum: 0,
    learnerSkills: {
      listening: { assessed: 0, passed: 0, failed: 0, unassessed: 0, sum: 0, maxSum: 0 },
      speaking: { assessed: 0, passed: 0, failed: 0, unassessed: 0, sum: 0, maxSum: 0 },
      reading: { assessed: 0, passed: 0, failed: 0, unassessed: 0, sum: 0, maxSum: 0 },
      writing: { assessed: 0, passed: 0, failed: 0, unassessed: 0, sum: 0, maxSum: 0 },
    },
    skills: {
      listening: { sum: 0, count: 0 },
      speaking: { sum: 0, count: 0 },
      reading: { sum: 0, count: 0 },
      writing: { sum: 0, count: 0 },
    },
  });

  if (mode === 'district' && includeAllNarathiwatDistricts) {
    for (const dName of NARATHIWAT_DISTRICT_NAMES) {
      const key = `${dName}__นราธิวาส`;
      buckets.set(key, createEmptyBucket({ key, subdistrict: '', district: dName, province: 'นราธิวาส' }));
    }
  }

  const ensureBucket = (item) => {
    const district = item.district || UNKNOWN_LABEL;
    const province = item.province || UNKNOWN_LABEL;
    const subdistrict = item.subdistrict || UNKNOWN_LABEL;
    const key = mode === 'subdistrict' ? `${subdistrict}__${district}__${province}` : `${district}__${province}`;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = createEmptyBucket({
        key,
        subdistrict: mode === 'subdistrict' ? subdistrict : '',
        district,
        province,
      });
      buckets.set(key, bucket);
    }
    if (subdistrict !== UNKNOWN_LABEL) bucket.subdistrictSet.add(subdistrict);
    return bucket;
  };

  for (const l of learners) {
    const b = ensureBucket(l);
    b.learnerCount += 1;
    if (l.is_literacy_learner) b.literacyCount += 1;

    const g = l.gender || UNKNOWN_LABEL;
    if (g === 'ชาย') b.maleCount += 1;
    else if (g === 'หญิง') b.femaleCount += 1;
    else b.otherGenderCount += 1;

    if (l.hasAssessed) {
      b.assessedLearnerCount += 1;
      if (g === 'ชาย') b.assessedMaleCount += 1;
      else if (g === 'หญิง') b.assessedFemaleCount += 1;
      else b.assessedOtherCount += 1;
    }

    if (l.completedAll4Skills) {
      b.completed4Count += 1;
      if (l.assessmentStatus === 'passed') {
        b.passedLearnerCount += 1;
        if (g === 'ชาย') b.passedMaleCount += 1;
        else if (g === 'หญิง') b.passedFemaleCount += 1;
      } else {
        b.failedLearnerCount += 1;
        if (g === 'ชาย') b.failedMaleCount += 1;
        else if (g === 'หญิง') b.failedFemaleCount += 1;
      }
    } else {
      b.incomplete4Count += 1;
    }

    // Legacy / full_test compatibility counts
    if (l.full_test_completed) {
      b.testedLearnerCount += 1;
      if (!l.completedAll4Skills) {
        if (l.full_test_passed) b.passedLearnerCount += 1;
        else b.notPassedLearnerCount += 1;
      } else if (!l.overallPassed) {
        b.notPassedLearnerCount += 1;
      }
    } else {
      b.untestedLearnerCount += 1;
      if (l.completedAll4Skills && l.assessmentStatus === 'failed') {
        b.notPassedLearnerCount += 1;
      }
    }

    for (const { key } of SKILL_META) {
      const sk = l.skills?.[key];
      const target = b.learnerSkills[key];
      if (sk && sk.assessed) {
        target.assessed += 1;
        target.sum += sk.score;
        target.maxSum += sk.max;
        if (sk.passed) target.passed += 1;
        else target.failed += 1;
      } else {
        target.unassessed += 1;
      }
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
      const denomLearners = b.completed4Count || b.testedLearnerCount;
      const passRate = denomLearners
        ? Math.round((b.passedLearnerCount / denomLearners) * 100)
        : (b.reviewedAttemptCount ? Math.round((b.passedAttemptCount / b.reviewedAttemptCount) * 100) : null);
      const exactPassRate = denomLearners
        ? roundPct(b.passedLearnerCount, denomLearners)
        : (b.reviewedAttemptCount ? roundPct(b.passedAttemptCount, b.reviewedAttemptCount) : null);
      const exactFailRate = exactPassRate !== null ? Number((100 - exactPassRate).toFixed(1)) : null;

      const avgSkill = (key) =>
        b.skills[key].count ? Number((b.skills[key].sum / b.skills[key].count).toFixed(1)) : null;

      const skillStats = {};
      for (const meta of SKILL_META) {
        const s = b.learnerSkills[meta.key];
        const sPassRate = s.assessed ? roundPct(s.passed, s.assessed) : null;
        skillStats[meta.key] = {
          assessed: s.assessed,
          passed: s.passed,
          failed: s.failed,
          unassessed: s.unassessed,
          passRate: sPassRate,
          failRate: sPassRate !== null ? Number((100 - sPassRate).toFixed(1)) : null,
          avgScore: s.assessed ? Number((s.sum / s.assessed).toFixed(1)) : avgSkill(meta.key),
        };
      }

      return {
        key: b.key,
        name: mode === 'subdistrict' ? b.subdistrict : b.district,
        subdistrict: b.subdistrict,
        district: b.district,
        province: b.province,
        subdistrictCount: b.subdistrictSet.size,
        learnerCount: b.learnerCount,
        literacyCount: b.literacyCount,
        maleCount: b.maleCount,
        femaleCount: b.femaleCount,
        otherGenderCount: b.otherGenderCount,
        assessedLearnerCount: b.assessedLearnerCount,
        assessedMaleCount: b.assessedMaleCount,
        assessedFemaleCount: b.assessedFemaleCount,
        assessedOtherCount: b.assessedOtherCount,
        completed4Count: b.completed4Count,
        incomplete4Count: b.incomplete4Count,
        testedLearnerCount: b.testedLearnerCount,
        passedLearnerCount: b.passedLearnerCount,
        failedLearnerCount: b.failedLearnerCount,
        notPassedLearnerCount: b.notPassedLearnerCount,
        untestedLearnerCount: b.untestedLearnerCount,
        passedMaleCount: b.passedMaleCount,
        passedFemaleCount: b.passedFemaleCount,
        failedMaleCount: b.failedMaleCount,
        failedFemaleCount: b.failedFemaleCount,
        attemptCount: b.attemptCount,
        reviewedAttemptCount: b.reviewedAttemptCount,
        passedAttemptCount: b.passedAttemptCount,
        failedAttemptCount: b.failedAttemptCount,
        passRate,
        exactPassRate,
        exactFailRate,
        avgPct,
        avgListening: avgSkill('listening'),
        avgSpeaking: avgSkill('speaking'),
        avgReading: avgSkill('reading'),
        avgWriting: avgSkill('writing'),
        skillStats,
      };
    })
    .sort((a, b) => {
      const aUnknown = a.name === UNKNOWN_LABEL ? 1 : 0;
      const bUnknown = b.name === UNKNOWN_LABEL ? 1 : 0;
      if (aUnknown !== bUnknown) return aUnknown - bUnknown;
      if (b.learnerCount !== a.learnerCount) return b.learnerCount - a.learnerCount;
      if (b.attemptCount !== a.attemptCount) return b.attemptCount - a.attemptCount;
      if (mode === 'district') {
        const ai = NARATHIWAT_DISTRICT_NAMES.indexOf(a.district);
        const bi = NARATHIWAT_DISTRICT_NAMES.indexOf(b.district);
        if (ai !== -1 && bi !== -1) return ai - bi;
      }
      return String(a.name).localeCompare(String(b.name), 'th');
    });
}

export function buildAnalyticsSummary(learners = [], attempts = []) {
  const totalLearners = learners.length;
  const literacyLearners = learners.filter(l => l.is_literacy_learner).length;
  const generalLearners = totalLearners - literacyLearners;

  // Assessed learners (took at least 1 assessment)
  const assessedLearners = learners.filter(l => l.hasAssessed).length;
  const unassessedLearners = totalLearners - assessedLearners;

  // Gender breakdown across ALL filtered learners and ASSESSED learners
  const maleLearners = learners.filter(l => l.gender === 'ชาย').length;
  const femaleLearners = learners.filter(l => l.gender === 'หญิง').length;
  const otherGenderLearners = totalLearners - maleLearners - femaleLearners;

  const assessedMale = learners.filter(l => l.hasAssessed && l.gender === 'ชาย').length;
  const assessedFemale = learners.filter(l => l.hasAssessed && l.gender === 'หญิง').length;
  const assessedOtherGender = assessedLearners - assessedMale - assessedFemale;

  // 4-skill completeness
  const completed4Learners = learners.filter(l => l.completedAll4Skills).length;
  const incomplete4Learners = totalLearners - completed4Learners;
  const partialSkillsLearners = learners.filter(l => !l.completedAll4Skills && l.assessedSkillCount > 0).length;

  // Overall pass/fail across completed 4-skill learners (plus legacy tested learners)
  const testedLearners = learners.filter(l => l.full_test_completed).length;
  const evaluatedLearners = learners.filter(l => l.completedAll4Skills || l.full_test_completed);
  const passedLearners = evaluatedLearners.filter(l => (l.completedAll4Skills ? l.assessmentStatus === 'passed' : l.full_test_passed)).length;
  const notPassedLearners = evaluatedLearners.length - passedLearners;
  const untestedLearners = totalLearners - evaluatedLearners.length;

  const learnerPassRatePct = evaluatedLearners.length ? roundPct(passedLearners, evaluatedLearners.length) : 0;
  const learnerFailRatePct = evaluatedLearners.length ? Number((100 - learnerPassRatePct).toFixed(1)) : 0;

  const completed4RatePct = totalLearners ? roundPct(completed4Learners, totalLearners) : 0;
  const incomplete4RatePct = totalLearners ? Number((100 - completed4RatePct).toFixed(1)) : 0;

  const assessedMalePct = assessedLearners ? roundPct(assessedMale, assessedLearners) : 0;
  const assessedFemalePct = assessedLearners ? roundPct(assessedFemale, assessedLearners) : 0;

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

  const skillBreakdown = buildSkillEvaluationSummary(learners, attempts);

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
    { name: 'ไม่ผ่านเกณฑ์ (<70%)', count: notPassedLearners, color: '#ef4444' },
    { name: 'ยังไม่ครบ 4 ทักษะ', count: untestedLearners, color: '#94a3b8' },
  ];

  const genderDistribution = [
    { name: 'ชาย', count: assessedMale, color: '#3b82f6' },
    { name: 'หญิง', count: assessedFemale, color: '#ec4899' },
    ...(assessedOtherGender > 0 ? [{ name: 'ไม่ระบุ', count: assessedOtherGender, color: '#94a3b8' }] : []),
  ];

  const completenessDistribution = [
    { name: 'ครบทั้ง 4 ทักษะ', count: completed4Learners, color: '#10b981' },
    { name: 'ยังทำไม่ครบ', count: incomplete4Learners, color: '#f59e0b' },
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
    assessedLearners,
    unassessedLearners,
    maleLearners,
    femaleLearners,
    otherGenderLearners,
    assessedMale,
    assessedFemale,
    assessedOtherGender,
    assessedMalePct,
    assessedFemalePct,
    completed4Learners,
    incomplete4Learners,
    partialSkillsLearners,
    completed4RatePct,
    incomplete4RatePct,
    testedLearners,
    evaluatedLearners: evaluatedLearners.length,
    passedLearners,
    notPassedLearners,
    untestedLearners,
    learnerPassRatePct,
    learnerFailRatePct,
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
    genderDistribution,
    completenessDistribution,
    dailyTrend,
  };
}

// ==================== CSV & EXCEL SHEET BUILDERS ====================

export function buildProvinceOverviewSheetRows(summary, filtersMeta = {}) {
  const rows = [
    [{ v: 'รายงานภาพรวมผลการประเมินทักษะภาษาไทย (ระดับจังหวัด)', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }],
    [
      { v: 'ขอบเขตตัวกรอง', s: 3 },
      filtersMeta.description || 'จังหวัดนราธิวาส / ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ',
      { v: 'วันที่ส่งออก', s: 3 },
      filtersMeta.exportedAt || new Date().toLocaleDateString('th-TH'),
    ],
    [],
    [{ v: 'รายการสรุปภาพรวม', s: 1 }, { v: 'จำนวน (คน)', s: 1 }, { v: 'ร้อยละ (%)', s: 1 }, { v: 'หมายเหตุ', s: 1 }],
    ['ผู้เรียนทั้งหมดตามตัวกรอง', summary.totalLearners, 100, `กิจกรรมรู้หนังสือ ${summary.literacyLearners} / ทั่วไป ${summary.generalLearners}`],
    ['ผู้เรียนที่เข้ารับการประเมินทั้งหมด', summary.assessedLearners, roundPct(summary.assessedLearners, summary.totalLearners), `ยังไม่เข้ารับการประเมิน ${summary.unassessedLearners} คน`],
    ['ผู้เรียนเข้ารับการประเมิน - เพศชาย', summary.assessedMale, summary.assessedMalePct, `ชายทั้งหมดในระบบ ${summary.maleLearners} คน`],
    ['ผู้เรียนเข้ารับการประเมิน - เพศหญิง', summary.assessedFemale, summary.assessedFemalePct, `หญิงทั้งหมดในระบบ ${summary.femaleLearners} คน`],
    ...(summary.assessedOtherGender > 0 ? [['ผู้เรียนเข้ารับการประเมิน - ไม่ระบุเพศ', summary.assessedOtherGender, roundPct(summary.assessedOtherGender, summary.assessedLearners), '']] : []),
    ['ทำแบบทดสอบครบทั้ง 4 ทักษะ', summary.completed4Learners, summary.completed4RatePct, 'ฟัง, พูด, อ่าน, เขียน ครบทุกด้าน'],
    ['ยังทำแบบทดสอบไม่ครบ 4 ทักษะ', summary.incomplete4Learners, summary.incomplete4RatePct, `ทำแล้วบางส่วน ${summary.partialSkillsLearners} คน`],
    ['ผู้เรียนที่ผ่านการประเมิน (เกณฑ์ ≥70%)', summary.passedLearners, summary.learnerPassRatePct, `เทียบจากผู้ประเมินครบ ${summary.evaluatedLearners} คน`],
    ['ผู้เรียนที่ไม่ผ่านการประเมิน (<70%)', summary.notPassedLearners, summary.learnerFailRatePct, `เทียบจากผู้ประเมินครบ ${summary.evaluatedLearners} คน`],
    ['ครอบคลุมพื้นที่ (อำเภอ / ตำบล)', `${summary.districtCount} อำเภอ / ${summary.subdistrictCount} ตำบล`, '-', `ครั้งที่สอบรวม ${summary.totalAttempts} ครั้ง`],
  ];
  return rows;
}

export function buildSkillSummarySheetRows(skillBreakdown = []) {
  const headers = [
    'ทักษะ',
    'เข้ารับการประเมิน (รวม)', 'เข้ารับการประเมิน (ชาย)', 'เข้ารับการประเมิน (หญิง)',
    'ผ่านการประเมิน (รวม)', 'ผ่านการประเมิน (ชาย)', 'ผ่านการประเมิน (หญิง)',
    'ไม่ผ่านการประเมิน (รวม)', 'ไม่ผ่านการประเมิน (ชาย)', 'ไม่ผ่านการประเมิน (หญิง)',
    'ร้อยละผ่าน (%)', 'ร้อยละไม่ผ่าน (%)', 'คะแนนเฉลี่ย', 'คะแนนเต็ม'
  ];

  const rows = skillBreakdown.map(s => [
    s.formalName || s.shortName,
    s.assessedCount, s.assessedMale, s.assessedFemale,
    s.passedCount, s.passedMale, s.passedFemale,
    s.failedCount, s.failedMale, s.failedFemale,
    s.passRatePct, s.failRatePct, s.avgScore, s.maxScore,
  ]);

  return [headers, ...rows];
}

export function buildProvinceOverviewCsv(summary, filtersMeta = {}) {
  const overviewRows = buildProvinceOverviewSheetRows(summary, filtersMeta).map(r =>
    r.map(c => csvCell(c && typeof c === 'object' && 'v' in c ? c.v : c, ''))
  );
  const skillRows = buildSkillSummarySheetRows(summary.skillBreakdown || []).map(r =>
    r.map(c => csvCell(c, '-'))
  );
  const combined = [...overviewRows, [], ['สรุปผลการประเมินรายทักษะ 4 ด้าน'], ...skillRows];
  return '\uFEFF' + combined.map(r => r.join(',')).join('\n');
}

export function buildAreaSummarySheetRows(rows = [], mode = 'district') {
  const headers = mode === 'subdistrict'
    ? [
        'ตำบล', 'อำเภอ', 'จังหวัด',
        'ผู้เรียนทั้งหมด (คน)', 'กิจกรรมรู้หนังสือ (คน)', 'ชาย (คน)', 'หญิง (คน)',
        'เข้ารับการประเมิน (คน)', 'ครบ 4 ทักษะ (คน)', 'ยังไม่ครบ 4 ทักษะ (คน)',
        'ผู้เรียนที่ผ่าน (คน)', 'ผู้เรียนไม่ผ่าน (คน)', 'ร้อยละผ่าน (%)', 'ร้อยละไม่ผ่าน (%)',
        'จำนวนครั้งที่สอบ', 'คะแนนเฉลี่ย (%)',
        'ฟัง: เข้าสอบ/ผ่าน', 'พูด: เข้าสอบ/ผ่าน', 'อ่าน: เข้าสอบ/ผ่าน', 'เขียน: เข้าสอบ/ผ่าน',
        'เฉลี่ยการฟัง (25)', 'เฉลี่ยการพูด (15)', 'เฉลี่ยการอ่าน (30)', 'เฉลี่ยการเขียน (30)'
      ]
    : [
        'อำเภอ', 'จังหวัด', 'จำนวนตำบล',
        'ผู้เรียนทั้งหมด (คน)', 'กิจกรรมรู้หนังสือ (คน)', 'ชาย (คน)', 'หญิง (คน)',
        'เข้ารับการประเมิน (คน)', 'ครบ 4 ทักษะ (คน)', 'ยังไม่ครบ 4 ทักษะ (คน)',
        'ผู้เรียนที่ผ่าน (คน)', 'ผู้เรียนไม่ผ่าน (คน)', 'ร้อยละผ่าน (%)', 'ร้อยละไม่ผ่าน (%)',
        'จำนวนครั้งที่สอบ', 'คะแนนเฉลี่ย (%)',
        'ฟัง: เข้าสอบ/ผ่าน', 'พูด: เข้าสอบ/ผ่าน', 'อ่าน: เข้าสอบ/ผ่าน', 'เขียน: เข้าสอบ/ผ่าน',
        'เฉลี่ยการฟัง (25)', 'เฉลี่ยการพูด (15)', 'เฉลี่ยการอ่าน (30)', 'เฉลี่ยการเขียน (30)'
      ];

  const bodyRows = (rows || []).map(r => {
    const areaCols = mode === 'subdistrict'
      ? [r.subdistrict || '-', r.district || '-', r.province || '-']
      : [r.district || '-', r.province || '-', r.subdistrictCount ?? 0];

    const sk = r.skillStats || {};
    const fmtSkillPass = (k) => `${sk[k]?.assessed ?? 0}/${sk[k]?.passed ?? 0}`;

    return [
      ...areaCols,
      r.learnerCount ?? 0,
      r.literacyCount ?? 0,
      r.maleCount ?? 0,
      r.femaleCount ?? 0,
      r.assessedLearnerCount ?? r.testedLearnerCount ?? 0,
      r.completed4Count ?? 0,
      r.incomplete4Count ?? 0,
      r.passedLearnerCount ?? 0,
      r.failedLearnerCount ?? r.notPassedLearnerCount ?? 0,
      r.exactPassRate ?? r.passRate ?? '-',
      r.exactFailRate ?? '-',
      r.attemptCount ?? 0,
      r.avgPct ?? '-',
      fmtSkillPass('listening'),
      fmtSkillPass('speaking'),
      fmtSkillPass('reading'),
      fmtSkillPass('writing'),
      r.avgListening ?? sk.listening?.avgScore ?? '-',
      r.avgSpeaking ?? sk.speaking?.avgScore ?? '-',
      r.avgReading ?? sk.reading?.avgScore ?? '-',
      r.avgWriting ?? sk.writing?.avgScore ?? '-',
    ];
  });

  return [headers, ...bodyRows];
}

export function buildAreaSummaryCsv(rows = [], mode = 'district') {
  const sheetRows = buildAreaSummarySheetRows(rows, mode);
  const [headers, ...bodyRows] = sheetRows;
  const csvRows = bodyRows.map(r =>
    r.map((cell, idx) => (idx < 3 && (mode === 'subdistrict' || idx < 2) ? csvCell(cell, '-') : (typeof cell === 'number' ? cell : csvCell(cell, '-'))))
  );
  return '\uFEFF' + headers.join(',') + '\n' + csvRows.map(r => r.join(',')).join('\n');
}

export function buildLearnersSheetRows(learners = [], formatDate = (d) => String(d || '-')) {
  const headers = [
    'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'อายุ', 'เพศ', 'สถานะ', 'ข้อมูลเพิ่มเติม', 'ผู้เรียนกิจกรรมรู้หนังสือ',
    'ตำบล', 'อำเภอ', 'จังหวัด',
    'คำนำหน้า', 'ความครบถ้วน (ทักษะ)', 'สถานะผลการประเมิน',
    'จำนวนครั้งสอบรวม', 'คะแนนรวมสูงสุด', 'ร้อยละรวม (%)',
    'การฟัง (25)', 'ผลทักษะการฟัง',
    'การพูด (15)', 'ผลทักษะการพูด',
    'การอ่าน (30)', 'ผลทักษะการอ่าน',
    'การเขียน (30)', 'ผลทักษะการเขียน',
    'วันที่สมัคร', 'วันที่สอบล่าสุด'
  ];

  const rows = (learners || []).map(l => {
    const sk = l.skills || {};
    const bd = l.breakdown || {};
    const skillScore = (k) => (sk[k]?.assessed ? sk[k].score : (bd[k]?.score ?? '-'));
    const skillStatus = (k) => sk[k]?.statusLabel || 'ยังไม่ประเมิน';

    const statusLabel = l.assessmentStatusLabel
      || (l.full_test_completed ? (l.full_test_passed ? 'ผ่าน' : 'ไม่ผ่าน') : (l.full_test_pending > 0 ? 'รอตรวจ' : 'ยังไม่ครบ 4 ทักษะ'));

    const totalScoreVal = l.overallScore !== null && l.overallScore !== undefined
      ? l.overallScore
      : (l.full_test_completed ? (l.full_test_score ?? 0) : '-');

    const totalPctVal = l.overallPct !== null && l.overallPct !== undefined
      ? l.overallPct
      : (l.full_test_completed ? Math.round(l.full_test_score ?? 0) : '-');

    return [
      l.name || '-',
      l.username || '-',
      l.age ?? '-',
      l.gender || '-',
      l.status || '-',
      l.education_level || l.employment_status || '-',
      l.is_literacy_learner ? 'ใช่' : 'ไม่ใช่',
      l.subdistrict || '-',
      l.district || '-',
      l.province || '-',
      l.prefix || '-',
      `${l.assessedSkillCount ?? 0}/4 ทักษะ (${l.completedAll4Skills ? 'ครบ' : 'ยังไม่ครบ'})`,
      statusLabel,
      l.anyAttemptCount ?? l.full_test_attempts ?? 0,
      totalScoreVal,
      totalPctVal,
      skillScore('listening'),
      skillStatus('listening'),
      skillScore('speaking'),
      skillStatus('speaking'),
      skillScore('reading'),
      skillStatus('reading'),
      skillScore('writing'),
      skillStatus('writing'),
      l.created_at ? formatDate(l.created_at) : '-',
      l.full_test_last_at ? formatDate(l.full_test_last_at) : '-',
    ];
  });

  return [headers, ...rows];
}

export function buildLearnersCsv(learners = [], formatDate = (d) => String(d || '-')) {
  const [headers, ...bodyRows] = buildLearnersSheetRows(learners, formatDate);
  const formattedRows = bodyRows.map(row =>
    row.map((val, idx) => {
      if (idx === 2 || idx === 6 || idx === 13 || idx === 14 || idx === 15 || idx === 16 || idx === 18 || idx === 20 || idx === 22) {
        return typeof val === 'number' ? val : (idx === 6 ? val : csvCell(val, '-'));
      }
      return csvCell(val, '-');
    })
  );
  return '\uFEFF' + headers.join(',') + '\n' + formattedRows.map(r => r.join(',')).join('\n');
}

export function buildWorkbookSheetsForTarget(
  target,
  { summary, districtRows = [], subdistrictRows = [], learners = [], formatDate, filtersMeta = {} }
) {
  if (target === 'province') {
    return [
      { name: 'ภาพรวมระดับจังหวัด', rows: buildProvinceOverviewSheetRows(summary, filtersMeta), freezeRow: 4 },
      { name: 'ผลการประเมินรายทักษะ', rows: buildSkillSummarySheetRows(summary.skillBreakdown || []), freezeRow: 1 },
      { name: 'สรุปรายอำเภอ', rows: buildAreaSummarySheetRows(districtRows, 'district'), freezeRow: 1 },
    ];
  }
  if (target === 'district') {
    return [
      { name: 'ข้อมูลรายอำเภอ', rows: buildAreaSummarySheetRows(districtRows, 'district'), freezeRow: 1 },
      { name: 'ผลการประเมินรายทักษะ', rows: buildSkillSummarySheetRows(summary.skillBreakdown || []), freezeRow: 1 },
    ];
  }
  if (target === 'subdistrict') {
    return [
      { name: 'ข้อมูลรายตำบล', rows: buildAreaSummarySheetRows(subdistrictRows, 'subdistrict'), freezeRow: 1 },
    ];
  }
  // 'learners'
  return [
    { name: 'รายบุคคล 4 ทักษะ', rows: buildLearnersSheetRows(learners, formatDate), freezeRow: 1 },
  ];
}
