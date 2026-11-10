import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHistoryCsv, buildSurveyCsv, buildLatestSurveyMap } from '../src/utils/csvExport.js';

test('survey CSV includes subdistrict, district, province and reflects survey edits', () => {
  const surveys = [
    {
      _id: 's1',
      submitted_at: '2026-11-10T10:00:00Z',
      gender: 'หญิง',
      age: '22',
      status: 'กำลังศึกษา',
      education_level: 'ระดับมัธยมศึกษาตอนปลาย',
      subdistrict: 'บางนาค',
      district: 'เมืองนราธิวาส',
      province: 'นราธิวาส',
      design_1: 4, design_2: 4, design_3: 3, design_4: 4,
      content_1: 4, content_2: 3, content_3: 4, content_4: 4,
      benefit_1: 4, benefit_2: 4, benefit_3: 4, benefit_4: 4,
      suggestions: 'ดีมาก, ใช้งานง่าย'
    }
  ];

  const csvBefore = buildSurveyCsv({ surveys, formatDate: () => '10 พ.ย. 2569' });
  const [headerLine, rowLine] = csvBefore.replace(/^\uFEFF/, '').split('\n');
  const headers = headerLine.split(',');
  assert.equal(headers[5], 'ตำบล');
  assert.equal(headers[6], 'อำเภอ');
  assert.equal(headers[7], 'จังหวัด');
  assert.match(rowLine, /"บางนาค","เมืองนราธิวาส","นราธิวาส"/);
  assert.match(rowLine, /"ดีมาก, ใช้งานง่าย"/);

  const editedSurveys = [{ ...surveys[0], subdistrict: 'โคกเคียน', district: 'เมืองนราธิวาส', province: 'นราธิวาส' }];
  const csvAfter = buildSurveyCsv({ surveys: editedSurveys, formatDate: () => '10 พ.ย. 2569' });
  assert.match(csvAfter, /"โคกเคียน","เมืองนราธิวาส","นราธิวาส"/);
});

test('history CSV omits address column, includes subdistrict, and updates immediately after user or survey edits', () => {
  const initialUsers = [
    { id: 'u1', name: 'สมชาย เดิม', username: 'somchai', age: 20, address: '', subdistrict: null, district: null, province: null }
  ];
  const initialSurveys = [
    { _id: 's1', user_id: 'u1', subdistrict: 'แว้ง', district: 'แว้ง', province: 'นราธิวาส', submitted_at: '2026-11-10T10:00:00Z' }
  ];
  const history = [
    {
      id: 'h1',
      user_id: 'u1',
      user: { id: 'u1', name: 'สมชาย เดิม', username: 'somchai', age: 20, address: '', district: 'แว้ง', province: 'นราธิวาส' },
      skill: 'full_test',
      score: 80,
      max_score: 100,
      taken_at: '2026-11-10T11:00:00Z',
      breakdown: { listening: { score: 20 }, speaking: { score: 12 }, reading: { score: 24 }, writing: { score: 24 } }
    }
  ];

  const csv1 = buildHistoryCsv({ history, users: initialUsers, surveys: initialSurveys, formatDate: () => '10 พ.ย. 2569' });
  const headerCols = csv1.replace(/^\uFEFF/, '').split('\n')[0].split(',');
  assert.equal(headerCols.includes('ที่อยู่'), false);
  assert.deepEqual(headerCols.slice(4, 7), ['ตำบล', 'อำเภอ', 'จังหวัด']);
  assert.match(csv1, /"สมชาย เดิม","somchai",20,"แว้ง","แว้ง","นราธิวาส"/);

  // Edit survey subdistrict/district without touching cached history row
  const updatedSurveys = [{ ...initialSurveys[0], subdistrict: 'โล๊ะจูด', district: 'แว้ง', province: 'นราธิวาส' }];
  const csvAfterSurveyEdit = buildHistoryCsv({ history, users: initialUsers, surveys: updatedSurveys, formatDate: () => '10 พ.ย. 2569' });
  assert.match(csvAfterSurveyEdit, /"โล๊ะจูด","แว้ง","นราธิวาส"/);

  // Edit user in admin modal without refreshing history row
  const updatedUsers = [{ id: 'u1', name: 'สมชาย แก้ไขแล้ว', username: 'somchai', age: 25, address: 'ต.บางนาค อ.เมือง จ.นราธิวาส', subdistrict: 'บางนาค', district: 'เมืองนราธิวาส', province: 'นราธิวาส' }];
  const csvAfterUserEdit = buildHistoryCsv({ history, users: updatedUsers, surveys: updatedSurveys, formatDate: () => '10 พ.ย. 2569' });
  assert.match(csvAfterUserEdit, /"สมชาย แก้ไขแล้ว","somchai",25,"บางนาค","เมืองนราธิวาส","นราธิวาส"/);
});

test('latest survey map selects the newest survey regardless of array order', () => {
  const older = { _id: '1', user_id: 'u1', subdistrict: 'เก่า', submitted_at: '2026-11-01T00:00:00Z' };
  const newer = { _id: '2', user_id: 'u1', subdistrict: 'ใหม่', submitted_at: '2026-11-10T00:00:00Z' };
  assert.equal(buildLatestSurveyMap([newer, older]).get('u1').subdistrict, 'ใหม่');
  assert.equal(buildLatestSurveyMap([older, newer]).get('u1').subdistrict, 'ใหม่');
});
