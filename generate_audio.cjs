const gTTS = require('gtts');
const path = require('path');
const fs = require('fs');

const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

const generate = (text, filename) => {
    return new Promise((resolve, reject) => {
        const gtts = new gTTS(text, 'th');
        const filepath = path.join(audioDir, filename);
        gtts.save(filepath, function (err, result) {
            if(err) { 
                console.error(`Error saving ${filename}:`, err);
                return reject(err); 
            }
            console.log("Success! saved " + filename);
            resolve();
        });
    });
};

const audioFiles = [
    {
        filename: "l3_listen_news.mp3",
        text: "กรมอุตุนิยมวิทยาออกประกาศเฝ้าระวังปรากฏการณ์ลานีญา ที่กำลังก่อตัวขึ้นในมหาสมุทรแปซิฟิก โดยคาดการณ์ว่าประเทศไทยจะเริ่มได้รับผลกระทบชัดเจนตั้งแต่เดือนสิงหาคมนี้เป็นต้นไป ส่งผลให้ปริมาณฝนสะสมทั่วประเทศสูงกว่าค่าเฉลี่ยปกติร้อยละ 10 ถึง 15 ดร.สมชาย ผู้เชี่ยวชาญด้านสภาพภูมิอากาศ ระบุว่าปรากฏการณ์นี้จะทำให้อุณหภูมิผิวน้ำทะเลบริเวณแปซิฟิกตะวันตกสูงขึ้น ส่งผลให้ความชื้นพัดเข้าสู่เอเชียตะวันออกเฉียงใต้มากขึ้น สิ่งที่น่ากังวลไม่ใช่แค่ปริมาณฝน แต่คือความถี่ของพายุหมุนเขตร้อนที่อาจเคลื่อนตัวเข้าสู่ไทยมากกว่าปีที่ผ่านมา ซึ่งอาจส่งผลกระทบต่อพื้นที่เกษตรกรรมในภาคกลางและภาคตะวันออกเฉียงเหนือ ทั้งนี้ รัฐบาลได้สั่งการให้หน่วยงานบริหารจัดการน้ำเร่งระบายน้ำในเขื่อนหลัก เพื่อเตรียมพื้นที่รองรับมวลน้ำใหม่ และขอให้ประชาชนติดตามข่าวสารอย่างใกล้ชิดเพื่อป้องกันความเสียหายที่อาจเกิดขึ้นกับทรัพย์สินและพืชผลทางการเกษตร"
    },
    {
        filename: "l3_listen_announcement.mp3",
        text: "ขอประกาศแจ้งเตือนพี่น้องชาวเกษตรกร เนื่องจากสัปดาห์หน้าจะมีมวลอากาศเย็นกำลังแรงแผ่ปกคลุมพื้นที่ ทำให้อุณหภูมิลดฮวบลง 3 ถึง 5 องศาเซลเซียส ขอให้ทุกท่านเร่งจัดทำแผงบังลมและเตรียมวัสดุคลุมดินเพื่อรักษาอุณหภูมิให้แก่พืชผัก รวมถึงดูแลสุขภาพของสัตว์เลี้ยงอย่างใกล้ชิดด้วยค่ะ"
    },
    {
        filename: "l3_listen_ad.mp3",
        text: "เบื่อไหม กับความจำที่ถดถอย ลืมกุญแจ ลืมนัด ลืมกระทั่งว่ากินข้าวหรือยัง บำรุงดี ผลิตภัณฑ์ใหม่ สารสกัดจากธรรมชาติ ที่ผ่านการวิจัยมาแล้วว่า ช่วยกระตุ้นการทำงานของเซลล์สมอง ให้คุณจดจำทุกรายละเอียดได้แม่นยำ เหมือนวัยหนุ่มสาว สั่งซื้อวันนี้ ลดทันที 50 เปอร์เซ็นต์"
    },
    { filename: "l3_listen_q10.mp3", text: "เรือคว่ำ ชามคว่ำ" },
    { filename: "l3_listen_q11.mp3", text: "แม่ค้าขายของและเด็กๆเล่นกัน" },
    { filename: "l3_listen_q12.mp3", text: "เรื่องนี้น่าขันจริงๆ ขันใบนี้ก็สวย" },
    { filename: "l3_listen_q13.mp3", text: "เรามาเล่นด้วยกัน เพื่อป้องกันอันตราย" },
    { filename: "l3_listen_q14.mp3", text: "เขากินมันทอดน้ำมันมะพร้าวอย่างเมามัน" },
    { filename: "l3_listen_q15.mp3", text: "ยายขายเนยที่ตลาด" }
];

const run = async () => {
    for (const file of audioFiles) {
        console.log(`Generating ${file.filename}...`);
        await generate(file.text, file.filename);
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("All audio files generated successfully.");
};

run().catch(console.error);
