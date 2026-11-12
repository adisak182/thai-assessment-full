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

export const NARATHIWAT_SUBDISTRICTS_BY_DISTRICT = {
  'เมืองนราธิวาส': ['บางนาค', 'ลำภู', 'มะนังตายอ', 'บางปอ', 'กะลุวอ', 'กะลุวอเหนือ', 'โคกเคียน'],
  'ตากใบ': ['เจ๊ะเห', 'เกาะสะท้อน', 'นานาค', 'บางขุนทอง', 'พร่อน', 'ศาลาใหม่', 'ไพรวัน', 'โฆษิต'],
  'บาเจาะ': ['บาเจาะ', 'ลุโบะสาวอ', 'กาเยาะมาตี', 'ปะลุกาสาเมาะ', 'บาเระเหนือ', 'บาเระใต้'],
  'ยี่งอ': ['ยี่งอ', 'ละหาร', 'จอเบาะ', 'ลุโบะบายะ', 'ลุโบะบือซา', 'ตะปอเยาะ'],
  'ระแงะ': ['ตันหยงมัส', 'ตันหยงลิมอ', 'บองอ', 'กาลิซา', 'เฉลิม', 'มะรือโบตก', 'บาโงสะโต'],
  'รือเสาะ': ['รือเสาะ', 'สาวอ', 'เรียง', 'สามัคคี', 'บาตง', 'ลาโละ', 'รือเสาะออก', 'โคกสะตอ', 'สุวารี'],
  'ศรีสาคร': ['ศรีสาคร', 'ซากอ', 'เชิงคีรี', 'ตะมะยูง', 'กาหลง', 'ศรีบรรพต'],
  'แว้ง': ['แว้ง', 'กายูคละ', 'ฆอเลาะ', 'โล๊ะจูด', 'แม่ดง', 'เอราวัณ'],
  'สุคิริน': ['สุคิริน', 'มาโมง', 'เกียร์', 'ภูเขาทอง', 'ร่มไทร'],
  'สุไหงโก-ลก': ['สุไหงโก-ลก', 'ปาเสมัส', 'ปูโยะ', 'มูโนะ'],
  'สุไหงปาดี': ['ปะลุรู', 'โต๊ะเด็ง', 'ริโก๋', 'สากอ', 'สุไหงปาดี', 'กาวะ'],
  'จะแนะ': ['จะแนะ', 'ช้างเผือก', 'ดุซงญอ', 'ผดุงมาตร'],
  'เจาะไอร้อง': ['จวบ', 'บูกิต', 'มะรือโบออก'],
};

export const NARATHIWAT_DISTRICTS = [
  { name: 'เมืองนราธิวาส', aliases: ['เมืองนราธิวาส', 'เมืองนรา', 'เมือง'] },
  { name: 'ตากใบ', aliases: ['ตากใบ', 'ตากไบ'] },
  { name: 'บาเจาะ', aliases: ['บาเจาะ'] },
  { name: 'ยี่งอ', aliases: ['ยี่งอ', 'ยิงอ'] },
  { name: 'ระแงะ', aliases: ['ระแงะ', 'ราแงะ'] },
  { name: 'รือเสาะ', aliases: ['รือเสาะ', 'รือเซาะ'] },
  { name: 'ศรีสาคร', aliases: ['ศรีสาคร', 'สีสาคร'] },
  { name: 'แว้ง', aliases: ['แว้ง'] },
  { name: 'สุคิริน', aliases: ['สุคิริน', 'สุคีริน'] },
  { name: 'สุไหงโก-ลก', aliases: ['สุไหงโก-ลก', 'สุไหงโกลก', 'โก-ลก', 'โกลก', 'สุไหงโก ลก'] },
  { name: 'สุไหงปาดี', aliases: ['สุไหงปาดี', 'สุไหงปาดิ'] },
  { name: 'จะแนะ', aliases: ['จะแนะ'] },
  { name: 'เจาะไอร้อง', aliases: ['เจาะไอร้อง', 'เจาะไอร้อน'] }
];

export const NARATHIWAT_DISTRICT_NAMES = NARATHIWAT_DISTRICTS.map(d => d.name);

