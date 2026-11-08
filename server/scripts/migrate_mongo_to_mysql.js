import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'thai_assessment',
  multipleStatements: true
};

function formatDateForMySQL(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function escapeSqlString(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r') + "'";
}

async function runMigration() {
  console.log('🚀 Starting Data Migration: MongoDB -> MySQL');
  
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing in .env');
  }

  // 1. Connect to MongoDB
  console.log('📦 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB!');

  const db = mongoose.connection.db;

  // Read data
  console.log('📥 Reading all collections from MongoDB...');
  const mongoUsers = await db.collection('users').find().toArray();
  const mongoProgress = await db.collection('levelprogresses').find().toArray();
  const mongoScores = await db.collection('scorehistories').find().toArray();
  const mongoSurveys = await db.collection('surveyresponses').find().toArray();
  const mongoLogs = await db.collection('activitylogs').find().toArray();

  console.log(`Found:
  - Users: ${mongoUsers.length}
  - Level Progress: ${mongoProgress.length}
  - Score History: ${mongoScores.length}
  - Survey Responses: ${mongoSurveys.length}
  - Activity Logs: ${mongoLogs.length}`);

  // 2. Connect to MySQL (first without database to ensure database exists)
  console.log('🐬 Connecting to MySQL Server...');
  const initConn = await mysql.createConnection({
    host: MYSQL_CONFIG.host,
    port: MYSQL_CONFIG.port,
    user: MYSQL_CONFIG.user,
    password: MYSQL_CONFIG.password
  });
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await initConn.end();

  const myConn = await mysql.createConnection(MYSQL_CONFIG);
  console.log('✅ Connected to MySQL database:', MYSQL_CONFIG.database);

  // Read schema.sql
  const schemaSql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');

  // Disable FK checks and re-create tables cleanly
  console.log('🔨 Setting up MySQL tables...');
  await myConn.query('SET FOREIGN_KEY_CHECKS = 0;');
  await myConn.query('DROP TABLE IF EXISTS `activity_logs`;');
  await myConn.query('DROP TABLE IF EXISTS `survey_responses`;');
  await myConn.query('DROP TABLE IF EXISTS `score_history`;');
  await myConn.query('DROP TABLE IF EXISTS `level_progress`;');
  await myConn.query('DROP TABLE IF EXISTS `users`;');

  // Execute schema
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use') && !s.toLowerCase().startsWith('create database'));

  for (const stmt of statements) {
    await myConn.query(stmt);
  }
  await myConn.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('✅ MySQL schema applied successfully!');

  // SQL Dump statements list for offline .sql file
  const dumpStatements = [
    `-- Thai Assessment Complete Database Dump`,
    `CREATE DATABASE IF NOT EXISTS \`${MYSQL_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    `USE \`${MYSQL_CONFIG.database}\`;`,
    `SET FOREIGN_KEY_CHECKS = 0;`,
    schemaSql,
    `SET FOREIGN_KEY_CHECKS = 0;`
  ];

  // 3. Migrate Users
  console.log('👤 Migrating Users...');
  const userMap = new Set();
  const seenUsernames = new Set();
  for (const u of mongoUsers) {
    const userId = u._id.toString();
    userMap.add(userId);
    const createdAt = formatDateForMySQL(u.created_at) || formatDateForMySQL(new Date());
    const updatedAt = formatDateForMySQL(u.updated_at) || createdAt;

    let cleanUsername = (u.username || '').trim();
    if (!cleanUsername) cleanUsername = `user_${userId.slice(-6)}`;
    if (seenUsernames.has(cleanUsername)) {
      cleanUsername = `${cleanUsername}_${userId.slice(-4)}`;
    }
    seenUsernames.add(cleanUsername);

    await myConn.query(
      `INSERT INTO users (id, username, password, name, age, gender, address, status, education_level, employment_status, avatar, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        cleanUsername,
        u.password,
        u.name,
        u.age || null,
        u.gender || null,
        u.address || null,
        u.status || null,
        u.education_level || null,
        u.employment_status || null,
        u.avatar || null,
        u.role || 'user',
        createdAt,
        updatedAt
      ]
    );

    dumpStatements.push(
      `INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`name\`, \`age\`, \`gender\`, \`address\`, \`status\`, \`education_level\`, \`employment_status\`, \`avatar\`, \`role\`, \`created_at\`, \`updated_at\`) VALUES (${escapeSqlString(userId)}, ${escapeSqlString(cleanUsername)}, ${escapeSqlString(u.password)}, ${escapeSqlString(u.name)}, ${u.age || 'NULL'}, ${escapeSqlString(u.gender || null)}, ${escapeSqlString(u.address || null)}, ${escapeSqlString(u.status || null)}, ${escapeSqlString(u.education_level || null)}, ${escapeSqlString(u.employment_status || null)}, ${escapeSqlString(u.avatar || null)}, ${escapeSqlString(u.role || 'user')}, ${escapeSqlString(createdAt)}, ${escapeSqlString(updatedAt)});`
    );
  }
  console.log(`✅ Migrated ${mongoUsers.length} users.`);


  // 4. Migrate Level Progress
  console.log('📈 Migrating Level Progress...');
  let migratedProgressCount = 0;
  for (const p of mongoProgress) {
    const userId = p.user_id ? p.user_id.toString() : null;
    if (!userId || !userMap.has(userId)) continue; // skip if user doesn't exist

    const updatedAt = formatDateForMySQL(p.updated_at) || formatDateForMySQL(new Date());
    await myConn.query(
      `INSERT INTO level_progress (user_id, level1_passed, level2_passed, level3_passed, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE level1_passed = VALUES(level1_passed), level2_passed = VALUES(level2_passed), level3_passed = VALUES(level3_passed), updated_at = VALUES(updated_at)`,
      [
        userId,
        p.level1_passed ? 1 : 0,
        p.level2_passed ? 1 : 0,
        p.level3_passed ? 1 : 0,
        updatedAt
      ]
    );

    dumpStatements.push(
      `INSERT INTO \`level_progress\` (\`user_id\`, \`level1_passed\`, \`level2_passed\`, \`level3_passed\`, \`updated_at\`) VALUES (${escapeSqlString(userId)}, ${p.level1_passed ? 1 : 0}, ${p.level2_passed ? 1 : 0}, ${p.level3_passed ? 1 : 0}, ${escapeSqlString(updatedAt)});`
    );
    migratedProgressCount++;
  }
  console.log(`✅ Migrated ${migratedProgressCount} level progress records.`);

  // 5. Migrate Score History
  console.log('📊 Migrating Score History...');
  let migratedScoresCount = 0;
  for (const s of mongoScores) {
    const scoreId = s._id.toString();
    const userId = s.user_id ? s.user_id.toString() : null;
    if (!userId || !userMap.has(userId)) continue;

    const takenAt = formatDateForMySQL(s.taken_at) || formatDateForMySQL(new Date());
    const breakdownJson = s.breakdown ? JSON.stringify(s.breakdown) : null;
    const detailedResultsJson = s.detailed_results ? JSON.stringify(s.detailed_results) : null;

    await myConn.query(
      `INSERT INTO score_history (id, user_id, level, skill, score, max_score, taken_at, breakdown, detailed_results)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scoreId,
        userId,
        Number(s.level) || 1,
        s.skill || 'test',
        Number(s.score) || 0,
        Number(s.max_score) || 0,
        takenAt,
        breakdownJson,
        detailedResultsJson
      ]
    );

    dumpStatements.push(
      `INSERT INTO \`score_history\` (\`id\`, \`user_id\`, \`level\`, \`skill\`, \`score\`, \`max_score\`, \`taken_at\`, \`breakdown\`, \`detailed_results\`) VALUES (${escapeSqlString(scoreId)}, ${escapeSqlString(userId)}, ${Number(s.level) || 1}, ${escapeSqlString(s.skill || 'test')}, ${Number(s.score) || 0}, ${Number(s.max_score) || 0}, ${escapeSqlString(takenAt)}, ${escapeSqlString(breakdownJson)}, ${escapeSqlString(detailedResultsJson)});`
    );
    migratedScoresCount++;
  }
  console.log(`✅ Migrated ${migratedScoresCount} score histories.`);

  // 6. Migrate Survey Responses
  console.log('📝 Migrating Survey Responses...');
  let migratedSurveysCount = 0;
  for (const sr of mongoSurveys) {
    const surveyId = sr._id.toString();
    const userId = (sr.user_id && userMap.has(sr.user_id.toString())) ? sr.user_id.toString() : null;
    const submittedAt = formatDateForMySQL(sr.submitted_at) || formatDateForMySQL(new Date());

    await myConn.query(
      `INSERT INTO survey_responses (
        id, user_id, gender, age, status, education_level, employment_status, target_group,
        district, province, design_1, design_2, design_3, design_4,
        content_1, content_2, content_3, content_4,
        benefit_1, benefit_2, benefit_3, benefit_4,
        suggestions, submitted_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        surveyId,
        userId,
        sr.gender || null,
        sr.age ? String(sr.age) : null,
        sr.status || null,
        sr.education_level || null,
        sr.employment_status || null,
        sr.target_group || null,
        sr.district || null,
        sr.province || null,
        sr.design_1 != null ? Number(sr.design_1) : null,
        sr.design_2 != null ? Number(sr.design_2) : null,
        sr.design_3 != null ? Number(sr.design_3) : null,
        sr.design_4 != null ? Number(sr.design_4) : null,
        sr.content_1 != null ? Number(sr.content_1) : null,
        sr.content_2 != null ? Number(sr.content_2) : null,
        sr.content_3 != null ? Number(sr.content_3) : null,
        sr.content_4 != null ? Number(sr.content_4) : null,
        sr.benefit_1 != null ? Number(sr.benefit_1) : null,
        sr.benefit_2 != null ? Number(sr.benefit_2) : null,
        sr.benefit_3 != null ? Number(sr.benefit_3) : null,
        sr.benefit_4 != null ? Number(sr.benefit_4) : null,
        sr.suggestions || '',
        submittedAt
      ]
    );

    dumpStatements.push(
      `INSERT INTO \`survey_responses\` (\`id\`, \`user_id\`, \`gender\`, \`age\`, \`status\`, \`education_level\`, \`employment_status\`, \`target_group\`, \`district\`, \`province\`, \`design_1\`, \`design_2\`, \`design_3\`, \`design_4\`, \`content_1\`, \`content_2\`, \`content_3\`, \`content_4\`, \`benefit_1\`, \`benefit_2\`, \`benefit_3\`, \`benefit_4\`, \`suggestions\`, \`submitted_at\`) VALUES (${escapeSqlString(surveyId)}, ${escapeSqlString(userId)}, ${escapeSqlString(sr.gender || null)}, ${escapeSqlString(sr.age ? String(sr.age) : null)}, ${escapeSqlString(sr.status || null)}, ${escapeSqlString(sr.education_level || null)}, ${escapeSqlString(sr.employment_status || null)}, ${escapeSqlString(sr.target_group || null)}, ${escapeSqlString(sr.district || null)}, ${escapeSqlString(sr.province || null)}, ${sr.design_1 != null ? Number(sr.design_1) : 'NULL'}, ${sr.design_2 != null ? Number(sr.design_2) : 'NULL'}, ${sr.design_3 != null ? Number(sr.design_3) : 'NULL'}, ${sr.design_4 != null ? Number(sr.design_4) : 'NULL'}, ${sr.content_1 != null ? Number(sr.content_1) : 'NULL'}, ${sr.content_2 != null ? Number(sr.content_2) : 'NULL'}, ${sr.content_3 != null ? Number(sr.content_3) : 'NULL'}, ${sr.content_4 != null ? Number(sr.content_4) : 'NULL'}, ${sr.benefit_1 != null ? Number(sr.benefit_1) : 'NULL'}, ${sr.benefit_2 != null ? Number(sr.benefit_2) : 'NULL'}, ${sr.benefit_3 != null ? Number(sr.benefit_3) : 'NULL'}, ${sr.benefit_4 != null ? Number(sr.benefit_4) : 'NULL'}, ${escapeSqlString(sr.suggestions || '')}, ${escapeSqlString(submittedAt)});`
    );
    migratedSurveysCount++;
  }
  console.log(`✅ Migrated ${migratedSurveysCount} survey responses.`);

  // 7. Migrate Activity Logs
  console.log('📋 Migrating Activity Logs...');
  let migratedLogsCount = 0;
  for (const log of mongoLogs) {
    const createdAt = formatDateForMySQL(log.createdAt) || formatDateForMySQL(new Date());
    await myConn.query(
      `INSERT INTO activity_logs (action, details, user_id, created_at)
       VALUES (?, ?, ?, ?)`,
      [
        log.action,
        log.details,
        log.userId ? String(log.userId) : null,
        createdAt
      ]
    );
    migratedLogsCount++;
  }
  console.log(`✅ Migrated ${migratedLogsCount} activity logs.`);

  dumpStatements.push('SET FOREIGN_KEY_CHECKS = 1;');

  // 8. Write full SQL dump file
  const dumpFilePath = path.join(__dirname, '../thai_assessment_dump.sql');
  fs.writeFileSync(dumpFilePath, dumpStatements.join('\n\n'), 'utf-8');
  console.log(`💾 Generated standalone SQL dump file at: ${dumpFilePath}`);

  // Disconnect
  await myConn.end();
  await mongoose.disconnect();

  console.log('🎉 Migration completed successfully!');
}

runMigration().catch(err => {
  console.error('❌ Migration error:', err.code, err.message);
  if (err.sqlMessage) console.error('SQL Message:', err.sqlMessage);
  process.exit(1);
});

