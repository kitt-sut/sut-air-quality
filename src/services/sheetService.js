import Papa from 'papaparse';
import { SHEET_ID, PM25_COL_INDEX } from '../config';

/**
 * Fetch the latest PM2.5 reading from a specific Google Sheet tab (by gid).
 * PM2.5 value is expected at column index 4 (column E).
 *
 * @param {string} gid   - Sheet tab GID
 * @param {string} sensorId - Used for error logging only
 * @param {AbortSignal} signal - Used to cancel data retrieval
 * @returns {Promise<number>} PM2.5 value
 * @throws {Error} if no valid data is found or the request fails
 */
export const fetchPM25 = async (gid, sensorId, signal) => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

  // ส่ง signal เข้าไปใน fetch
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${sensorId}`);

  const csvText = await response.text();

  // 1. ใช้ PapaParse จัดการข้อความ CSV ทั้งก้อน
  const parsedData = Papa.parse(csvText, {
    skipEmptyLines: true, // ให้ข้ามบรรทัดที่ว่างเปล่าไปเลย
  });

  // 2. ข้อมูลที่ได้จะเป็น Array ของ Array (ตาราง)
  const rows = parsedData.data;

  // 3. นำ 10 แถวสุดท้ายมาตรวจสอบ (คล้ายโลจิกเดิมที่คุณทำไว้)
  const tail = rows.slice(-10).reverse();

  for (const cols of tail) {
    // ใช้ตัวแปร PM25_COL_INDEX
    if (cols.length > PM25_COL_INDEX) {
      const pm25 = parseFloat(cols[PM25_COL_INDEX]);
      if (!isNaN(pm25)) return pm25;
    }
  }

  throw new Error(`No valid PM2.5 data found for ${sensorId}`);
};