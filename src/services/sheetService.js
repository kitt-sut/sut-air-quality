import { SHEET_ID, PM25_COL_INDEX } from '../config';

/**
 * Fetch the latest PM2.5 reading from a specific Google Sheet tab (by gid)
 * using the Google Visualization API for optimized performance.
 *
 * @param {string} gid   - Sheet tab GID
 * @param {string} sensorId - Used for error logging only
 * @param {AbortSignal} signal - Used to cancel data retrieval
 * @returns {Promise<number>} PM2.5 value
 * @throws {Error} if no valid data is found or the request fails
 */
export const fetchPM25 = async (gid, sensorId, signal) => {
  // 1. สร้างคำสั่ง SQL Query:
  // - WHERE E IS NOT NULL: กรองเอาเฉพาะแถวที่คอลัมน์ E (PM2.5) มีข้อมูลเท่านั้น
  // - ORDER BY A DESC, B DESC: เรียงจากวันที่ (A) ล่าสุด และเวลา (B) ล่าสุด
  // - LIMIT 1: ดึงมาแค่แถวเดียว
  const query = encodeURIComponent("SELECT * WHERE E IS NOT NULL ORDER BY A DESC, B DESC LIMIT 1");

  // 2. ใช้ Endpoint ของ Google Visualization API
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}&tq=${query}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${sensorId}`);

  const text = await response.text();

  // 3. API จะส่งข้อความมาในรูปแบบฟังก์ชัน เราต้องตัดข้อความรอบนอกออกให้เหลือแค่ JSON ล้วนๆ
  const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);

  let data;

  // 4. ใช้ try...catch แค่สำหรับการดักจับ Error ตอนแปลง String เป็น JSON Object เท่านั้น
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON format for ${sensorId}: ${err.message}`);
  }

  // -----------------------------------------------------------------------------
  // ย้ายการเช็คเงื่อนไข (Validation) ออกมานอก try...catch เพื่อแก้ Warning ใน Editor
  // -----------------------------------------------------------------------------

  // 5. เช็คโครงสร้างของ JSON ว่ามีข้อมูลตาราง (table) และมีแถวข้อมูล (rows) ส่งกลับมาหรือไม่
  if (!data || !data.table || !data.table.rows || data.table.rows.length === 0) {
    throw new Error(`Sheet is empty or no valid rows for ${sensorId}`);
  }

  const row = data.table.rows[0];

  // 6. ดึงข้อมูลตาม Index ของคอลัมน์ PM2.5 (Index 4 คือคอลัมน์ E)
  // เช็คด้วยว่า row.c (คอลัมน์) มีอยู่จริง และข้อมูลในเซลล์นั้นต้องไม่เป็น null หรือ undefined
  if (row.c && row.c[PM25_COL_INDEX] !== null && row.c[PM25_COL_INDEX] !== undefined) {
    const pm25Value = row.c[PM25_COL_INDEX].v;

    // 7. ตรวจสอบความถูกต้องขั้นสุดท้าย: ข้อมูลต้องเป็นตัวเลข (number), ไม่ใช่ค่า NaN และไม่ติดลบ
    if (typeof pm25Value === 'number' && !isNaN(pm25Value) && pm25Value >= 0) {
      return pm25Value; // ถอดค่าสำเร็จ คืนค่าตัวเลขกลับไปให้หน้าเว็บ
    }
  }

  // 8. ถ้าโค้ดรันมาถึงตรงนี้ แสดงว่าข้อมูลมีปัญหา (เช่น เป็นตัวอักษรขยะ หรือค่าติดลบ)
  // ให้โยน Error ออกไป เพื่อให้หน้า UI (LocationCard) จับได้และแสดงหน้าต่าง "ไม่มีข้อมูล"
  throw new Error(`No valid PM2.5 data found for ${sensorId}`);
};