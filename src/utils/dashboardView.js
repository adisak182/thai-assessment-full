const percentage = attempt => attempt.score / (attempt.max_score || 100) * 100;
export function dashboardStatus(best, pending) {
  if (!best) return { label: pending ? 'รอเจ้าหน้าที่ตรวจ' : 'ยังไม่มีผลประเมิน', tone: pending ? 'amber' : 'neutral', grade: 'ยังไม่มีผลประเมิน', percentage: null };
  const value = percentage(best);
  return { label: value >= 70 ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่านเกณฑ์', tone: value >= 70 ? 'green' : 'rose', grade: value >= 80 ? 'ดีมาก' : value >= 60 ? 'ดี' : value >= 50 ? 'พอใช้' : 'ปรับปรุง', percentage: Math.round(value) };
}
export function filterDashboardHistory(history, filter, sort) {
  return history.filter(attempt => {
    if (filter === 'pending') return attempt.pending_count > 0;
    if (filter === 'passed') return !(attempt.pending_count > 0) && percentage(attempt) >= 70;
    if (filter === 'notPassed') return !(attempt.pending_count > 0) && percentage(attempt) < 70;
    return true;
  }).sort((a, b) => sort === 'highest' ? percentage(b) - percentage(a) : new Date(b.taken_at || 0) - new Date(a.taken_at || 0));
}
