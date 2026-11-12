import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NARATHIWAT_DISTRICT_NAMES,
  enrichAnalyticsData,
  getAreaFilterOptions,
  filterAnalyticsData,
  aggregateByArea,
  buildAnalyticsSummary,
  buildSkillEvaluationSummary,
  buildProvinceOverviewCsv,
  buildAreaSummaryCsv,
  buildLearnersCsv,
  buildWorkbookSheetsForTarget,
} from '../src/utils/adminAnalytics.js';
import { buildXlsxWorkbook } from '../src/utils/xlsxExport.js';

const sampleUsers = [
  { id: 'admin1', role: 'admin', name: 'แอดมิน', username: 'admin' },
  {
    id: 'u1', role: 'user', name: 'นายก ก', username: 'u1', age: 25, gender: 'ชาย',
    status: 'กำลังศึกษา', education_level: 'ม.ปลาย', is_literacy_learner: true,
    address: 'ต.บางนาค อ.เมืองนราธิวาส จ.นราธิวาส',
    full_test_completed: true, full_test_passed: true, full_test_score: 82, full_test_attempts: 1,
    created_at: '2026-11-01T00:00:00Z', full_test_last_at: '2026-11-10T10:00:00Z'
  },
  {
    id: 'u2', role: 'user', name: 'นางข ข', username: 'u2', age: 40, gender: 'หญิง',
    status: 'ไม่ได้ศึกษา', employment_status: 'มีงานทำ', is_literacy_learner: false,
    address: '',
    full_test_completed: true, full_test_passed: false, full_test_score: 55, full_test_attempts: 1,
    created_at: '2026-11-02T00:00:00Z', full_test_last_at: '2026-11-11T10:00:00Z'
  },
  {
    id: 'u3', role: 'user', name: 'นางสาวค ค', username: 'u3', age: 30,
    is_literacy_learner: true, subdistrict: 'เจ๊ะเห', district: 'ตากใบ', province: 'นราธิวาส',
    full_test_completed: false, full_test_passed: false, full_test_attempts: 0,
    created_at: '2026-11-03T00:00:00Z'
  }
];

const sampleSurveys = [
  { _id: 's2', user_id: 'u2', subdistrict: 'โคกเคียน', district: 'เมืองนราธิวาส', province: 'นราธิวาส', submitted_at: '2026-11-11T10:05:00Z' }
];

const sampleHistory = [
  {
    id: 'h1', user_id: 'u1', user: { id: 'u1', name: 'นายก ก', username: 'u1' },
    skill: 'full_test', score: 82, max_score: 100, pending_count: 0, taken_at: '2026-11-10T10:00:00Z',
    breakdown: { listening: { score: 20 }, speaking: { score: 12 }, reading: { score: 25 }, writing: { score: 25 } }
  },
  {
    id: 'h2', user_id: 'u2', user: { id: 'u2', name: 'นางข ข', username: 'u2' },
    skill: 'full_test', score: 55, max_score: 100, pending_count: 0, taken_at: '2026-11-11T10:00:00Z',
    breakdown: { listening: { score: 15 }, speaking: { score: 10 }, reading: { score: 15 }, writing: { score: 15 } }
  }
];

test('enriches learners and attempts with subdistrict, district, province and excludes admins', () => {
  const enriched = enrichAnalyticsData({ users: sampleUsers, history: sampleHistory, surveys: sampleSurveys });
  assert.equal(enriched.learners.length, 3);
  assert.equal(enriched.learners.find(l => l.id === 'u1').subdistrict, 'บางนาค');
  assert.equal(enriched.learners.find(l => l.id === 'u2').subdistrict, 'โคกเคียน');
  assert.equal(enriched.learners.find(l => l.id === 'u2').district, 'เมืองนราธิวาส');
  assert.equal(enriched.learners.find(l => l.id === 'u3').gender, 'หญิง'); // inferred from นางสาว
  assert.equal(enriched.learners.find(l => l.id === 'u3').prefix, 'นางสาว');
  assert.equal(enriched.attempts.find(a => a.id === 'h2').subdistrict, 'โคกเคียน');
});

