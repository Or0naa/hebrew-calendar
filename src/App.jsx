// src/App.jsx
import React from "react";
import PrintableCalendar from "./components/PrintableCalendar";
import { CalendarSessionProvider } from "./session/CalendarSessionContext";

export default function App() {
  React.useEffect(() => {
    const onBeforeUnload = (e) => {
      // אזהרת יציאה — שימי לב: חלק מהדפדפנים מתעלמים מטקסט מותאם.
      e.preventDefault();
      e.returnValue = "שימי לב: כל הפריטים שהוספת נשמרים רק לסשן הנוכחי. ריענון/סגירה ימחקו אותם.";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <CalendarSessionProvider>
      <PrintableCalendar />
    </CalendarSessionProvider>
  );
}
