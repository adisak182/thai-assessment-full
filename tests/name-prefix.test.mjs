import test from 'node:test';
import assert from 'node:assert/strict';
import { NAME_PREFIXES, splitNamePrefix, combineNameWithPrefix, stripLiteracySuffix } from '../src/utils/namePrefix.js';

test('defines all five requested Thai name prefixes in order', () => {
  assert.deepEqual(NAME_PREFIXES, ['นาย', 'นาง', 'นางสาว', 'ด.ช.', 'ด.ญ.']);
});

test('splits Thai prefixes accurately without misparsing นางสาว or นายิกา', () => {
  assert.deepEqual(splitNamePrefix('นายสมชาย ใจดี'), { prefix: 'นาย', nameWithoutPrefix: 'สมชาย ใจดี' });
  assert.deepEqual(splitNamePrefix('นางสมหญิง ใจดี'), { prefix: 'นาง', nameWithoutPrefix: 'สมหญิง ใจดี' });
  assert.deepEqual(splitNamePrefix('นางสาวสมหญิง ใจดี'), { prefix: 'นางสาว', nameWithoutPrefix: 'สมหญิง ใจดี' });
  assert.deepEqual(splitNamePrefix('ด.ช.กล้า ใจดี'), { prefix: 'ด.ช.', nameWithoutPrefix: 'กล้า ใจดี' });
  assert.deepEqual(splitNamePrefix('ด.ช กล้า ใจดี'), { prefix: 'ด.ช.', nameWithoutPrefix: 'กล้า ใจดี' });
  assert.deepEqual(splitNamePrefix('ด.ญ.แก้ว ใจดี'), { prefix: 'ด.ญ.', nameWithoutPrefix: 'แก้ว ใจดี' });
  assert.deepEqual(splitNamePrefix('นายิกา ใจดี'), { prefix: '', nameWithoutPrefix: 'นายิกา ใจดี' });
  assert.deepEqual(splitNamePrefix('ผู้ดูแลระบบ'), { prefix: '', nameWithoutPrefix: 'ผู้ดูแลระบบ' });
});

test('combines dropdown prefix and name without duplicate prefixes', () => {
  assert.equal(combineNameWithPrefix('นาย', 'สมชาย ใจดี'), 'นายสมชาย ใจดี');
  assert.equal(combineNameWithPrefix('นาย', 'นายสมชาย ใจดี'), 'นายสมชาย ใจดี');
  assert.equal(combineNameWithPrefix('ด.ช.', 'ด.ช สมชาย ใจดี'), 'ด.ช.สมชาย ใจดี');
  assert.equal(combineNameWithPrefix('นางสาว', 'นายิกา ใจดี'), 'นางสาวนายิกา ใจดี');
  assert.equal(combineNameWithPrefix('', 'สมชาย ใจดี'), 'สมชาย ใจดี');
  assert.equal(combineNameWithPrefix('นาย', '   '), '');
});

test('strips literacy suffix variations cleanly from names', () => {
  assert.equal(stripLiteracySuffix('นางมือเลาะ  มูซอ(ส่งเสริมการรู้หนังสือ)'), 'นางมือเลาะ  มูซอ');
  assert.equal(stripLiteracySuffix('นางสาวซูฮานา  บินยา  ส่งเสริมการรู้หนังสือ'), 'นางสาวซูฮานา  บินยา');
  assert.equal(stripLiteracySuffix('นางสาววนิดา  จันทร์ปรุง ส่งเสริมการเรียนหนังสือ'), 'นางสาววนิดา  จันทร์ปรุง');
  assert.equal(stripLiteracySuffix('นางสาวอานาเฟีย  สาเระ (ส่งเกริมการรู้หนังสือ)'), 'นางสาวอานาเฟีย  สาเระ');
  assert.equal(stripLiteracySuffix('นางสาววรุณสิริ เจ๊ะเงาะ (ส่งเสรืมการรู้หนังสือ)'), 'นางสาววรุณสิริ เจ๊ะเงาะ');
  assert.equal(stripLiteracySuffix('นางสาวนารียะห์ อาแวหะมะ (ส่งเสริมการรู้หนนังสือ)'), 'นางสาวนารียะห์ อาแวหะมะ');
  assert.equal(stripLiteracySuffix('นางสาวมาดีนะห์  อิบรอเฮ็ม (ส่งเสริมการรู้หนังสือ))'), 'นางสาวมาดีนะห์  อิบรอเฮ็ม');
  assert.equal(stripLiteracySuffix('นายสมชาย ใจดี'), 'นายสมชาย ใจดี');
  assert.equal(stripLiteracySuffix(''), '');
});

test('splits and combines names while stripping literacy suffix', () => {
  assert.deepEqual(
    splitNamePrefix('นางมือเลาะ  มูซอ(ส่งเสริมการรู้หนังสือ)'),
    { prefix: 'นาง', nameWithoutPrefix: 'มือเลาะ  มูซอ' }
  );
  assert.equal(
    combineNameWithPrefix('นางสาว', 'ฮานีซะห์ แวซู(ส่งเสริมการรู้หนังสือ)'),
    'นางสาวฮานีซะห์ แวซู'
  );
});
