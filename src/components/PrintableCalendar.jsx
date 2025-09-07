// src/components/PrintableCalendar.jsx
import React, { useEffect, useMemo, useState } from "react";
import MonthGrid from "./MonthGrid";
import { getParshiotForYear, getShabbatTimes, getHebcalEvents } from "../services/hebcalService";
import specials from "../userSpecials.json";
import { HDate } from "@hebcal/core";
import { HE_MONTHS, toISO } from "../utils/dates";

const CITY_PRESETS = [
    { label: "יקיר (18)", latitude: 32.148783, longitude: 35.112666, tzid: "Asia/Jerusalem", b: 18 },
    { label: "ירושלים (40)", latitude: 31.778, longitude: 35.235, tzid: "Asia/Jerusalem", b: 40 },
    { label: "ת״א–יפו (18)", latitude: 32.08, longitude: 34.78, tzid: "Asia/Jerusalem", b: 18 },
    { label: "חיפה (30)", latitude: 32.815, longitude: 34.989, tzid: "Asia/Jerusalem", b: 30 },
    { label: "ב״ש (18)", latitude: 31.251, longitude: 34.791, tzid: "Asia/Jerusalem", b: 18 },

];

// עוזר: בדיקת התאמה לאדר בשנים מעוברות
function normalizeAdar(hMonthIndex, wantedHe, leapPolicy = "adar2") {
    // ב-HE_MONTHS שלך הסדר כולל "אדר", "אדר ב׳". צריך לבדוק מה hd.getMonth() מחזיר:
    // hd.getMonth() מחזיר 0..12 בסדר החודשים העברי; אצלך HE_MONTHS מגדיר גם "אדר ב׳".
    // כאן נבנה שם לפי האינדקס בפועל:
    const currentHe = HE_MONTHS[hMonthIndex];
    if (wantedHe === "אדר" && (currentHe === "אדר" || currentHe === "אדר ב׳")) {
        // אם השנה מעוברת, נבחר לפי מדיניות
        if (currentHe === "אדר ב׳" && leapPolicy === "adar2") return true;
        if (currentHe === "אדר" && leapPolicy === "adar1") return true;
        // אם לא מעוברת או לא צוין — נאפשר התאמה גמישה: 'אדר' יקלט גם באדר (לא ב׳)
        if (currentHe === "אדר" && !["adar1", "adar2"].includes(leapPolicy)) return true;
    }
    return currentHe === wantedHe;
}

function buildPersonalMap(rangeStart, rangeEnd) {
    const map = new Map();
    const oneDay = 24 * 60 * 60 * 1000;
    for (let t = rangeStart.getTime(); t <= rangeEnd.getTime(); t += oneDay) {
        const d = new Date(t);
        const hd = new HDate(d);
        const hDay = hd.getDate();
        const hMonthIdx = hd.getMonth(); // להשוואה מול HE_MONTHS
        for (const item of specials) {
            const { monthHe, day, title, image, leapPolicy, year } = item;
            const monthMatch = monthHe === "אדר"
                ? normalizeAdar(hMonthIdx, "אדר", leapPolicy)
                : (HE_MONTHS[hMonthIdx] === monthHe);
            if (monthMatch && hDay === day) {
                const iso = toISO(d);
                if (!map.has(iso)) map.set(iso, []);
                map.get(iso).push({ title, image, year });
            }
        }
    }
    return map;
}

export default function PrintableCalendar() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [city, setCity] = useState(CITY_PRESETS[0]);
    const [parshaMap, setParshaMap] = useState(new Map());
    const [shabbatMap, setShabbatMap] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [eventsMap, setEventsMap] = useState(new Map());
    const [personalMap, setPersonalMap] = useState(new Map());


    const rangeStart = useMemo(() => new Date(year, 8, 1), [year]);       // 1 Sep (השנה)
    const rangeEnd = useMemo(() => new Date(year + 1, 7, 31), [year]);  // 31 Aug (שנה הבאה)


    useEffect(() => {
        let canceled = false;
        (async () => {
            setLoading(true);
            try {
                const [p, s, e] = await Promise.all([
                    getParshiotForYear(year, { israel: true }),
                    getShabbatTimes(city, toISO(rangeStart), toISO(rangeEnd)),
                    getHebcalEvents(toISO(rangeStart), toISO(rangeEnd), { israel: true }),
                    setPersonalMap(buildPersonalMap(rangeStart, rangeEnd))
                ]);
                if (!canceled) {
                    setParshaMap(p);
                    setShabbatMap(s);
                    setEventsMap(e);
                }
            } finally {
                if (!canceled) setLoading(false);
            }
        })();
        return () => { canceled = true; };
    }, [year, city, rangeStart, rangeEnd]);

    return (
        <div dir="rtl" className="calendar-root">
            <div className="toolbar" aria-hidden>
                <div className="left">
                    <label>שנה:</label>
                    <input
                        type="number"
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value || year, 10))}
                    />
                    <label>עיר לזמני שבת:</label>
                    <select
                        value={city.label}
                        onChange={e => {
                            const found = CITY_PRESETS.find(c => c.label === e.target.value);
                            if (found) setCity(found);
                        }}
                    >
                        {CITY_PRESETS.map(c => (
                            <option key={c.label} value={c.label}>{c.label}</option>
                        ))}
                    </select>
                    <button onClick={() => window.print()}>הדפסה</button>
                </div>
                {loading && <div className="right">טוען פרשות/זמנים…</div>}
            </div>

            <div className="year-container">
                <div className="year-container">
                    {[8, 9, 10, 11].map(m => (
                        <MonthGrid key={`y${year}-m${m}`} year={year} monthIndex={m}
                            parshaMap={parshaMap}
                            shabbatMap={shabbatMap}
                            eventsMap={eventsMap}
                            personalMap={personalMap}
                        />
                    ))}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(m => (
                        <MonthGrid key={`y${year + 1}-m${m}`} year={year + 1} monthIndex={m}
                            parshaMap={parshaMap}
                            shabbatMap={shabbatMap}
                            eventsMap={eventsMap}
                            personalMap={personalMap}
                        />
                    ))}
                </div>

            </div>

        </div>
    );
}
