import assert from 'node:assert/strict';
import router from './routes/auth.js';
import User from './models/User.js';
import LevelProgress from './models/LevelProgress.js';
import jwt from 'jsonwebtoken';
const handler = router.stack.find(layer => layer.route?.path === '/register').route.stack[0].handle;
const originals = [User.findOne, User.prototype.save, LevelProgress.create];
try {
  User.findOne = async () => null;
  User.prototype.save = async function () { return this; };
  LevelProgress.create = async () => ({});
  for (const username of ['admin', 'ADMIN', 'student']) {
    let result;
    const res = { status(code) { assert.equal(code, 201); return this; }, json(body) { result = body; return this; } };
    await handler({ body: { username, password: 'test-password', name: 'Test', role: 'admin' } }, res);
    assert.equal(result.user.role, 'user', `${username} must not gain admin privileges`);
    assert.equal(jwt.verify(result.token, process.env.JWT_SECRET || 'dev_secret').role, 'user');
    assert.equal(result.user.password, undefined);
  }
  console.log('MongoDB registration role regression checks passed (no database writes)');
} finally { [User.findOne, User.prototype.save, LevelProgress.create] = originals; }
