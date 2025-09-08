import { HebrewCalendar } from "@hebcal/core";

// למעלה בקובץ hebcalService.js:
function toLocalISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function timeHHMM(isoDateTime) {
    const dt = new Date(isoDateTime);
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}



// ✅ תיקון: הוספת export לפני כל פונקציה
export async function getParshiotForYear(year, { israel = true } = {}) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const events = HebrewCalendar.calendar({
        start,
        end,
        il: israel,
        sedrot: true,
        locale: "he",
    });

    const map = new Map();
    for (const ev of events) {
        const name = ev.render("he");
        if (name?.startsWith("פרשת ")) {
            const g = ev.getDate()?.greg();
            if (g) map.set(toISO(g), name);
        }
    }
    return map;
}

export async function getShabbatTimes({ latitude, longitude, tzid, b }, startISO, endISO) {
    // בתוך getShabbatTimes(...)
    const url = new URL("https://www.hebcal.com/hebcal");
    url.searchParams.set("v", "1");
    url.searchParams.set("cfg", "json");
    url.searchParams.set("start", startISO);
    url.searchParams.set("end", endISO);
    url.searchParams.set("lg", "he");          // בעברית
    url.searchParams.set("i", "on");           // לוח ארץ ישראל
    url.searchParams.set("c", "on");           // החזר זמני הדלקה/הבדלה
    url.searchParams.set("b", String(b || 18));// דקות לפני שקיעה
    // מיקום (ע"פ הדוקו של /hebcal "Specify the desired location"):
    url.searchParams.set("geo", "pos");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("tzid", tzid);
    // (אופציונלי) שיטת הבדלה - או M=on (ברירת מחדל) או m=50 וכד':
    // url.searchParams.set("M", "on"); // tzeit 8.5° (ברירת המחדל)
    // url.searchParams.set("m", "0");  // כדי לבטל חישוב הבדלה אם תרצי

    url.searchParams.set("maj", "on"); // חגים גדולים (כולל ראש השנה)
    url.searchParams.set("min", "on"); // חגים קטנים
    url.searchParams.set("mod", "on"); // מודרניים/מדינתיים
    url.searchParams.set("nx", "on"); // אירועים קרובים (למשל תוספות)


    const res = await fetch(url);
    if (!res.ok) throw new Error("Hebcal Shabbat API error");
    const json = await res.json();

    const map = new Map();
    for (const item of json.items || []) {
        const iso = (item.date || "").slice(0, 10);
        if (!map.has(iso)) map.set(iso, {});
        const rec = map.get(iso);
        if (item.category === "candles") {
            rec.candles = timeHHMM(item.date);
        } else if (item.category === "havdalah") {
            rec.havdalah = timeHHMM(item.date);
        }
    }
    return map;
}

export async function getHebcalEvents(startISO, endISO, { israel = true } = {}) {
    const url = new URL("https://www.hebcal.com/hebcal");
    url.searchParams.set("cfg", "json");
    url.searchParams.set("start", startISO);
    url.searchParams.set("end", endISO);
    url.searchParams.set("lg", "he");
    url.searchParams.set("i", israel ? "on" : "off");
    url.searchParams.set("c", "on");

    const res = await fetch(url);
    if (!res.ok) throw new Error("Hebcal Calendar API error");
    const json = await res.json();

    const map = new Map();
    for (const item of json.items || []) {
        const iso = (item.date || "").slice(0, 10);
        if (!iso) continue;
        const title = item.title || item.hebrew || "";
        if (!title) continue;
        // if (![
        //     "holiday", "roshchodesh", "fast", "modern", "special",
        //     "omer", "cholhamoed", "sigd", "selichot", "molad", "erev"
        // ].includes(item.category)) continue;
        if (!map.has(iso)) map.set(iso, []);
        map.get(iso).push(title);
    }
    return map;
}
