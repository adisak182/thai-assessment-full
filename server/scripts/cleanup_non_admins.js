import pool from '../db.js';

async function cleanup() {
  console.log('🔍 Checking admin accounts...');
  const [admins] = await pool.query("SELECT id, username, name, role FROM users WHERE role = 'admin' OR LOWER(username) = 'admin'");
  console.log('Admins to KEEP:', admins);

  if (admins.length === 0) {
    console.error('❌ No admin account found! Aborting to prevent accidental total deletion.');
    process.exit(1);
  }

  const adminIds = admins.map(a => a.id);

  // Check counts before
  const [userCountBefore] = await pool.query('SELECT COUNT(*) as c FROM users');
  const [scoreCountBefore] = await pool.query('SELECT COUNT(*) as c FROM score_history');
  const [progressCountBefore] = await pool.query('SELECT COUNT(*) as c FROM level_progress');
  const [surveyCountBefore] = await pool.query('SELECT COUNT(*) as c FROM survey_responses');

  console.log('📊 Before deletion:');
  console.log(`- Users: ${userCountBefore[0].c}`);
  console.log(`- Scores: ${scoreCountBefore[0].c}`);
  console.log(`- Progress: ${progressCountBefore[0].c}`);
  console.log(`- Surveys: ${surveyCountBefore[0].c}`);

  // Delete non-admin scores & progress & surveys
  console.log('🗑️ Deleting data of non-admin users...');
  
  // 1. Score history of non-admin users
  const [deletedScores] = await pool.query('DELETE FROM score_history WHERE user_id NOT IN (?)', [adminIds]);
  console.log(`- Deleted scores: ${deletedScores.affectedRows}`);

  // 2. Level progress of non-admin users
  const [deletedProgress] = await pool.query('DELETE FROM level_progress WHERE user_id NOT IN (?)', [adminIds]);
  console.log(`- Deleted level progresses: ${deletedProgress.affectedRows}`);

  // 3. Survey responses of non-admin users (keep only admin surveys if any, or delete all non-admin)
  const [deletedSurveys] = await pool.query('DELETE FROM survey_responses WHERE user_id NOT IN (?) OR user_id IS NULL', [adminIds]);
  console.log(`- Deleted surveys: ${deletedSurveys.affectedRows}`);

  // 4. Users that are not admin
  const [deletedUsers] = await pool.query('DELETE FROM users WHERE id NOT IN (?)', [adminIds]);
  console.log(`- Deleted users: ${deletedUsers.affectedRows}`);

  // Check counts after
  const [userCountAfter] = await pool.query('SELECT COUNT(*) as c FROM users');
  const [remainingUsers] = await pool.query('SELECT id, username, name, role FROM users');
  const [scoreCountAfter] = await pool.query('SELECT COUNT(*) as c FROM score_history');
  const [progressCountAfter] = await pool.query('SELECT COUNT(*) as c FROM level_progress');
  const [surveyCountAfter] = await pool.query('SELECT COUNT(*) as c FROM survey_responses');

  console.log('\n✅ After deletion:');
  console.log(`- Remaining Users: ${userCountAfter[0].c}`);
  console.log(remainingUsers);
  console.log(`- Remaining Scores: ${scoreCountAfter[0].c}`);
  console.log(`- Remaining Progress: ${progressCountAfter[0].c}`);
  console.log(`- Remaining Surveys: ${surveyCountAfter[0].c}`);

  process.exit(0);
}

cleanup().catch(err => {
  console.error('❌ Error during cleanup:', err);
  process.exit(1);
});
