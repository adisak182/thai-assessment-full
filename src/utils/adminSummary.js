const percentage = attempt => attempt.score / (attempt.max_score || 100) * 100;
export function summarizeAttempts(attempts) {
  const reviewed = attempts.filter(a => !(a.pending_count > 0));
  return {
    total: attempts.length, reviewed: reviewed.length, pending: attempts.length - reviewed.length,
    passed: reviewed.filter(a => percentage(a) >= 70).length,
    average: reviewed.length ? Math.round(reviewed.reduce((sum,a) => sum + percentage(a),0) / reviewed.length) : null,
    best: reviewed.length ? Math.round(Math.max(...reviewed.map(percentage))) : null,
    latestFullTest: reviewed.filter(a => a.skill === 'full_test').sort((a,b) => new Date(b.taken_at) - new Date(a.taken_at))[0] || null,
  };
}
export function summarizeLearners(users) {
  const learners = users.filter(u => u.role !== 'admin');
  return {
    total: learners.length, literacy: learners.filter(u => u.is_literacy_learner).length,
    passed: learners.filter(u => u.full_test_passed).length,
    pendingAttempts: learners.reduce((sum,u) => sum + (u.full_test_pending || 0),0),
    pendingQuestions: learners.reduce((sum,u) => sum + (u.full_test_pending_questions || 0),0),
  };
}
export function filterUsers(users, {search='',status='all',enrollment='all',sort='newest'}={}) {
  const query = search.toLocaleLowerCase().trim();
  return users.filter(u => {
    if (query && ![u.name,u.username,u.address,u.status,u.education_level,u.employment_status].some(value => String(value || '').toLocaleLowerCase().includes(query))) return false;
    if (enrollment === 'literacy' && !u.is_literacy_learner) return false;
    if (enrollment === 'other' && u.is_literacy_learner) return false;
    if (status === 'passed') return Boolean(u.full_test_passed);
    if (status === 'notPassed') return Boolean(u.full_test_completed && !u.full_test_passed);
    if (status === 'pending') return u.full_test_pending > 0;
    if (status === 'notTested') return !u.full_test_completed && !u.full_test_pending;
    return true;
  }).sort((a,b) => sort === 'score' ? (b.full_test_completed ? b.full_test_score : -1) - (a.full_test_completed ? a.full_test_score : -1)
    : new Date((sort === 'latest' ? b.full_test_last_at : b.created_at) || 0) - new Date((sort === 'latest' ? a.full_test_last_at : a.created_at) || 0));
}
