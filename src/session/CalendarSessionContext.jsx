// src/session/CalendarSessionContext.jsx
// קונטקסט סשן: פריטים לפי תאריך (iso), פתיחת עורך פריט, מצבי תצוגה זמניים בלבד.
// הכל בזיכרון בלבד וללא השפעה על הפרינט.

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const CalendarSessionContext = createContext(null);

export function CalendarSessionProvider({ children }) {
    // itemsByDate: Map<isoDate, Array<{id, title, image, year, crop:{scale,xPercent,yPercent}}>>
    const [itemsByDate, setItemsByDate] = useState(new Map());

    // מצבי UI לסשן
    const [previewMode, setPreviewMode] = useState(false);
    const [showMonthHeader, setShowMonthHeader] = useState(true);
    const [calendarMode, setCalendarMode] = useState("greg"); // "greg" | "he"
    const [customCity, setCustomCity] = useState(null); // {lat,lng,b?}

    // ניהול "עורך פריט" (המודל) — בשלב זה רק פתיחה/סגירה + יעד
    const [editorTarget, setEditorTarget] = useState(null);
    // editorTarget: { iso, id? }  (אם יש id => עריכה, אחרת הוספה)

    const openNew = useCallback((iso) => setEditorTarget({ iso }), []);
    const openEdit = useCallback((iso, id) => setEditorTarget({ iso, id }), []);

    const addItem = useCallback((iso, item) => {
        setItemsByDate(prev => {
            const next = new Map(prev);
            const arr = next.get(iso)?.slice() || [];
            if (arr.length >= 4) return prev; // עד 4 פריטים
            const id = crypto.randomUUID();
            arr.push({
                id,
                title: "",
                image: null,
                year: null,
                crop: { scale: 1, xPercent: 50, yPercent: 50 },
                ...item
            });
            next.set(iso, arr);
            return next;
        });
    }, []);

    const updateItem = useCallback((iso, id, patch) => {
        setItemsByDate(prev => {
            const arr = prev.get(iso);
            if (!arr) return prev;
            const idx = arr.findIndex(x => x.id === id);
            if (idx === -1) return prev;
            const nextArr = arr.slice();
            nextArr[idx] = { ...nextArr[idx], ...patch };
            const next = new Map(prev);
            next.set(iso, nextArr);
            return next;
        });
    }, []);

    const deleteItem = useCallback((iso, id) => {
        setItemsByDate(prev => {
            const arr = prev.get(iso);
            if (!arr) return prev;
            const nextArr = arr.filter(x => x.id !== id);
            const next = new Map(prev);
            if (nextArr.length) next.set(iso, nextArr);
            else next.delete(iso);
            return next;
        });
    }, []);

    const setForDate = useCallback((iso, itemsArray) => {
        // משמש "דריסה" בעת העלאת JSON
        setItemsByDate(prev => {
            const next = new Map(prev);
            if (itemsArray?.length) next.set(iso, itemsArray.slice(0, 4));
            else next.delete(iso);
            return next;
        });
    }, []);

    const moveItem = useCallback((fromIso, toIso, id, toIndex = null) => {
        // העברה בין ימים (או שינוי סדר אם fromIso===toIso)
        setItemsByDate(prev => {
            const fromArr = prev.get(fromIso)?.slice() || [];
            const itemIdx = fromArr.findIndex(x => x.id === id);
            if (itemIdx === -1) return prev;
            const [moved] = fromArr.splice(itemIdx, 1);

            const next = new Map(prev);
            if (fromArr.length) next.set(fromIso, fromArr);
            else next.delete(fromIso);

            const toArr = next.get(toIso)?.slice() || [];
            if (toArr.length >= 4) return prev; // יעד מלא
            if (toIndex == null || toIndex < 0 || toIndex > toArr.length) toArr.push(moved);
            else toArr.splice(toIndex, 0, moved);
            next.set(toIso, toArr);

            return next;
        });
    }, []);

    const value = useMemo(() => ({
        itemsByDate,
        addItem, updateItem, deleteItem, setForDate, moveItem,
        editorTarget, setEditorTarget, openNew, openEdit,
        previewMode, setPreviewMode,
        showMonthHeader, setShowMonthHeader,
        calendarMode, setCalendarMode,
        customCity, setCustomCity,
    }), [
        itemsByDate, addItem, updateItem, deleteItem, setForDate, moveItem,
        editorTarget, previewMode, showMonthHeader, calendarMode, customCity
    ]);

    return (
        <CalendarSessionContext.Provider value={value}>
            {children}
        </CalendarSessionContext.Provider>
    );
}

export function useCalendarSession() {
    const ctx = useContext(CalendarSessionContext);
    if (!ctx) throw new Error("useCalendarSession must be used within CalendarSessionProvider");
    return ctx;
}
