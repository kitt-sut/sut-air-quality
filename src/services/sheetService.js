import { SHEET_ID, PM25_COL_INDEX } from '../config';

// สร้าง base URL ครั้งเดียวตอน module โหลด ไม่สร้างซ้ำทุก call
const SHEET_BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;

/**
 * Fetch the latest PM2.5 reading from a specific Google Sheet tab (by gid)
 * using the Google Visualization API for optimized performance.
 *
 * @param {string} gid      - Sheet tab GID
 * @param {string} sensorId - Used for error logging only
 * @param {AbortSignal} signal - Used to cancel data retrieval
 * @returns {Promise<number>} PM2.5 value
 * @throws {Error} if no valid data is found or the request fails
 */
export const fetchPM25 = async (gid, sensorId, signal) => {
  const query = encodeURIComponent(
      'SELECT * WHERE E IS NOT NULL ORDER BY A DESC, B DESC LIMIT 1'
  );
  const url = `${SHEET_BASE_URL}?tqx=out:json&gid=${gid}&tq=${query}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${sensorId}`);

  const text = await response.text();

  const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON format for ${sensorId}: ${err.message}`);
  }

  if (!data || !data.table || !data.table.rows || data.table.rows.length === 0) {
    throw new Error(`Sheet is empty or no valid rows for ${sensorId}`);
  }

  const row = data.table.rows[0];

  if (row.c && row.c[PM25_COL_INDEX] !== null && row.c[PM25_COL_INDEX] !== undefined) {
    const pm25Value = row.c[PM25_COL_INDEX].v;
    if (typeof pm25Value === 'number' && !isNaN(pm25Value) && pm25Value >= 0) {
      return pm25Value;
    }
  }

  throw new Error(`No valid PM2.5 data found for ${sensorId}`);
};