import test from 'node:test';
import assert from 'node:assert/strict';
import { NAME_PREFIXES, splitNamePrefix, combineNameWithPrefix } from '../src/utils/namePrefix.js';

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
