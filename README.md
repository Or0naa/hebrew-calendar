# 📅 Hebrew/Gregorian Printable Calendar

פרויקט React להצגת לוח שנה עברי–לועזי עם אפשרות להדפסה מעוצבת.  
התצוגה משלבת:
- תאריכים עבריים ולועזיים.
- פרשות שבוע לפי שנה נבחרת.
- זמני שבתות (הדלקת נרות והבדלה).
- חגים ואירועים מה־Hebcal API.
- ✨ פריטים אישיים לכל יום (עד 4), כולל תמונות עם חיתוך והתאמה.

---

## 🚀 הרצה מקומית

```bash
# התקנת תלויות
npm install

# הפעלת שרת פיתוח
npm run dev

# בנייה להפקה
npm run build
```

הפרויקט רץ כברירת מחדל ב־http://localhost:5173 (או פורט אחר ש־Vite מגדיר).

---

## 📂 מבנה קבצים רלוונטיים

- **src/App.jsx**  
  נקודת הכניסה. מטעינה את הקומפוננטה הראשית `<PrintableCalendar />`.

- **src/components/PrintableCalendar.jsx**  
  מרנדר את הלוח כולו, כולל שליפה מה־services והצגת האירועים.

- **src/components/DayCell.jsx**  
  תא יומי בלוח.  
  כולל כפתור `+` להוספת פריט אישי (עד 4). אם הוספו 4, הכפתור נעלם.  
  פותח את ה־Modal לעריכת פריטים אישיים (תמונה, טקסט, חיתוך).

- **src/components/DayEditorModal.jsx**  
  מודאל המאפשר העלאה וחיתוך של תמונה, שמירה ומחיקה של פריטים אישיים.

- **src/utils/dates.js**  
  פונקציות עזר לעבודה עם תאריכים עבריים:
  - `toISO(date)` – מחזיר תאריך `YYYY-MM-DD` מקומי.
  - `hebrewDateString(date)` – מחזיר מחרוזת תאריך עברי (ללא שנה, למשל: `י״ד אלול`).
  - `hebrewDayNumber(date)` – מחזיר את מספר היום בחודש העברי.

- **src/services/hebcalService.js**  
  עטיפה ל־Hebcal API ו־@hebcal/core:
  - `getParshiotForYear(year)` – מחזיר Map של פרשות לשנה נתונה.
  - `getShabbatTimes(location, startISO, endISO)` – מחזיר זמני הדלקת נרות והבדלה לכל שבת.
  - `getHebcalEvents(startISO, endISO)` – מחזיר חגים ואירועים לפי טווח תאריכים.

- **src/index.css**  
  כולל עיצוב בסיסי ללוח ולהדפסה (A4 landscape).

---

## 🌐 APIs & ספריות

- [@hebcal/core](https://www.npmjs.com/package/@hebcal/core) – חישוב תאריכים עבריים, פרשות שבוע, המרות.
- [Hebcal JSON API](https://www.hebcal.com/home/219/hebcal-rest-api) – זמני שבתות, חגים ואירועים.
- React + Vite – בניית פרונט־אנד.

---

## 🖼️ פריטים אישיים

- אפשר להוסיף עד 4 פריטים לכל יום.  
- כל פריט יכול לכלול תמונה (כולל חיתוך והתאמה).  
- ניתן לערוך או למחוק פריטים קיימים.  
- הפריטים אינם חלק מההדפסה – הם מופיעים רק בשכבת ה־UI.

---

## 🖨️ הדפסה

הלוח מותאם להדפסה על דף **A4 לרוחב**.  
ה־CSS (`@page`) שולט על השוליים והפריסה.  


<img width="1784" height="807" alt="image" src="https://github.com/user-attachments/assets/07bda125-aee6-4c9c-b083-003313bbf269" />
