// src/components/DayCell.jsx
import React, { useState } from "react";
import { hebrewDateString, hebrewDayNumber, toISO } from "../utils/dates";
import DayEditorModal from "./DayEditorModal"; // קובץ חדש למודל (בהמשך)
import { useCalendarSession } from "../session/CalendarSessionContext";

export default function DayCell({ date, other, parshaMap, shabbatMap, eventsMap, personalMap, onAddItem, onOpenAdd }) {
    const iso = toISO(date);
    const personal = personalMap?.get(iso) || [];
    const cellYear = date.getFullYear();
    const withAge = personal.map(p => p.year ? { ...p, age: cellYear - p.year } : p);
    const count = Math.min(withAge.length, 4);
    const today = new Date();
    const isToday =
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate();

    const dow = date.getDay();
    const isShabbat = dow === 6;
    const { itemsByDate, setEditorTarget, openNew, openEdit } = useCalendarSession();

    const parsha = isShabbat ? (parshaMap.get(iso) || "") : "";
    const shab = shabbatMap.get(iso) || {}; // { candles?, havdalah? }
    const events = eventsMap?.get(iso) || []; // מערך מחרוזות אירוע
    const hasTags =
        Boolean(shab.candles || shab.havdalah || parsha || (events.length > 0) || personal.length > 0);

    const hasRoom = (itemsByDate.get(iso)?.length || 0) + (personal.length || 0) < 4;
    const sessionItems = itemsByDate.get(iso) || [];
     const totalCount = Math.min(personal.length + sessionItems.length, 4);

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
            {/* כפתור + לשכבת UI בלבד — לא מודפס */}
            {hasRoom && (
                <button
                    type="button"
                    className="print-hidden add-btn"
                    aria-label="הוספת פריט יומי"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditorTarget({ iso });
                    }}
                >
                    +
                </button>
            )}
            
        </div >
    );
}
