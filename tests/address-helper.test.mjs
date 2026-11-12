import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NARATHIWAT_DISTRICT_NAMES,
  NARATHIWAT_SUBDISTRICTS_BY_DISTRICT,
  extractDistrictAndProvince,
  resolveLocationUpdates,
  normalizeNarathiwatDistrict,
  normalizeNarathiwatSubdistrict,
  normalizeThaiProvince,
  detectLocationAnomalies,
  buildNormalizedLocationPatch,
} from '../src/utils/addressHelper.js';

test('extracts district and province from standard prefix patterns', () => {
  const r1 = extractDistrictAndProvince('อ.เมืองนราธิวาส จ.นราธิวาส');
  assert.equal(r1.district, 'เมืองนราธิวาส');
  assert.equal(r1.province, 'นราธิวาส');

  const r2 = extractDistrictAndProvince('อำเภอสุไหงโก-ลก จังหวัดนราธิวาส');
  assert.equal(r2.district, 'สุไหงโก-ลก');
  assert.equal(r2.province, 'นราธิวาส');

  const r3 = extractDistrictAndProvince('123 ม.2 ต.บางนาค อ.เมือง จ.นราธิวาส 96000');
  assert.equal(r3.district, 'เมืองนราธิวาส');
  assert.equal(r3.province, 'นราธิวาส');

  const r4 = extractDistrictAndProvince('อ.เบตง จ.ยะลา');
  assert.equal(r4.district, 'เบตง');
  assert.equal(r4.province, 'ยะลา');
});

test('extracts district and province without prefixes', () => {
  const r1 = extractDistrictAndProvince('ตากใบ นราธิวาส');
  assert.equal(r1.district, 'ตากใบ');
  assert.equal(r1.province, 'นราธิวาส');

  const r2 = extractDistrictAndProvince('บาเจาะ นราธิวาส');
  assert.equal(r2.district, 'บาเจาะ');
  assert.equal(r2.province, 'นราธิวาส');

  const r3 = extractDistrictAndProvince('หาดใหญ่ สงขลา');
  assert.equal(r3.district, 'หาดใหญ่');
  assert.equal(r3.province, 'สงขลา');
});

test('infers province for Narathiwat districts when province is omitted', () => {
  const r1 = extractDistrictAndProvince('อ.รือเสาะ');
  assert.equal(r1.district, 'รือเสาะ');
  assert.equal(r1.province, 'นราธิวาส');

  const r2 = extractDistrictAndProvince('ระแงะ');
  assert.equal(r2.district, 'ระแงะ');
  assert.equal(r2.province, 'นราธิวาส');

  const r3 = extractDistrictAndProvince('สุไหงปาดี');
  assert.equal(r3.district, 'สุไหงปาดี');
  assert.equal(r3.province, 'นราธิวาส');
});

test('falls back to survey data when address lacks details', () => {
  const r1 = extractDistrictAndProvince('-', '', '', { district: 'แว้ง', province: 'นราธิวาส' });
  assert.equal(r1.district, 'แว้ง');
  assert.equal(r1.province, 'นราธิวาส');

  const r2 = extractDistrictAndProvince('', '', '', { district: 'อ.จะแนะ', province: 'จ.นราธิวาส' });
  assert.equal(r2.district, 'จะแนะ');
  assert.equal(r2.province, 'นราธิวาส');
});

test('handles missing or empty address gracefully', () => {
  const r = extractDistrictAndProvince('');
  assert.equal(r.subdistrict, '-');
  assert.equal(r.district, '-');
  assert.equal(r.province, '-');
});

test('extracts subdistrict from address or survey even when district and province are given', () => {
  const r1 = extractDistrictAndProvince('123 ม.2 ต.บางนาค อ.เมือง จ.นราธิวาส 96000', 'เมืองนราธิวาส', 'นราธิวาส');
  assert.equal(r1.subdistrict, 'บางนาค');
  assert.equal(r1.district, 'เมืองนราธิวาส');
  assert.equal(r1.province, 'นราธิวาส');

  const r2 = extractDistrictAndProvince('', '', '', { subdistrict: 'ต.โคกเคียน', district: 'เมืองนราธิวาส', province: 'นราธิวาส' });
  assert.equal(r2.subdistrict, 'โคกเคียน');
  assert.equal(r2.district, 'เมืองนราธิวาส');
  assert.equal(r2.province, 'นราธิวาส');
});

test('resolveLocationUpdates keeps explicit fields or extracts from edited address', () => {
  assert.deepEqual(
    resolveLocationUpdates({ address: 'ต.บางนาค อ.เมือง จ.นราธิวาส' }),
    { subdistrict: 'บางนาค', district: 'เมืองนราธิวาส', province: 'นราธิวาส' }
  );
  assert.deepEqual(
    resolveLocationUpdates({ address: '99/1', subdistrict: ' โคกเคียน ', district: 'เมืองนราธิวาส', province: 'นราธิวาส' }),
    { subdistrict: 'โคกเคียน', district: 'เมืองนราธิวาส', province: 'นราธิวาส' }
  );
});

test('covers all 13 Narathiwat districts and 77 official subdistricts without collisions', () => {
  assert.equal(NARATHIWAT_DISTRICT_NAMES.length, 13);
  assert.deepEqual(NARATHIWAT_SUBDISTRICTS_BY_DISTRICT['เจาะไอร้อง'], ['จวบ', 'บูกิต', 'มะรือโบออก']);
  const totalSubs = Object.values(NARATHIWAT_SUBDISTRICTS_BY_DISTRICT).reduce((sum, list) => sum + list.length, 0);
  assert.equal(totalSubs, 77);
});

