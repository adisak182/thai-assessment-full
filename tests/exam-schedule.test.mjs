import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExamWindow, validateExamScheduleInput } from '../src/utils/examSchedule.js';
import User from '../server/models/User.js';
import ExamSettings from '../server/models/ExamSettings.js';
import usersRouter from '../server/routes/users.js';

const mockResponse = () => ({
  code: 200,
  status(code) { this.code = code; return this; },
  json(body) { this.body = body; return this; },
});

test('validates exam schedule inputs safely', () => {
  assert.ok(validateExamScheduleInput({ mode: 'invalid' }).error);
  assert.ok(validateExamScheduleInput({ mode: 'scheduled' }).error);
  assert.ok(validateExamScheduleInput({
    mode: 'scheduled',
    open_at: '2026-11-12T10:00:00Z',
    close_at: '2026-11-12T09:00:00Z',
  }).error);

  const ok = validateExamScheduleInput({
    mode: 'scheduled',
    open_at: '2026-11-12T01:00:00Z',
    close_at: '2026-11-12T09:00:00Z',
    closed_message: 'ปิดปรับปรุงชั่วคราว',
    allow_admin_bypass: false,
  });
  assert.equal(ok.error, undefined);
  assert.equal(ok.mode, 'scheduled');
  assert.equal(ok.allow_admin_bypass, false);
});

test('evaluates always_open, closed, scheduled waiting/open/ended windows and admin bypass', () => {
  const always = evaluateExamWindow(null, new Date('2026-11-12T05:00:00Z'));
  assert.equal(always.isOpen, true);
  assert.equal(always.status, 'always_open');

  const closed = evaluateExamWindow({ mode: 'closed', closed_message: 'ปิดสอบชั่วคราว', allow_admin_bypass: true }, new Date('2026-11-12T05:00:00Z'));
  assert.equal(closed.isOpen, false);
  assert.equal(closed.rawOpen, false);
  assert.equal(closed.status, 'closed');

  const closedForAdmin = evaluateExamWindow({ mode: 'closed', allow_admin_bypass: true }, new Date('2026-11-12T05:00:00Z'), { isAdmin: true });
  assert.equal(closedForAdmin.isOpen, true);
  assert.equal(closedForAdmin.bypassedByAdmin, true);

  const sched = {
    mode: 'scheduled',
    open_at: '2026-11-12T03:00:00Z',
    close_at: '2026-11-12T09:00:00Z',
  };
  const waiting = evaluateExamWindow(sched, new Date('2026-11-12T02:00:00Z'));
  assert.equal(waiting.isOpen, false);
  assert.equal(waiting.status, 'scheduled_waiting');
  assert.equal(waiting.opensInMs, 3600 * 1000);

  const openNow = evaluateExamWindow(sched, new Date('2026-11-12T06:00:00Z'));
  assert.equal(openNow.isOpen, true);
  assert.equal(openNow.status, 'scheduled_open');
  assert.equal(openNow.remainingMs, 3 * 3600 * 1000);

  const ended = evaluateExamWindow(sched, new Date('2026-11-12T10:00:00Z'));
  assert.equal(ended.isOpen, false);
  assert.equal(ended.status, 'scheduled_ended');
});

test('POST /users/score blocks learner submission with 403 when exam schedule is closed', async () => {
  const origFindUser = User.findById;
  const origFindSettings = ExamSettings.findOne;

  User.findById = () => ({ select: () => ({ lean: async () => ({ _id: 'u1', role: 'user' }) }) });
  ExamSettings.findOne = () => ({
    lean: async () => ({
      mode: 'closed',
      closed_message: 'ปิดการทำข้อสอบชั่วคราว',
      allow_admin_bypass: true,
    }),
  });

  try {
    const res = mockResponse();
    const scoreRoute = usersRouter.stack.find(l => l.route?.path === '/score').route.stack.at(-1);
    await scoreRoute.handle({
      userId: '507f1f77bcf86cd799439011',
      body: {
        submissionId: '11111111-1111-4111-8111-111111111111',
        skill: 'full_test',
        level: 1,
        responses: [],
      },
    }, res);

    assert.equal(res.code, 403);
    assert.equal(res.body.message, 'ปิดการทำข้อสอบชั่วคราว');
  } finally {
    User.findById = origFindUser;
    ExamSettings.findOne = origFindSettings;
  }
});
