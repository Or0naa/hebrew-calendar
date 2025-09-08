// src/components/MonthGrid.jsx
import React from "react";
import DayCell from "./DayCell";
import { HE_MONTHS } from "../utils/dates";
import { HDate, gematriya } from "@hebcal/core";


export default function MonthGrid({ year, monthIndex, parshaMap, shabbatMap, eventsMap, personalMap, onAddItem, onOpenAdd , }) {
    const first = new Date(year, monthIndex, 1);
    const gTitle = first.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
    const hTitle = (() => {
        const hd = new HDate(first);
        const m = HE_MONTHS[hd.getMonth()];
        const y = gematriya(hd.getFullYear(), { gershayim: true });
        return `${m} ה׳${y}`;
    })();

    const leading = first.getDay(); // 0..6 (א' = Sunday)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = leading + daysInMonth;
    const rows = Math.ceil(totalCells / 7);
    const trailing = rows * 7 - totalCells;

    const prevMonthLast = new Date(year, monthIndex, 0).getDate();

    const cells = [];
    for (let i = leading - 1; i >= 0; i--) {
        cells.push({ date: new Date(year, monthIndex - 1, prevMonthLast - i), other: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, monthIndex, d), other: false });
    }
    for (let i = 1; i <= trailing; i++) {
        cells.push({ date: new Date(year, monthIndex + 1, i), other: true });
    }

    const DOW = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "שבת"];

    return (
        <section className="month">
            <div className="month-header">
                {/* <div className="month-title">
                    <h1>{gTitle}</h1>
                    <div className="subtitle">{hTitle}</div>
                </div> */}
            </div>
            <div className="grid">
                {DOW.map((d) => (
                    <div key={d} className="dow">{d}</div>
                ))}
                {cells.map(({ date, other }, i) => (
                    <DayCell
                        key={i}
                        date={date}
                        other={other}
                        parshaMap={parshaMap}
                        shabbatMap={shabbatMap}
                        eventsMap={eventsMap}
                        personalMap={personalMap}
                        onAddItem={onAddItem}
                        onOpenAdd ={onOpenAdd }
                    />
                ))}
            </div>
            {/* <div className="page-hint">A4 landscape — כל חודש עמוד נפרד</div> */}
        </section>
    );
}
