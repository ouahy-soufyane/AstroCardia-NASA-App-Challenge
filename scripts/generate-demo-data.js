import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ExcelJS from 'exceljs';

const root = process.cwd();
const firstNames = ['Alex', 'Emily', 'David', 'Sarah', 'Michael', 'Lisa', 'Avery', 'Jordan', 'Riley', 'Parker'];
const lastNames = ['Morgan', 'Chen', 'Kim', 'Johnson', 'Brown', 'Garcia', 'Reyes', 'Petrov', 'Haddad', 'Dubois'];
const roles = ['Pilot', 'Engineer', 'Scientist', 'Flight Engineer', 'Mission Specialist'];
const missions = ['Ares Research Mission', 'Lunar Gateway Expedition', 'Orbital Science Mission'];
const round1 = n => Math.round(n * 10) / 10;

const astronauts = Array.from({ length: 100 }, (_, index) => {
  const band = index % 10;
  const status = band === 0 ? 'Critical' : band <= 2 ? 'Attention' : 'Healthy';
  const critical = status === 'Critical';
  const attention = status === 'Attention';
  return {
    id: `ASC-${String(index + 1).padStart(3, '0')}`,
    name: `${firstNames[index % 10]} ${lastNames[Math.floor(index / 10)]}`,
    role: roles[index % roles.length], mission: missions[index % missions.length], missionDay: 108 + (index * 7) % 130,
    healthScore: critical ? 22 + index % 25 : attention ? 52 + index % 24 : 78 + index % 22,
    healthStatus: status,
    weightKg: round1(55 + (index * 17) % 47), heightCm: 155 + (index * 11) % 42, diuresisMl24h: 650 + (index * 137) % 1700,
    breathingFrequency: critical ? 31 + index % 8 : attention ? 23 + index % 8 : 12 + (index * 3) % 10,
    heartRate: critical ? 122 + (index * 3) % 16 : attention ? 98 + (index * 5) % 19 : 62 + (index * 7) % 31,
    bodyTemperatureC: round1(critical ? 39 + (index % 7) / 10 : attention ? 37.9 + (index % 8) / 10 : 36.2 + (index % 12) / 10),
    oxygenSaturation: critical ? 82 + index % 8 : attention ? 90 + index % 5 : 96 + index % 4,
    systolicBloodPressure: critical ? 161 + index % 20 : attention ? 131 + index % 18 : 104 + (index * 3) % 25,
    diastolicBloodPressure: critical ? 101 + index % 14 : attention ? 85 + index % 13 : 62 + (index * 5) % 23,
  };
});

const jsonPath = path.join(root, 'src', 'data', 'astronauts.json');
const workbookPath = path.join(root, 'public', 'data', 'astrocardia-demo-astronauts.xlsx');
await mkdir(path.dirname(jsonPath), { recursive: true });
await mkdir(path.dirname(workbookPath), { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(astronauts, null, 2)}\n`, 'utf8');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Astrocardia demo';
workbook.subject = 'Fictional astronaut health monitoring data';
workbook.title = 'Astrocardia synthetic astronaut dataset';
const sheet = workbook.addWorksheet('Astronauts', { views: [{ state: 'frozen', ySplit: 1 }] });
const columns = [
  ['ID', 'id', 13], ['Name', 'name', 22], ['Role', 'role', 21], ['Mission', 'mission', 28], ['Mission day', 'missionDay', 13],
  ['Health score (demo)', 'healthScore', 18], ['Health status (demo)', 'healthStatus', 20], ['Weight (kg)', 'weightKg', 14],
  ['Height (cm)', 'heightCm', 14], ['Diuresis (mL / 24h)', 'diuresisMl24h', 21], ['Breathing frequency (/min)', 'breathingFrequency', 25],
  ['Heart rate (bpm)', 'heartRate', 18], ['Body temperature (°C)', 'bodyTemperatureC', 21], ['Blood oxygen (%)', 'oxygenSaturation', 18],
  ['Systolic pressure (mmHg)', 'systolicBloodPressure', 24], ['Diastolic pressure (mmHg)', 'diastolicBloodPressure', 25],
];
sheet.columns = columns.map(([header, key, width]) => ({ header, key, width }));
sheet.addRows(astronauts);
sheet.autoFilter = { from: 'A1', to: `P${astronauts.length + 1}` };
sheet.getRow(1).height = 28;
sheet.getRow(1).eachCell(cell => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D2A55' } }; });
sheet.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return;
  const status = row.getCell(7).value;
  const color = status === 'Healthy' ? 'FFE0F7ED' : status === 'Attention' ? 'FFFFF0D8' : 'FFFFE1E6';
  row.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
});
const about = workbook.addWorksheet('Read me');
about.columns = [{ header: 'Dataset notes', key: 'note', width: 110 }];
about.addRows([
  { note: 'Astrocardia is a frontend demonstration. This workbook contains 100 fictional, generated astronaut records.' },
  { note: 'No real people or real medical records are included. Values and labels are synthetic and are not clinically validated.' },
  { note: 'Health status labels are demonstration classes only. They are not diagnoses or medical standards.' },
  { note: 'This dataset contains no medication names, doses, or treatment recommendations.' },
  { note: 'The accompanying TensorFlow.js model is trained only to classify the synthetic GREEN / ORANGE / RED status labels.' },
]);
about.getRow(1).font = { bold: true };
await workbook.xlsx.writeFile(workbookPath);
console.log(`Generated ${astronauts.length} fictional astronaut records.`);
console.log(`JSON: ${path.relative(root, jsonPath)}`);
console.log(`Excel: ${path.relative(root, workbookPath)}`);