test('auto-corrects misspelled Narathiwat districts and subdistricts without breaking non-Narathiwat areas', () => {
  assert.equal(normalizeNarathiwatDistrict('สุไหงโกลก'), 'สุไหงโก-ลก');
  assert.equal(normalizeNarathiwatDistrict('ตากใบย'), 'ตากใบ');
  assert.equal(normalizeNarathiwatDistrict('สุคีริน'), 'สุคิริน');
  assert.equal(normalizeNarathiwatDistrict('รือเซาะ'), 'รือเสาะ');
  assert.equal(normalizeNarathiwatDistrict('ยะรัง', 'ปัตตานี'), 'ยะรัง');

  assert.deepEqual(normalizeNarathiwatSubdistrict('ปาโงสะโต', 'ระแงะ'), { subdistrict: 'บาโงสะโต', inferredDistrict: 'ระแงะ' });
  assert.deepEqual(normalizeNarathiwatSubdistrict('โคกเคียณ', 'เมืองนราธิวาส'), { subdistrict: 'โคกเคียน', inferredDistrict: 'เมืองนราธิวาส' });
  assert.deepEqual(normalizeNarathiwatSubdistrict('บานาค', 'เมืองนราธิวาส'), { subdistrict: 'บางนาค', inferredDistrict: 'เมืองนราธิวาส' });
  assert.deepEqual(normalizeNarathiwatSubdistrict('เจ๊ะเหม'), { subdistrict: 'เจ๊ะเห', inferredDistrict: 'ตากใบ' });

  const extracted = extractDistrictAndProvince('ต.กะลูวอ อ.เมืองนรา');
  assert.equal(extracted.subdistrict, 'กะลุวอ');
  assert.equal(extracted.district, 'เมืองนราธิวาส');
  assert.equal(extracted.province, 'นราธิวาส');
});

test('detects misspelled location anomalies and builds accurate bulk normalization patches', () => {
  const users = [
    { id: 'u1', role: 'user', subdistrict: 'โคกเคียณ', district: 'เมืองนราธิวาส', province: 'นราธิวาส' },
    { id: 'u2', role: 'user', address: 'ต.บานาค อ.ตากใบย จ.นราธิวาส' },
    { id: 'u3', role: 'user', subdistrict: 'บางนาค', district: 'เมืองนราธิวาส', province: 'นราธิวาส' }, // valid
    { id: 'u4', role: 'admin', subdistrict: 'ผิด', district: 'ผิด' }, // admin ignored
  ];
  const surveys = [
    { _id: 's1', subdistrict: 'โคกเคียณ', district: 'เมืองนราธิวาส', province: 'นราธิวาส' },
  ];

  const anomalies = detectLocationAnomalies(users, surveys);
  const khokAnomaly = anomalies.find(a => a.rawValue === 'โคกเคียณ');
  assert.ok(khokAnomaly);
  assert.equal(khokAnomaly.field, 'subdistrict');
  assert.equal(khokAnomaly.userCount, 1);
  assert.equal(khokAnomaly.surveyCount, 1);
  assert.equal(khokAnomaly.suggestedValue, 'โคกเคียน');
  assert.equal(khokAnomaly.suggestedDistrict, 'เมืองนราธิวาส');

  const takBaiAnomaly = anomalies.find(a => a.rawValue === 'ตากใบย');
  assert.ok(takBaiAnomaly);
  assert.equal(takBaiAnomaly.field, 'district');
  assert.equal(takBaiAnomaly.suggestedValue, 'ตากใบ');

  const patchUser = buildNormalizedLocationPatch(users[0], {
    field: 'subdistrict',
    fromValue: 'โคกเคียณ',
    toValue: 'โคกเคียน',
    districtFilter: 'เมืองนราธิวาส',
    targetDistrict: 'เมืองนราธิวาส',
    targetProvince: 'นราธิวาส',
    isUser: true,
  });
  assert.deepEqual(patchUser, { subdistrict: 'โคกเคียน', district: 'เมืองนราธิวาส', province: 'นราธิวาส' });

  // Clean user should not be modified
  assert.equal(
    buildNormalizedLocationPatch(users[2], { field: 'subdistrict', fromValue: 'โคกเคียณ', toValue: 'โคกเคียน', isUser: true }),
    null
  );
});

test('normalizes misspelled Narathiwat provinces and invalid province values paired with Narathiwat districts', () => {
  assert.equal(normalizeThaiProvince('นราธวาส'), 'นราธิวาส');
  assert.equal(normalizeThaiProvince('นราะิวาส'), 'นราธิวาส');
  assert.equal(normalizeThaiProvince('นราธวิาส'), 'นราธิวาส');

  const typoProv = extractDistrictAndProvince('', 'ตากใบ', 'นรธิวาส');
  assert.equal(typoProv.district, 'ตากใบ');
  assert.equal(typoProv.province, 'นราธิวาส');

  const junkProv = extractDistrictAndProvince('', 'ยี่งอ', '1');
  assert.equal(junkProv.district, 'ยี่งอ');
  assert.equal(junkProv.province, 'นราธิวาส');

  const distInProv = extractDistrictAndProvince('', 'สุไหงปาดี', 'สุไหงปาดี');
  assert.equal(distInProv.district, 'สุไหงปาดี');
  assert.equal(distInProv.province, 'นราธิวาส');

  const realOtherProv = extractDistrictAndProvince('', 'เบตง', 'ยะลา');
  assert.equal(realOtherProv.district, 'เบตง');
  assert.equal(realOtherProv.province, 'ยะลา');
});

