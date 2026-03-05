import { SHEET_ID } from "../config/locations";

function parseCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let char of row) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export async function fetchPM25(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

  const res = await fetch(url);
  const text = await res.text();

  const rows = text.split("\n").slice(-10).reverse();

  for (const row of rows) {
    const cols = parseCSVRow(row);

    if (cols[4]) {
      const val = parseFloat(cols[4]);
      if (!isNaN(val)) return val;
    }
  }

  return null;
}