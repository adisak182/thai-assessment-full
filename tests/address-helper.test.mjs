import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDistrictAndProvince, resolveLocationUpdates } from '../src/utils/addressHelper.js';

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

