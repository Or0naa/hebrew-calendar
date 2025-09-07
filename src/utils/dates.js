// src/utils/dates.js
import { HDate, gematriya } from "@hebcal/core";

export const HE_MONTHS = [
 ,"ניסן","אייר","סיוון","תמוז","אב","אלול", "תשרי","חשוון","כסלו","טבת","שבט","אדר","אדר ב׳"
];

// במקום toISOString() (UTC) – נשתמש בתאריך מקומי
export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function hebrewDateString(date) {
  const hd = new HDate(date);
  const dayHe = gematriya(hd.getDate(), { gershayim: true });
  const monthHe = HE_MONTHS[hd.getMonth()];
  const yearHe = gematriya(hd.getFullYear(), { gershayim: true });
  return `${dayHe} ${monthHe}`;
}

export function hebrewDayNumber(date) {
  const hd = new HDate(date);
  return hd.getDate(); // מספר יום בחודש העברי
}
