import { extractDistrictAndProvince } from './addressHelper.js';

export function csvCell(value, fallback = '') {
  const str = value === undefined || value === null || value === '' ? fallback : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function buildUserMap(users = []) {
  const map = new Map();
  for (const u of users || []) {
    const uid = u?.id || u?._id;
    if (uid) map.set(String(uid), u);
  }
  return map;
}

export function buildLatestSurveyMap(surveys = []) {
  const map = new Map();
  for (const s of surveys || []) {
    const uid = s?.user_id?._id || s?.user_id?.id || s?.user_id;
    if (!uid) continue;
    const key = String(uid);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, s);
      continue;
    }
    const existingTime = existing.submitted_at ? new Date(existing.submitted_at).getTime() : 0;
    const nextTime = s.submitted_at ? new Date(s.submitted_at).getTime() : 0;
    if (nextTime > existingTime) {
      map.set(key, s);
    }
  }
  return map;
}

export function buildHistoryCsv({ history = [], users = [], surveys = [], formatDate = (d) => String(d || '') }) {
  const headers = [
    'วันที่สอบ', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'อายุ', 'ตำบล', 'อำเภอ', 'จังหวัด', 'แบบทดสอบ',
    'คะแนนที่ได้', 'คะแนนเต็ม', 'ร้อยละ (%)', 'ผลการประเมิน', 'ระดับ',
    'การฟัง (25)', 'การพูด (15)', 'การอ่าน (30)', 'การเขียน (30)'
  ];

  const usersMap = buildUserMap(users);
  const surveyMap = buildLatestSurveyMap(surveys);

  const rows = (history || []).map(h => {
    const pct = Math.round((h.score / (h.max_score || 100)) * 100);
    const passed = pct >= 70 ? 'ผ่าน' : 'ไม่ผ่าน';
    let grade = 'ปรับปรุง';
    if (pct >= 80) grade = 'ดีมาก';
    else if (pct >= 60) grade = 'ดี';
    else if (pct >= 50) grade = 'พอใช้';

    const bd = h.breakdown || {};
    const lScore = bd.listening?.score ?? '-';
    const sScore = bd.speaking?.score ?? '-';
    const rScore = bd.reading?.score ?? '-';
    const wScore = bd.writing?.score ?? '-';

    const uid = h.user_id || h.user?.id || h.user?._id;
    const latestUser = uid ? usersMap.get(String(uid)) : null;
    const effectiveUser = latestUser ? { ...h.user, ...latestUser } : (h.user || {});
    const userSurvey = uid ? surveyMap.get(String(uid)) : null;

    const uName = effectiveUser?.name || '-';
    const uUsername = effectiveUser?.username || '-';
    const uAge = effectiveUser?.age || '-';
    const rawAddress = effectiveUser?.address || '';

    const explicitSubdistrict = latestUser?.subdistrict || userSurvey?.subdistrict || h.user?.subdistrict || '';
    const explicitDistrict = latestUser?.district || userSurvey?.district || h.user?.district || '';
    const explicitProvince = latestUser?.province || userSurvey?.province || h.user?.province || '';

    const { subdistrict, district, province } = extractDistrictAndProvince(
      rawAddress,
      explicitDistrict,
      explicitProvince,
      userSurvey,
      explicitSubdistrict
    );

    const skillName = h.skill === 'full_test' ? 'แบบทดสอบรวม 100 ข้อ' : h.skill;

    return [
      csvCell(formatDate(h.taken_at), '-'),
      csvCell(uName, '-'),
      csvCell(uUsername, '-'),
      uAge,
      csvCell(subdistrict, '-'),
      csvCell(district, '-'),
      csvCell(province, '-'),
      csvCell(skillName, '-'),
      h.score,
      h.max_score,
      `${pct}%`,
      passed,
      grade,
      lScore,
      sScore,
      rScore,
      wScore
    ];
  });

  return '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
}

export function buildSurveyCsv({ surveys = [], formatDate = (d) => String(d || '') }) {
  const headers = [
    'วันที่', 'เพศ', 'อายุ', 'สถานะ', 'ข้อมูลเพิ่มเติม', 'ตำบล', 'อำเภอ', 'จังหวัด',
    '1.1 แอปพลิเคชันมีเมนูการใช้งานที่ไม่ซับซ้อน เข้าถึงง่าย', '1.2 แอปพลิเคชันมีความน่าสนใจและทันสมัย', '1.3 ขนาดตัวอักษรมีความเหมาะสมชัดเจน', '1.4 ภาพประกอบมีความชัดเจนและสอดคล้องกับเนื้อหา',
    '2.1 เนื้อหามีความถูกต้องตามหลักภาษาไทย', '2.2 เนื้อหามีความเหมาะสมตามระดับการประเมิน', '2.3 การเรียงลำดับเนื้อหามีความเหมาะสมจากง่ายไปยาก', '2.4 เนื้อหามีความน่าสนใจและทันสมัย',
    '3.1 แอปพลิเคชันช่วยส่งเสริมความรู้ด้านภาษาไทย', '3.2 แอปพลิเคชันสามารถพัฒนาทักษะการใช้ภาษาไทยได้ดีขึ้น', '3.3 ผู้ใช้งานสามารถนำความรู้ไปประยุกต์ใช้ในชีวิตประจำวันได้', '3.4 ผู้ใช้งานเห็นคุณค่าและตระหนักถึงความสำคัญของภาษาไทย',
    'ข้อเสนอแนะ'
  ];

  const rows = (surveys || []).map(data => [
    csvCell(formatDate(data.submitted_at), '-'),
    csvCell(data.gender, '-'),
    csvCell(data.age, '-'),
    csvCell(data.status, '-'),
    csvCell(data.education_level || data.employment_status, '-'),
    csvCell(data.subdistrict, '-'),
    csvCell(data.district, '-'),
    csvCell(data.province, '-'),
    data.design_1 ?? '',
    data.design_2 ?? '',
    data.design_3 ?? '',
    data.design_4 ?? '',
    data.content_1 ?? '',
    data.content_2 ?? '',
    data.content_3 ?? '',
    data.content_4 ?? '',
    data.benefit_1 ?? '',
    data.benefit_2 ?? '',
    data.benefit_3 ?? '',
    data.benefit_4 ?? '',
    csvCell(data.suggestions || '', '')
  ]);

  return '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
}