test('computes cascading area options, filters, district/subdistrict aggregations and summary', () => {
  const enriched = enrichAnalyticsData({ users: sampleUsers, history: sampleHistory, surveys: sampleSurveys });

  const allOptions = getAreaFilterOptions(enriched.learners, enriched.attempts, 'all');
  assert.deepEqual(allOptions.districts, ['ตากใบ', 'เมืองนราธิวาส']);
  assert.deepEqual(allOptions.subdistricts, ['โคกเคียน', 'เจ๊ะเห', 'บางนาค']);

  const all13Options = getAreaFilterOptions(enriched.learners, enriched.attempts, 'all', { includeAllNarathiwatDistricts: true });
  assert.equal(all13Options.districts.length, 13);
  assert.equal(NARATHIWAT_DISTRICT_NAMES.length, 13);

  const takBaiOptions = getAreaFilterOptions(enriched.learners, enriched.attempts, 'ตากใบ');
  assert.deepEqual(takBaiOptions.subdistricts, ['เจ๊ะเห']);

  const districtRows = aggregateByArea(enriched.learners, enriched.attempts, 'district');
  const muang = districtRows.find(r => r.district === 'เมืองนราธิวาส');
  assert.equal(muang.subdistrictCount, 2);
  assert.equal(muang.learnerCount, 2);
  assert.equal(muang.literacyCount, 1);
  assert.equal(muang.maleCount, 1);
  assert.equal(muang.femaleCount, 1);
  assert.equal(muang.passedLearnerCount, 1);
  assert.equal(muang.notPassedLearnerCount, 1);
  assert.equal(muang.passRate, 50);
  assert.equal(muang.avgPct, 69); // Math.round((82+55)/2)
  assert.equal(muang.avgListening, 17.5);

  const subRows = aggregateByArea(enriched.learners, enriched.attempts, 'subdistrict');
  assert.equal(subRows.length, 3);
  const bangNak = subRows.find(r => r.subdistrict === 'บางนาค');
  assert.equal(bangNak.passRate, 100);
  assert.equal(bangNak.avgListening, 20);

  const filtered = filterAnalyticsData(enriched, { district: 'เมืองนราธิวาส', subdistrict: 'บางนาค', enrollment: 'literacy' });
  assert.equal(filtered.learners.length, 1);
  assert.equal(filtered.attempts.length, 1);

  const summary = buildAnalyticsSummary(enriched.learners, enriched.attempts);
  assert.equal(summary.totalLearners, 3);
  assert.equal(summary.literacyLearners, 2);
  assert.equal(summary.generalLearners, 1);
  assert.equal(summary.assessedLearners, 2);
  assert.equal(summary.unassessedLearners, 1);
  assert.equal(summary.completed4Learners, 2);
  assert.equal(summary.incomplete4Learners, 1);
  assert.equal(summary.maleLearners, 1);
  assert.equal(summary.femaleLearners, 2);
  assert.equal(summary.otherGenderLearners, 0);
  assert.equal(summary.malePct, 33.33);
  assert.equal(summary.femalePct, 66.67);
  assert.equal(summary.otherGenderPct, 0);
  assert.equal(summary.untestedLearners, 1);
  assert.equal(summary.untestedRatePct, 33.33);
  assert.equal(summary.maleLearners + summary.femaleLearners + summary.otherGenderLearners, summary.totalLearners);
  assert.equal(summary.passedLearners + summary.notPassedLearners + summary.untestedLearners, summary.totalLearners);
  assert.equal(filterAnalyticsData(enriched, { enrollment: 'other' }).learners.length, 1);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.subdistrictCount, 3);
  assert.equal(summary.dailyTrend.length, 2);
});

