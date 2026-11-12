import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichAnalyticsData,
  getAreaFilterOptions,
  filterAnalyticsData,
  aggregateByArea,
  buildAnalyticsSummary,
  buildAreaSummaryCsv,
  buildLearnersCsv,
} from '../src/utils/adminAnalytics.js';

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
  assert.equal(enriched.attempts.find(a => a.id === 'h2').subdistrict, 'โคกเคียน');
});

test('computes cascading area options, filters, district/subdistrict aggregations and summary', () => {
  const enriched = enrichAnalyticsData({ users: sampleUsers, history: sampleHistory, surveys: sampleSurveys });

  const allOptions = getAreaFilterOptions(enriched.learners, enriched.attempts, 'all');
  assert.deepEqual(allOptions.districts, ['ตากใบ', 'เมืองนราธิวาส']);
  assert.deepEqual(allOptions.subdistricts, ['โคกเคียน', 'เจ๊ะเห', 'บางนาค']);

  const takBaiOptions = getAreaFilterOptions(enriched.learners, enriched.attempts, 'ตากใบ');
  assert.deepEqual(takBaiOptions.subdistricts, ['เจ๊ะเห']);

  const districtRows = aggregateByArea(enriched.learners, enriched.attempts, 'district');
  const muang = districtRows.find(r => r.district === 'เมืองนราธิวาส');
  assert.equal(muang.subdistrictCount, 2);
  assert.equal(muang.learnerCount, 2);
  assert.equal(muang.literacyCount, 1);
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
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.subdistrictCount, 3);
  assert.equal(summary.dailyTrend.length, 2);
});

test('exports district summary, subdistrict summary and learner detail CSVs cleanly', () => {
  const enriched = enrichAnalyticsData({ users: sampleUsers, history: sampleHistory, surveys: sampleSurveys });
  const districtRows = aggregateByArea(enriched.learners, enriched.attempts, 'district');
  const subRows = aggregateByArea(enriched.learners, enriched.attempts, 'subdistrict');

  const dCsv = buildAreaSummaryCsv(districtRows, 'district');
  assert.match(dCsv, /^(\uFEFF)?อำเภอ,จังหวัด,จำนวนตำบล,/);
  assert.match(dCsv, /"เมืองนราธิวาส","นราธิวาส",2,2,1/);

  const sCsv = buildAreaSummaryCsv(subRows, 'subdistrict');
  assert.match(sCsv, /^(\uFEFF)?ตำบล,อำเภอ,จังหวัด,/);
  assert.match(sCsv, /"โคกเคียน","เมืองนราธิวาส","นราธิวาส"/);

  const lCsv = buildLearnersCsv(enriched.learners, () => '10 พ.ย. 2569');
  assert.match(lCsv, /ชื่อ-นามสกุล,.*ตำบล,อำเภอ,จังหวัด/);
  assert.match(lCsv, /"นายก ก","u1",25,"ชาย","กำลังศึกษา","ม\.ปลาย",ใช่,"บางนาค","เมืองนราธิวาส","นราธิวาส"/);
});
