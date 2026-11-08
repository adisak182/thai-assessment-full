import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatDateForMySQL(d) {
  if (!d) return 'NULL';
  const date = new Date(d);
  if (isNaN(date.getTime())) return 'NULL';
  return "'" + date.toISOString().slice(0, 19).replace('T', ' ') + "'";
}

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r') + "'";
}

async function exportDump() {
  const schemaSql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');
  const lines = [
    '-- Thai Assessment Database Dump (Admin only)',
    'CREATE DATABASE IF NOT EXISTS `thai_assessment` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    'USE `thai_assessment`;',
    'SET FOREIGN_KEY_CHECKS = 0;',
    schemaSql,
    'SET FOREIGN_KEY_CHECKS = 0;'
  ];

  // Users
  const [users] = await pool.query('SELECT * FROM users');
  for (const u of users) {
    lines.push(
      `INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`name\`, \`age\`, \`gender\`, \`address\`, \`status\`, \`education_level\`, \`employment_status\`, \`avatar\`, \`role\`, \`created_at\`, \`updated_at\`) VALUES (${escapeSql(u.id)}, ${escapeSql(u.username)}, ${escapeSql(u.password)}, ${escapeSql(u.name)}, ${u.age || 'NULL'}, ${escapeSql(u.gender)}, ${escapeSql(u.address)}, ${escapeSql(u.status)}, ${escapeSql(u.education_level)}, ${escapeSql(u.employment_status)}, ${escapeSql(u.avatar)}, ${escapeSql(u.role)}, ${formatDateForMySQL(u.created_at)}, ${formatDateForMySQL(u.updated_at)});`
    );
  }

  // Level Progress
  const [progress] = await pool.query('SELECT * FROM level_progress');
  for (const p of progress) {
    lines.push(
      `INSERT INTO \`level_progress\` (\`user_id\`, \`level1_passed\`, \`level2_passed\`, \`level3_passed\`, \`updated_at\`) VALUES (${escapeSql(p.user_id)}, ${p.level1_passed}, ${p.level2_passed}, ${p.level3_passed}, ${formatDateForMySQL(p.updated_at)});`
    );
  }

  // Score History
  const [scores] = await pool.query('SELECT * FROM score_history');
  for (const s of scores) {
    lines.push(
      `INSERT INTO \`score_history\` (\`id\`, \`user_id\`, \`level\`, \`skill\`, \`score\`, \`max_score\`, \`taken_at\`, \`breakdown\`, \`detailed_results\`) VALUES (${escapeSql(s.id)}, ${escapeSql(s.user_id)}, ${s.level}, ${escapeSql(s.skill)}, ${s.score}, ${s.max_score}, ${formatDateForMySQL(s.taken_at)}, ${escapeSql(typeof s.breakdown === 'object' ? JSON.stringify(s.breakdown) : s.breakdown)}, ${escapeSql(typeof s.detailed_results === 'object' ? JSON.stringify(s.detailed_results) : s.detailed_results)});`
    );
  }

  // Surveys
  const [surveys] = await pool.query('SELECT * FROM survey_responses');
  for (const sr of surveys) {
    lines.push(
      `INSERT INTO \`survey_responses\` (\`id\`, \`user_id\`, \`gender\`, \`age\`, \`status\`, \`education_level\`, \`employment_status\`, \`target_group\`, \`district\`, \`province\`, \`design_1\`, \`design_2\`, \`design_3\`, \`design_4\`, \`content_1\`, \`content_2\`, \`content_3\`, \`content_4\`, \`benefit_1\`, \`benefit_2\`, \`benefit_3\`, \`benefit_4\`, \`suggestions\`, \`submitted_at\`) VALUES (${escapeSql(sr.id)}, ${escapeSql(sr.user_id)}, ${escapeSql(sr.gender)}, ${escapeSql(sr.age)}, ${escapeSql(sr.status)}, ${escapeSql(sr.education_level)}, ${escapeSql(sr.employment_status)}, ${escapeSql(sr.target_group)}, ${escapeSql(sr.district)}, ${escapeSql(sr.province)}, ${sr.design_1 != null ? sr.design_1 : 'NULL'}, ${sr.design_2 != null ? sr.design_2 : 'NULL'}, ${sr.design_3 != null ? sr.design_3 : 'NULL'}, ${sr.design_4 != null ? sr.design_4 : 'NULL'}, ${sr.content_1 != null ? sr.content_1 : 'NULL'}, ${sr.content_2 != null ? sr.content_2 : 'NULL'}, ${sr.content_3 != null ? sr.content_3 : 'NULL'}, ${sr.content_4 != null ? sr.content_4 : 'NULL'}, ${sr.benefit_1 != null ? sr.benefit_1 : 'NULL'}, ${sr.benefit_2 != null ? sr.benefit_2 : 'NULL'}, ${sr.benefit_3 != null ? sr.benefit_3 : 'NULL'}, ${sr.benefit_4 != null ? sr.benefit_4 : 'NULL'}, ${escapeSql(sr.suggestions)}, ${formatDateForMySQL(sr.submitted_at)});`
    );
  }

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');

  const dumpPath = path.join(__dirname, '../thai_assessment_dump.sql');
  fs.writeFileSync(dumpPath, lines.join('\n\n'), 'utf-8');
  console.log('✅ Dump file exported to:', dumpPath);
  process.exit(0);
}

exportDump().catch(console.error);