test('tracks 4-skill pass/fail by gender and standalone skill test completeness accurately', () => {
  const users = [
    { id: 'a1', role: 'user', name: 'นายสมบูรณ์ ใจดี', username: 'a1', gender: 'ชาย', is_literacy_learner: true, district: 'สุไหงโกลก', subdistrict: 'สุไหงโก-ลก' },
    { id: 'a2', role: 'user', name: 'นางสมหญิง เก่งมาก', username: 'a2', gender: 'หญิง', is_literacy_learner: true, district: 'แว้ง', subdistrict: 'แว้ง' },
    { id: 'a3', role: 'user', name: 'ด.ช.นิดหน่อย ลองทำ', username: 'a3', is_literacy_learner: true, district: 'รือเสาะ', subdistrict: 'รือเสาะ' },
  ];
  const history = [
    // a1 takes all 4 standalone skill tests and passes overall (>= 70%) and every skill
    { id: 's1', user_id: 'a1', skill: 'listening', score: 20, max_score: 25, pending_count: 0, taken_at: '2026-11-10T09:00:00Z' },
    { id: 's2', user_id: 'a1', skill: 'conversation', score: 12, max_score: 15, pending_count: 0, taken_at: '2026-11-10T09:10:00Z' },
    { id: 's3', user_id: 'a1', skill: 'reading', score: 24, max_score: 30, pending_count: 0, taken_at: '2026-11-10T09:20:00Z' },
    { id: 's4', user_id: 'a1', skill: 'writing', score: 21, max_score: 30, pending_count: 0, taken_at: '2026-11-10T09:30:00Z' },
    // a2 passes listening and reading, fails speaking & writing (4 skills complete, total 62/100 -> failed)
    {
      id: 's5', user_id: 'a2', skill: 'full_test', score: 62, max_score: 100, pending_count: 0, taken_at: '2026-11-11T10:00:00Z',
      breakdown: {
        listening: { score: 20, max: 25, pending: 0 },
        speaking: { score: 6, max: 15, pending: 0 },
        reading: { score: 22, max: 30, pending: 0 },
        writing: { score: 14, max: 30, pending: 0 },
      }
    },
    // a3 only took listening (passed listening, incomplete overall)
    { id: 's6', user_id: 'a3', skill: 'listening', score: 20, max_score: 25, pending_count: 0, taken_at: '2026-11-11T11:00:00Z' },
  ];

  const enriched = enrichAnalyticsData({ users, history, surveys: [] });
  const a1 = enriched.learners.find(l => l.id === 'a1');
  const a2 = enriched.learners.find(l => l.id === 'a2');
  const a3 = enriched.learners.find(l => l.id === 'a3');

  assert.equal(a1.district, 'สุไหงโก-ลก'); // alias normalized
  assert.equal(a1.province, 'นราธิวาส'); // inferred from Narathiwat district
  assert.equal(a1.completedAll4Skills, true);
  assert.equal(a1.assessmentStatus, 'passed');

  assert.equal(a2.completedAll4Skills, true);
  assert.equal(a2.assessmentStatus, 'failed');

  assert.equal(a3.gender, 'ชาย'); // inferred from ด.ช.
  assert.equal(a3.assessedSkillCount, 1);
  assert.equal(a3.completedAll4Skills, false);
  assert.equal(a3.assessmentStatus, 'incomplete');

  const skillSummary = buildSkillEvaluationSummary(enriched.learners, enriched.attempts);
  const listening = skillSummary.find(s => s.key === 'listening');
  assert.equal(listening.assessedCount, 3);
  assert.equal(listening.assessedMale, 2);
  assert.equal(listening.assessedFemale, 1);
  assert.equal(listening.passedCount, 3);
  assert.equal(listening.failedCount, 0);
  assert.equal(listening.unassessedCount, 0);
  assert.equal(listening.passRatePct, 100);

  const speaking = skillSummary.find(s => s.key === 'speaking');
  assert.equal(speaking.assessedCount, 2);
  assert.equal(speaking.passedMale, 1);
  assert.equal(speaking.failedFemale, 1);
  assert.equal(speaking.unassessedCount, 1);
  assert.equal(speaking.passRatePct, 50);
  assert.equal(speaking.failRatePct, 50);

  // Filter by gender, status, prefix
  assert.equal(filterAnalyticsData(enriched, { gender: 'ชาย', assessmentStatus: 'incomplete' }).learners.length, 1);
  assert.equal(filterAnalyticsData(enriched, { prefix: 'ด.ช.' }).learners[0].id, 'a3');
  assert.equal(filterAnalyticsData(enriched, { assessmentStatus: 'passed' }).learners[0].id, 'a1');

  // All 13 Narathiwat districts appear when option is enabled
  const all13DistrictRows = aggregateByArea(enriched.learners, enriched.attempts, 'district', {
    includeAllNarathiwatDistricts: true,
  });
  assert.equal(all13DistrictRows.length, 13);
});

