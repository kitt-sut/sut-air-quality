import { SHEET_ID } from '../config';

/**
 * Parse a single CSV row, correctly handling quoted fields that contain commas.
 * e.g.  `"Mar 5, 2026",ESP32_01,room,25.3` → ['Mar 5, 2026', 'ESP32_01', 'room', '25.3']
 */
const parseCSVRow = (row) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (const ch of row) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

/**
 * Fetch the latest PM2.5 reading from a specific Google Sheet tab (by gid).
 * PM2.5 value is expected at column index 4 (column E).
 *
 * @param {string} gid   - Sheet tab GID
 * @param {string} sensorId - Used for error logging only
 * @returns {Promise<number>} PM2.5 value
 * @throws {Error} if no valid data is found or the request fails
 */
export const fetchPM25 = async (gid, sensorId) => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${sensorId}`);

  const csvText = await response.text();
  const rows = csvText.split('\n');

  // Only scan the last 10 rows (bottom-up) for efficiency
  const tail = rows.slice(-10).reverse();

  for (const rawRow of tail) {
    if (!rawRow.trim()) continue;
    const cols = parseCSVRow(rawRow);
    if (cols.length > 4) {
      const pm25 = parseFloat(cols[4]);
      if (!isNaN(pm25)) return pm25;
    }
  }

  throw new Error(`No valid PM2.5 data found for ${sensorId}`);
};
