const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่',
  'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช',
  'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร',
  'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน',
  'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร',
  'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

export const NARATHIWAT_DISTRICTS = [
  { name: 'เมืองนราธิวาส', aliases: ['เมืองนราธิวาส', 'เมืองนรา', 'เมือง'] },
  { name: 'ตากใบ', aliases: ['ตากใบ'] },
  { name: 'บาเจาะ', aliases: ['บาเจาะ'] },
  { name: 'ยี่งอ', aliases: ['ยี่งอ'] },
  { name: 'ระแงะ', aliases: ['ระแงะ'] },
  { name: 'รือเสาะ', aliases: ['รือเสาะ'] },
  { name: 'ศรีสาคร', aliases: ['ศรีสาคร'] },
  { name: 'แว้ง', aliases: ['แว้ง'] },
  { name: 'สุคิริน', aliases: ['สุคิริน'] },
  { name: 'สุไหงโก-ลก', aliases: ['สุไหงโก-ลก', 'สุไหงโกลก', 'โก-ลก', 'โกลก'] },
  { name: 'สุไหงปาดี', aliases: ['สุไหงปาดี'] },
  { name: 'จะแนะ', aliases: ['จะแนะ'] },
  { name: 'เจาะไอร้อง', aliases: ['เจาะไอร้อง'] }
];

export const NARATHIWAT_DISTRICT_NAMES = NARATHIWAT_DISTRICTS.map(d => d.name);

export function normalizeNarathiwatDistrict(name = '', province = '') {
  const cleaned = String(name || '').trim();
  if (!cleaned) return '';
  if (cleaned === 'เมือง' && (!province || province === 'นราธิวาส')) return 'เมืองนราธิวาส';
  for (const d of NARATHIWAT_DISTRICTS) {
    if (d.name === cleaned || d.aliases.includes(cleaned)) {
      if (cleaned === 'เมือง' && province && province !== 'นราธิวาส') return cleaned;
      return d.name;
    }
  }
  return cleaned;
}

const OTHER_SOUTHERN_DISTRICTS = [
  // ปัตตานี
  { name: 'เมืองปัตตานี', aliases: ['เมืองปัตตานี'], province: 'ปัตตานี' },
  { name: 'ยะรัง', aliases: ['ยะรัง'], province: 'ปัตตานี' },
  { name: 'สายบุรี', aliases: ['สายบุรี'], province: 'ปัตตานี' },
  { name: 'โคกโพธิ์', aliases: ['โคกโพธิ์'], province: 'ปัตตานี' },
  { name: 'หนองจิก', aliases: ['หนองจิก'], province: 'ปัตตานี' },
  { name: 'ปะนาเระ', aliases: ['ปะนาเระ'], province: 'ปัตตานี' },
  { name: 'มายอ', aliases: ['มายอ'], province: 'ปัตตานี' },
  { name: 'ทุ่งยางแดง', aliases: ['ทุ่งยางแดง'], province: 'ปัตตานี' },
  { name: 'ยะหริ่ง', aliases: ['ยะหริ่ง'], province: 'ปัตตานี' },
  { name: 'ไม้แก่น', aliases: ['ไม้แก่น'], province: 'ปัตตานี' },
  { name: 'กะพ้อ', aliases: ['กะพ้อ'], province: 'ปัตตานี' },
  { name: 'แม่ลาน', aliases: ['แม่ลาน'], province: 'ปัตตานี' },
  // ยะลา
  { name: 'เมืองยะลา', aliases: ['เมืองยะลา'], province: 'ยะลา' },
  { name: 'เบตง', aliases: ['เบตง'], province: 'ยะลา' },
  { name: 'บันนังสตา', aliases: ['บันนังสตา'], province: 'ยะลา' },
  { name: 'ธารโต', aliases: ['ธารโต'], province: 'ยะลา' },
  { name: 'ยะหา', aliases: ['ยะหา'], province: 'ยะลา' },
  { name: 'รามัน', aliases: ['รามัน'], province: 'ยะลา' },
  { name: 'กาบัง', aliases: ['กาบัง'], province: 'ยะลา' },
  { name: 'กรงปินัง', aliases: ['กรงปินัง'], province: 'ยะลา' },
  // สงขลา
  { name: 'หาดใหญ่', aliases: ['หาดใหญ่'], province: 'สงขลา' },
  { name: 'เมืองสงขลา', aliases: ['เมืองสงขลา'], province: 'สงขลา' },
  { name: 'สะเดา', aliases: ['สะเดา'], province: 'สงขลา' }
];

function cleanPrefix(str, type) {
  if (!str) return '';
  let s = String(str).trim();
  if (type === 'province') {
    s = s.replace(/^(?:จังหวัด|จ\.)\s*/, '').trim();
  } else if (type === 'district') {
    s = s.replace(/^(?:อำเภอ|อ\.)\s*/, '').trim();
  } else if (type === 'subdistrict') {
    s = s.replace(/^(?:ตำบล|ต\.|แขวง)\s*/, '').trim();
  }
  return s;
}