test('exports district, subdistrict, province overview CSVs and multi-sheet Excel (.xlsx) workbooks cleanly', () => {
  const enriched = enrichAnalyticsData({ users: sampleUsers, history: sampleHistory, surveys: sampleSurveys });
  const districtRows = aggregateByArea(enriched.learners, enriched.attempts, 'district');
  const subRows = aggregateByArea(enriched.learners, enriched.attempts, 'subdistrict');
  const summary = buildAnalyticsSummary(enriched.learners, enriched.attempts);

  const dCsv = buildAreaSummaryCsv(districtRows, 'district');
  assert.match(dCsv, /^(\uFEFF)?อำเภอ,จังหวัด,จำนวนตำบล,/);
  assert.match(dCsv, /"เมืองนราธิวาส","นราธิวาส",2,2,1/);

  const sCsv = buildAreaSummaryCsv(subRows, 'subdistrict');
  assert.match(sCsv, /^(\uFEFF)?ตำบล,อำเภอ,จังหวัด,/);
  assert.match(sCsv, /"โคกเคียน","เมืองนราธิวาส","นราธิวาส"/);

  const lCsv = buildLearnersCsv(enriched.learners, () => '10 พ.ย. 2569');
  assert.match(lCsv, /ชื่อ-นามสกุล,.*ตำบล,อำเภอ,จังหวัด/);
  assert.match(lCsv, /"นายก ก","u1",25,"ชาย","กำลังศึกษา","ม\.ปลาย",ใช่,"บางนาค","เมืองนราธิวาส","นราธิวาส"/);

  const pCsv = buildProvinceOverviewCsv(summary, { description: 'จังหวัดนราธิวาส', exportedAt: '12 พ.ย. 2569' });
  assert.match(pCsv, /รายงานภาพรวมผลการประเมินทักษะภาษาไทย/);
  assert.match(pCsv, /ทักษะการฟัง/);

  const provinceSheets = buildWorkbookSheetsForTarget('province', {
    summary,
    districtRows,
    subdistrictRows: subRows,
    learners: enriched.learners,
    formatDate: () => '10 พ.ย. 2569',
    filtersMeta: { description: 'จังหวัดนราธิวาส', exportedAt: '12 พ.ย. 2569' },
  });
  assert.equal(provinceSheets.length, 3);

  const xlsxBytes = buildXlsxWorkbook(provinceSheets);
  assert.ok(xlsxBytes instanceof Uint8Array);
  // PKZIP local file header magic signature "PK\x03\x04"
  assert.equal(xlsxBytes[0], 0x50);
  assert.equal(xlsxBytes[1], 0x4b);
  assert.equal(xlsxBytes[2], 0x03);
  assert.equal(xlsxBytes[3], 0x04);

  const decoded = new TextDecoder().decode(xlsxBytes);
  assert.ok(decoded.includes('[Content_Types].xml'));
  assert.ok(decoded.includes('xl/workbook.xml'));
  assert.ok(decoded.includes('xl/worksheets/sheet3.xml'));
  assert.ok(decoded.includes('รายงานภาพรวมผลการประเมินทักษะภาษาไทย'));
  assert.ok(decoded.includes('เมืองนราธิวาส'));
});