const SUBDISTRICT_TO_DISTRICTS = new Map();
for (const [dist, subs] of Object.entries(NARATHIWAT_SUBDISTRICTS_BY_DISTRICT)) {
  for (const sub of subs) {
    if (!SUBDISTRICT_TO_DISTRICTS.has(sub)) SUBDISTRICT_TO_DISTRICTS.set(sub, []);
    SUBDISTRICT_TO_DISTRICTS.get(sub).push(dist);
  }
}

const SUBDISTRICT_TYPO_ALIASES = {
  'ปาโงสะโต': 'บาโงสะโต',
  'มะรือโบตะวันตก': 'มะรือโบตก',
  'สุไหงโกลก': 'สุไหงโก-ลก',
  'กะลูวอ': 'กะลุวอ',
  'กะลูวอเหนือ': 'กะลุวอเหนือ',
  'บานาค': 'บางนาค',
  'โคกเคียณ': 'โคกเคียน',
  'เจ๊ะเหม': 'เจ๊ะเห',
  'ตันหยงมัด': 'ตันหยงมัส',
  'ตันหยงลิม้อ': 'ตันหยงลิมอ',
  'ลุโบะซาวอ': 'ลุโบะสาวอ',
  'กาเยาะมาติ': 'กาเยาะมาตี',
  'ปะลุการาเมาะ': 'ปะลุกาสาเมาะ',
  'รือเซาะ': 'รือเสาะ',
  'โก-ลก': 'สุไหงโก-ลก',
  'โกลก': 'สุไหงโก-ลก',
  'ปาเสมัด': 'ปาเสมัส',
  'ปุโยะ': 'ปูโยะ',
  'มะรือโบตะวันออก': 'มะรือโบออก',
};

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
  let s = String(str).trim().replace(/\s+/g, ' ');
  if (type === 'province') {
    s = s.replace(/^(?:จังหวัด|จ\.)\s*/, '').trim();
  } else if (type === 'district') {
    s = s.replace(/^(?:อำเภอ|อ\.)\s*/, '').trim();
  } else if (type === 'subdistrict') {
    s = s.replace(/^(?:ตำบล|ต\.|แขวง)\s*/, '').trim();
  }
  return s;
}