export function extractDistrictAndProvince(address = '', userDistrict = '', userProvince = '', survey = null, userSubdistrict = '') {
  let subdistrict = cleanPrefix(userSubdistrict || survey?.subdistrict || '', 'subdistrict');
  let district = cleanPrefix(userDistrict || survey?.district || '', 'district');
  let province = cleanPrefix(userProvince || survey?.province || '', 'province');

  const raw = String(address || '').trim();

  // If all three already provided explicitly, normalize and return
  if (subdistrict && district && province) {
    district = normalizeNarathiwatDistrict(district, province);
    return { subdistrict, district, province };
  }

  if (raw && raw !== '-') {
    // 0. Try to extract subdistrict if missing
    if (!subdistrict) {
      const subMatch = raw.match(/(?:ตำบล|ต\.|แขวง)\s*([ก-๙-]+)/);
      if (subMatch) {
        let candidate = subMatch[1].trim();
        candidate = candidate.replace(/\s*(?:อำเภอ|อ\.|จังหวัด|จ\.|เขต).*$/, '').trim();
        subdistrict = candidate;
      }
    }

    // 1. Try to extract province if missing
    if (!province) {
      const provMatch = raw.match(/(?:จังหวัด|จ\.)\s*([ก-๙]+)/);
      if (provMatch) {
        const candidate = provMatch[1].trim();
        const found = THAI_PROVINCES.find(p => candidate.startsWith(p) || p.startsWith(candidate));
        province = found || candidate;
      } else {
        const sortedProvinces = [...THAI_PROVINCES].sort((a, b) => b.length - a.length);
        for (const p of sortedProvinces) {
          if (raw.includes(p)) {
            province = p;
            break;
          }
        }
      }
    }

    // 2. Try to extract district if missing
    if (!district) {
      const distMatch = raw.match(/(?:อำเภอ|อ\.)\s*([ก-๙-]+)/);
      if (distMatch) {
        let candidate = distMatch[1].trim();
        // Remove trailing "จ." or "จังหวัด" if attached
        candidate = candidate.replace(/\s+(?:จังหวัด|จ\.).*$/, '').trim();
        // Remove known province name if concatenated (e.g. "เมืองนราธิวาส")
        district = candidate;
      }
    }

    // 3. Match Narathiwat districts if district still missing
    if (!district) {
      for (const d of NARATHIWAT_DISTRICTS) {
        for (const alias of d.aliases) {
          if (raw.includes(alias)) {
            district = d.name;
            if (!province) province = 'นราธิวาส';
            break;
          }
        }
        if (district) break;
      }
    }

    // 4. Match Other Southern districts if still missing
    if (!district) {
      for (const d of OTHER_SOUTHERN_DISTRICTS) {
        for (const alias of d.aliases) {
          if (raw.includes(alias)) {
            district = d.name;
            if (!province) province = d.province;
            break;
          }
        }
        if (district) break;
      }
    }
  }

  // Fallbacks from survey
  if (!subdistrict && survey?.subdistrict) subdistrict = cleanPrefix(survey.subdistrict, 'subdistrict');
  if (!district && survey?.district) district = cleanPrefix(survey.district, 'district');
  if (!province && survey?.province) province = cleanPrefix(survey.province, 'province');

  // Normalize district aliases (e.g., "เมือง" -> "เมืองนราธิวาส", "สุไหงโกลก" -> "สุไหงโก-ลก")
  if (district === 'เมือง' && province && province !== 'นราธิวาส') {
    district = `เมือง${province}`;
  } else if (district) {
    district = normalizeNarathiwatDistrict(district, province);
  }

  // If district is known Narathiwat district and province is missing, set to นราธิวาส
  if (district && !province) {
    const isNara = NARATHIWAT_DISTRICTS.some(d => d.name === district || d.aliases.includes(district));
    if (isNara) province = 'นราธิวาส';
  }

  return {
    subdistrict: subdistrict || '-',
    district: district || '-',
    province: province || '-'
  };
}

/**
 * Resolve normalized location fields for database updates, keeping explicit
 * fields if provided or falling back to extraction from raw address text.
 */
export function resolveLocationUpdates(body = {}) {
  const { address, subdistrict, district, province } = body;
  const updates = {};
  const hasExplicitLoc = ['subdistrict', 'district', 'province'].some(
    k => Object.prototype.hasOwnProperty.call(body, k)
  );
  if (hasExplicitLoc) {
    if (subdistrict !== undefined) updates.subdistrict = String(subdistrict || '').trim() || null;
    if (district !== undefined) updates.district = String(district || '').trim() || null;
    if (province !== undefined) updates.province = String(province || '').trim() || null;
  } else if (address !== undefined) {
    const extracted = extractDistrictAndProvince(address || '');
    updates.subdistrict = extracted.subdistrict !== '-' ? extracted.subdistrict : null;
    updates.district = extracted.district !== '-' ? extracted.district : null;
    updates.province = extracted.province !== '-' ? extracted.province : null;
  }
  return updates;
}

