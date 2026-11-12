export const EXAM_SCHEDULE_MODES = ['always_open', 'scheduled', 'closed'];

export const DEFAULT_CLOSED_MESSAGE =
  'ขณะนี้อยู่นอกช่วงเวลาที่เปิดให้ทำข้อสอบ กรุณารอช่วงเวลาเปิดสอบรอบถัดไป หรือติดต่อผู้ดูแลระบบ';

export function formatThaiDateTime(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })} น.`;
}

function parseOptionalDate(val) {
  if (val === null || val === undefined || val === '') return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Validate admin schedule payload before storing.
 * Returns { error } on invalid input or normalized fields.
 */
export function validateExamScheduleInput(body = {}) {
  const mode = String(body.mode || 'always_open').trim();
  if (!EXAM_SCHEDULE_MODES.includes(mode)) {
    return { error: 'รูปแบบการเปิด-ปิดระบบสอบไม่ถูกต้อง' };
  }

  const openAt = parseOptionalDate(body.open_at);
  const closeAt = parseOptionalDate(body.close_at);

  if (body.open_at && !openAt) {
    return { error: 'รูปแบบวันเวลาเปิดสอบไม่ถูกต้อง' };
  }
  if (body.close_at && !closeAt) {
    return { error: 'รูปแบบวันเวลาปิดสอบไม่ถูกต้อง' };
  }

  if (mode === 'scheduled') {
    if (!openAt && !closeAt) {
      return { error: 'กรุณาระบุเวลาเปิดสอบหรือเวลาปิดสอบอย่างน้อย 1 รายการ' };
    }
    if (openAt && closeAt && openAt.getTime() >= closeAt.getTime()) {
      return { error: 'เวลาปิดสอบต้องอยู่หลังเวลาเปิดสอบ' };
    }
  }

  const closedMessage = typeof body.closed_message === 'string' && body.closed_message.trim()
    ? body.closed_message.trim().slice(0, 500)
    : DEFAULT_CLOSED_MESSAGE;

  const allowAdminBypass = body.allow_admin_bypass === undefined
    ? true
    : Boolean(body.allow_admin_bypass);

  return {
    mode,
    open_at: openAt,
    close_at: closeAt,
    closed_message: closedMessage,
    allow_admin_bypass: allowAdminBypass,
  };
}

/**
 * Evaluate whether learners (or admins) are allowed to take/submit exams at `now`.
 */
export function evaluateExamWindow(settings = null, now = new Date(), { isAdmin = false } = {}) {
  const nowDate = now instanceof Date ? now : new Date(now);
  const nowMs = nowDate.getTime();
  const mode = settings?.mode || 'always_open';
  const openAt = parseOptionalDate(settings?.open_at);
  const closeAt = parseOptionalDate(settings?.close_at);
  const closedMessage = (settings?.closed_message && String(settings.closed_message).trim()) || DEFAULT_CLOSED_MESSAGE;
  const allowAdminBypass = settings?.allow_admin_bypass !== false;

  const base = {
    mode,
    open_at: openAt ? openAt.toISOString() : null,
    close_at: closeAt ? closeAt.toISOString() : null,
    closed_message: closedMessage,
    allow_admin_bypass: allowAdminBypass,
    server_now: nowDate.toISOString(),
  };

  let rawOpen = true;
  let status = 'always_open';
  let reason = 'เปิดให้ทำข้อสอบตามปกติ';

  if (mode === 'closed') {
    rawOpen = false;
    status = 'closed';
    reason = closedMessage;
  } else if (mode === 'scheduled') {
    if (openAt && nowMs < openAt.getTime()) {
      rawOpen = false;
      status = 'scheduled_waiting';
      reason = `ยังไม่ถึงเวลาเปิดสอบ (เปิดระบบวันที่ ${formatThaiDateTime(openAt)})`;
    } else if (closeAt && nowMs > closeAt.getTime()) {
      rawOpen = false;
      status = 'scheduled_ended';
      reason = `หมดเวลาทำข้อสอบแล้ว (ปิดระบบเมื่อ ${formatThaiDateTime(closeAt)})`;
    } else {
      rawOpen = true;
      status = 'scheduled_open';
      reason = closeAt
        ? `เปิดให้ทำข้อสอบจนถึง ${formatThaiDateTime(closeAt)}`
        : 'เปิดให้ทำข้อสอบตามกำหนดการ';
    }
  }

  const bypassedByAdmin = !rawOpen && isAdmin && allowAdminBypass;

  return {
    ...base,
    rawOpen,
    isOpen: rawOpen || bypassedByAdmin,
    bypassedByAdmin,
    status,
    reason,
    remainingMs: rawOpen && closeAt ? Math.max(0, closeAt.getTime() - nowMs) : null,
    opensInMs: status === 'scheduled_waiting' && openAt ? Math.max(0, openAt.getTime() - nowMs) : null,
  };
}