function thaiSkeleton(str = '') {
  // Remove spaces, hyphens, and combining vowel/tone marks above/below characters
  return String(str)
    .replace(/[\s-]/g, '')
    .replace(/[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/g, '');
}

function levenshtein(a = '', b = '') {
  const s = String(a);
  const t = String(b);
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const dp = Array.from({ length: s.length + 1 }, () => new Array(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[s.length][t.length];
}

function findFuzzyMatch(rawInput, candidates = []) {
  const input = String(rawInput || '').trim();
  if (!input || input.length < 3 || !candidates.length) return null;

  const compactInput = input.replace(/[\s-]/g, '');
  const inputSkel = thaiSkeleton(input);

  // 1. Exact compact match
  for (const c of candidates) {
    if (c.replace(/[\s-]/g, '') === compactInput) {
      return { match: c, reason: 'alias', distance: 0 };
    }
  }

  // 2. Unique Thai consonant/base skeleton match (ignoring tone/above-below vowel typos)
  if (inputSkel.length >= 2) {
    const skelHits = candidates.filter(c => thaiSkeleton(c) === inputSkel);
    if (skelHits.length === 1) {
      return { match: skelHits[0], reason: 'skeleton', distance: 0.5 };
    }
  }

  // 3. Unique bounded Levenshtein match
  const maxAllowed = compactInput.length <= 5 ? 1 : 2;
  let best = null;
  let bestDist = Infinity;
  let tie = false;

  for (const c of candidates) {
    const dist = levenshtein(compactInput, c.replace(/[\s-]/g, ''));
    if (dist <= maxAllowed) {
      if (dist < bestDist) {
        bestDist = dist;
        best = c;
        tie = false;
      } else if (dist === bestDist && best !== c) {
        tie = true;
      }
    }
  }

  if (best && !tie) {
    return { match: best, reason: 'fuzzy', distance: bestDist };
  }
  return null;
}

export function isStandardNarathiwatDistrict(name = '') {
  const clean = cleanPrefix(name, 'district');
  return NARATHIWAT_DISTRICT_NAMES.includes(clean);
}

export function isStandardNarathiwatSubdistrict(name = '', district = '') {
  const cleanSub = cleanPrefix(name, 'subdistrict');
  const cleanDist = normalizeNarathiwatDistrict(cleanPrefix(district, 'district'));
  if (cleanDist && NARATHIWAT_SUBDISTRICTS_BY_DISTRICT[cleanDist]) {
    return NARATHIWAT_SUBDISTRICTS_BY_DISTRICT[cleanDist].includes(cleanSub);
  }
  return SUBDISTRICT_TO_DISTRICTS.has(cleanSub);
}

export function normalizeNarathiwatDistrict(name = '', province = '', { fuzzy = true } = {}) {
  const cleaned = cleanPrefix(name, 'district');
  if (!cleaned) return '';

  // Skip Narathiwat normalization if province is explicitly non-Narathiwat
  const cleanProv = cleanPrefix(province, 'province');
  if (cleanProv && cleanProv !== 'นราธิวาส' && cleanProv !== '-') {
    return cleaned === 'เมือง' ? `เมือง${cleanProv}` : cleaned;
  }

  // Exact match on non-Narathiwat southern districts first
  if (OTHER_SOUTHERN_DISTRICTS.some(d => d.name === cleaned || d.aliases.includes(cleaned))) {
    return cleaned;
  }

  if (cleaned === 'เมือง' && (!cleanProv || cleanProv === 'นราธิวาส')) return 'เมืองนราธิวาส';
  for (const d of NARATHIWAT_DISTRICTS) {
    if (d.name === cleaned || d.aliases.includes(cleaned)) {
      return d.name;
    }
  }

  if (fuzzy) {
    const fuzzyHit = findFuzzyMatch(cleaned, NARATHIWAT_DISTRICT_NAMES);
    if (fuzzyHit) return fuzzyHit.match;
  }

  return cleaned;
}

export function normalizeNarathiwatSubdistrict(name = '', district = '', province = '', { fuzzy = true } = {}) {
  const cleaned = cleanPrefix(name, 'subdistrict');
  if (!cleaned) return { subdistrict: '', inferredDistrict: '' };

  const cleanProv = cleanPrefix(province, 'province');
  if (cleanProv && cleanProv !== 'นราธิวาส' && cleanProv !== '-') {
    return { subdistrict: cleaned, inferredDistrict: '' };
  }

  const normalizedDist = district ? normalizeNarathiwatDistrict(district, province, { fuzzy }) : '';
  const aliasResolved = SUBDISTRICT_TYPO_ALIASES[cleaned] || SUBDISTRICT_TYPO_ALIASES[cleaned.replace(/\s+/g, '')] || cleaned;

  const districtSubs = normalizedDist && NARATHIWAT_SUBDISTRICTS_BY_DISTRICT[normalizedDist];
  if (districtSubs) {
    if (districtSubs.includes(aliasResolved)) {
      return { subdistrict: aliasResolved, inferredDistrict: normalizedDist };
    }
    if (fuzzy) {
      const hit = findFuzzyMatch(aliasResolved, districtSubs);
      if (hit) return { subdistrict: hit.match, inferredDistrict: normalizedDist };
    }
    return { subdistrict: aliasResolved, inferredDistrict: '' };
  }

  // No district context yet: check all official Narathiwat subdistricts
  if (SUBDISTRICT_TO_DISTRICTS.has(aliasResolved)) {
    const owners = SUBDISTRICT_TO_DISTRICTS.get(aliasResolved);
    return {
      subdistrict: aliasResolved,
      inferredDistrict: owners.length === 1 ? owners[0] : '',
    };
  }

  if (fuzzy) {
    const allSubs = Array.from(SUBDISTRICT_TO_DISTRICTS.keys());
    const hit = findFuzzyMatch(aliasResolved, allSubs);
    if (hit) {
      const owners = SUBDISTRICT_TO_DISTRICTS.get(hit.match) || [];
      return {
        subdistrict: hit.match,
        inferredDistrict: owners.length === 1 ? owners[0] : '',
      };
    }
  }

  return { subdistrict: aliasResolved, inferredDistrict: '' };
}

export function extractDistrictAndProvince(
  address = '',
  userDistrict = '',
  userProvince = '',
  survey = null,
  userSubdistrict = '',
  { fuzzy = true } = {}
) {
  let subdistrict = cleanPrefix(userSubdistrict || survey?.subdistrict || '', 'subdistrict');
  let district = cleanPrefix(userDistrict || survey?.district || '', 'district');
  let province = cleanPrefix(userProvince || survey?.province || '', 'province');

  const raw = String(address || '').trim();

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
        candidate = candidate.replace(/\s+(?:จังหวัด|จ\.).*$/, '').trim();
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

  if (fuzzy) {
    if (district) {
      district = normalizeNarathiwatDistrict(district, province, { fuzzy: true });
    }
    if (subdistrict) {
      const subRes = normalizeNarathiwatSubdistrict(subdistrict, district, province, { fuzzy: true });
      subdistrict = subRes.subdistrict;
      if (!district && subRes.inferredDistrict) {
        district = subRes.inferredDistrict;
      }
    }
  } else if (district === 'เมือง' && (!province || province === 'นราธิวาส')) {
    district = 'เมืองนราธิวาส';
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
 * Inspect raw DB user and survey records to find non-standard / potentially misspelled
 * district or subdistrict names and propose closest official Narathiwat matches.
 */
export function detectLocationAnomalies(users = [], surveys = []) {
  const bucketMap = new Map();

  const recordAnomaly = ({ field, rawValue, districtContext = '', source }) => {
    const cleaned = cleanPrefix(rawValue, field);
    if (!cleaned || cleaned === '-') return;

    if (field === 'district') {
      if (isStandardNarathiwatDistrict(cleaned)) return;
      if (OTHER_SOUTHERN_DISTRICTS.some(d => d.name === cleaned)) return;

      const suggested = normalizeNarathiwatDistrict(cleaned, '', { fuzzy: true });
      const suggestedStandard = isStandardNarathiwatDistrict(suggested) ? suggested : '';
      const key = `district::${cleaned}`;
      let item = bucketMap.get(key);
      if (!item) {
        item = {
          key,
          field: 'district',
          rawValue: cleaned,
          districtContext: '',
          userCount: 0,
          surveyCount: 0,
          totalCount: 0,
          suggestedValue: suggestedStandard,
          suggestedDistrict: suggestedStandard,
          hasHighConfidence: Boolean(suggestedStandard),
        };
        bucketMap.set(key, item);
      }
      if (source === 'user') item.userCount += 1;
      else item.surveyCount += 1;
      item.totalCount += 1;
    } else if (field === 'subdistrict') {
      const normDist = districtContext ? normalizeNarathiwatDistrict(districtContext, '', { fuzzy: true }) : '';
      const distValid = isStandardNarathiwatDistrict(normDist);

      if (distValid && isStandardNarathiwatSubdistrict(cleaned, normDist)) return;
      if (!distValid && isStandardNarathiwatSubdistrict(cleaned, '')) return;

      const subRes = normalizeNarathiwatSubdistrict(cleaned, normDist, '', { fuzzy: true });
      const suggestedValid = distValid
        ? isStandardNarathiwatSubdistrict(subRes.subdistrict, normDist)
        : isStandardNarathiwatSubdistrict(subRes.subdistrict, '');

      const suggestedValue = suggestedValid ? subRes.subdistrict : '';
      const key = `subdistrict::${normDist}::${cleaned}`;
      let item = bucketMap.get(key);
      if (!item) {
        item = {
          key,
          field: 'subdistrict',
          rawValue: cleaned,
          districtContext: distValid ? normDist : (cleanPrefix(districtContext, 'district') || ''),
          userCount: 0,
          surveyCount: 0,
          totalCount: 0,
          suggestedValue,
          suggestedDistrict: subRes.inferredDistrict || (distValid ? normDist : ''),
          hasHighConfidence: Boolean(suggestedValue),
        };
        bucketMap.set(key, item);
      }
      if (source === 'user') item.userCount += 1;
      else item.surveyCount += 1;
      item.totalCount += 1;
    }
  };

  for (const u of (users || [])) {
    if (u.role === 'admin') continue;
    const rawExtracted = extractDistrictAndProvince(u.address, u.district, u.province, null, u.subdistrict, { fuzzy: false });
    const rawDist = cleanPrefix(u.district || (rawExtracted.district !== '-' ? rawExtracted.district : ''), 'district');
    const rawSub = cleanPrefix(u.subdistrict || (rawExtracted.subdistrict !== '-' ? rawExtracted.subdistrict : ''), 'subdistrict');
    const rawProv = cleanPrefix(u.province || (rawExtracted.province !== '-' ? rawExtracted.province : ''), 'province');

    if (rawProv && rawProv !== 'นราธิวาส') continue;

    if (rawDist) recordAnomaly({ field: 'district', rawValue: rawDist, source: 'user' });
    if (rawSub) recordAnomaly({ field: 'subdistrict', rawValue: rawSub, districtContext: rawDist, source: 'user' });
  }

  for (const s of (surveys || [])) {
    const rawDist = cleanPrefix(s.district || '', 'district');
    const rawSub = cleanPrefix(s.subdistrict || '', 'subdistrict');
    const rawProv = cleanPrefix(s.province || '', 'province');

    if (rawProv && rawProv !== 'นราธิวาส') continue;

    if (rawDist) recordAnomaly({ field: 'district', rawValue: rawDist, source: 'survey' });
    if (rawSub) recordAnomaly({ field: 'subdistrict', rawValue: rawSub, districtContext: rawDist, source: 'survey' });
  }

  return Array.from(bucketMap.values()).sort((a, b) => {
    if (a.hasHighConfidence !== b.hasHighConfidence) return a.hasHighConfidence ? -1 : 1;
    return b.totalCount - a.totalCount;
  });
}

/**
 * Compute updated fields if a user or survey record matches a location normalization rule.
 * Returns null if no change applies, or an object of fields to update.
 */
export function buildNormalizedLocationPatch(
  record = {},
  { field, fromValue, toValue, districtFilter = '', targetDistrict = '', targetProvince = 'นราธิวาส', isUser = false }
) {
  const targetFrom = cleanPrefix(fromValue, field);
  const targetTo = cleanPrefix(toValue, field);
  if (!targetFrom || !targetTo) return null;

  const rawExtracted = isUser
    ? extractDistrictAndProvince(record.address, record.district, record.province, null, record.subdistrict, { fuzzy: false })
    : {
        subdistrict: cleanPrefix(record.subdistrict || '', 'subdistrict') || '-',
        district: cleanPrefix(record.district || '', 'district') || '-',
        province: cleanPrefix(record.province || '', 'province') || '-',
      };

  const currentDist = cleanPrefix(record.district || (rawExtracted.district !== '-' ? rawExtracted.district : ''), 'district');
  const currentSub = cleanPrefix(record.subdistrict || (rawExtracted.subdistrict !== '-' ? rawExtracted.subdistrict : ''), 'subdistrict');
  const currentVal = field === 'district' ? currentDist : currentSub;

  if (currentVal !== targetFrom) return null;

  if (field === 'subdistrict' && districtFilter) {
    const cleanFilter = cleanPrefix(districtFilter, 'district');
    const normalizedCurrentDist = normalizeNarathiwatDistrict(currentDist, '', { fuzzy: true });
    if (currentDist && currentDist !== cleanFilter && normalizedCurrentDist !== cleanFilter) {
      return null;
    }
  }

  const patch = { [field]: targetTo };
  if (field === 'subdistrict' && targetDistrict) {
    patch.district = cleanPrefix(targetDistrict, 'district');
  }
  const effectiveDist = patch.district || currentDist;
  if (targetProvince && isStandardNarathiwatDistrict(effectiveDist)) {
    patch.province = cleanPrefix(targetProvince, 'province');
  }
  return patch;
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
    const cleanProv = province !== undefined ? cleanPrefix(province, 'province') : '';
    const normDist = district !== undefined ? normalizeNarathiwatDistrict(cleanPrefix(district, 'district'), cleanProv) : '';
    const subRes = subdistrict !== undefined ? normalizeNarathiwatSubdistrict(cleanPrefix(subdistrict, 'subdistrict'), normDist, cleanProv) : null;

    if (subdistrict !== undefined) updates.subdistrict = subRes?.subdistrict || null;
    if (district !== undefined) updates.district = normDist || subRes?.inferredDistrict || null;
    if (province !== undefined) {
      updates.province = cleanProv || (isStandardNarathiwatDistrict(updates.district || normDist) ? 'นราธิวาส' : null);
    }
  } else if (address !== undefined) {
    const extracted = extractDistrictAndProvince(address || '');
    updates.subdistrict = extracted.subdistrict !== '-' ? extracted.subdistrict : null;
    updates.district = extracted.district !== '-' ? extracted.district : null;
    updates.province = extracted.province !== '-' ? extracted.province : null;
  }
  return updates;
}
