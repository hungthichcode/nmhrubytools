export interface SheetRow {
  key: string;
  expiry: string;
  expired: string;
  user: string;
}

const SHEET_ID = '1HQLBTHR5u5xc3wzB_Dr-aNtOWy4fiQW8i7YS5rCnx4I';
const SHEET_NAME = 'keyadmin';

// Use Google Sheets CSV export (public read)
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  const lines = csv.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cols.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());
    rows.push(cols);
  }
  return rows;
}

export async function fetchSheetData(): Promise<SheetRow[]> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error('Không thể tải dữ liệu từ Google Sheets');
  const text = await res.text();
  const rows = parseCSV(text);
  // Skip header row (row 0 = A1,B1,C1,D1)
  const data: SheetRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    data.push({
      key: row[0] || '',
      expiry: row[1] || '',
      expired: row[2] || '',
      user: row[3] || '',
    });
  }
  return data;
}

export async function validateKey(inputKey: string): Promise<
  | { status: 'valid'; row: SheetRow }
  | { status: 'exploit'; key: string }
  | { status: 'invalid'; key: string }
> {
  const rows = await fetchSheetData();
  const found = rows.find((r) => r.key === inputKey);

  if (!found) {
    return { status: 'invalid', key: inputKey };
  }

  // Check if expiry or expired fields are empty (exploit attempt)
  if (!found.expiry || !found.expired) {
    return { status: 'exploit', key: inputKey };
  }

  return { status: 'valid', row: found };
}
