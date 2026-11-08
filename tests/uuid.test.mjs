import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUUID } from '../src/utils/uuid.js';

test('safeUUID generates a valid v4 UUID string', () => {
  const uuid = safeUUID();
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('safeUUID generates unique strings', () => {
  const set = new Set();
  for (let i = 0; i < 50; i++) {
    const id = safeUUID();
    assert.equal(set.has(id), false);
    set.add(id);
  }
  assert.equal(set.size, 50);
});

test('safeUUID falls back when crypto.randomUUID is not a function', () => {
  const orig = crypto.randomUUID;
  try {
    delete crypto.randomUUID;
    const uuid = safeUUID();
    assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  } finally {
    crypto.randomUUID = orig;
  }
});

