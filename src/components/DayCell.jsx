// src/components/DayCell.jsx
import React from "react";
import { hebrewDateString, hebrewDayNumber, toISO } from "../utils/dates";

export default function DayCell({ date, other, parshaMap, shabbatMap, eventsMap, personalMap }) {
    const iso = toISO(date);
    const today = new Date();
    const isToday =
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate();

    const dow = date.getDay();
    const isShabbat = dow === 6;
    const personal = personalMap?.get(iso) || []; // [{title, image}]
    // גיל/שנות נישואין יחושבו לפי שנת התא המוצג
    const cellYear = date.getFullYear();
    const withAge = personal.map(p => {
        if (!p.year) return p;
        return { ...p, age: cellYear - p.year };
    });

    const count = Math.min(withAge.length, 4);



    const parsha = isShabbat ? (parshaMap.get(iso) || "") : "";
    const shab = shabbatMap.get(iso) || {}; // { candles?, havdalah? }
    const events = eventsMap?.get(iso) || []; // מערך מחרוזות אירוע
    const hasTags =
        Boolean(shab.candles || shab.havdalah || parsha || (events.length > 0) || personal.length > 0);

    return (
        <div className={`cell${other ? " other-month" : ""}${isToday ? " today" : ""}${isShabbat ? " shabbat" : ""}`}>
            <div className="date-nums">
                <div className="h-num" title={hebrewDateString(date)}>
                    {/* <span className="h-digit">{hebrewDayNumber(date)}</span> */}
                    <span className="h-word">{hebrewDateString(date)}</span>
                </div>
                <div className="g-num">{date.getDate()}</div>
            </div>

            {hasTags && (
                <div className="tags" style={{ zIndex: 999 }}>
                    {shab.candles && <span className="tag">הדלקת נרות {shab.candles}</span>}
                    {parsha && <span className="tag parsha">{parsha}</span>}
                    {shab.havdalah && <span className="tag">צאת שבת: {shab.havdalah}</span>}
                    {events.map((t, i) => (
                        <span key={i} className="tag">{t}</span>
                    ))}
                    {/* {personal.map((p, i) => (
                        <span key={`ps-${i}`} className="tag">{p.title}</span>
                    ))} */}
                </div>
            )}

            <div className={`notes n${count}`}>
                {withAge.slice(0, 4).map((p, i) => (
                    <div
                        key={`pf-${i}`}
                        className={`note-item${p.image ? ' has-image' : ''}`}
                        style={p.image ? { backgroundImage: `url(${p.image})` } : undefined}
                    >
                        <div className="overlay">
                            <div className="personal-title">
                                {p.title}{p.age != null && <span> - {p.age}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
