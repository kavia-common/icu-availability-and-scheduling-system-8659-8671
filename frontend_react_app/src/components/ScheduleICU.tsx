import React, { useEffect, useMemo, useState } from "react";
import { Doctor, ICU } from "../types/domain";
import { listDoctors, listICUs } from "../services/api";
import "./ScheduleICU.css";
import BookingModal, { BookingPayload } from "./BookingModal/BookingModal";

/**
 * PUBLIC_INTERFACE
 * ScheduleICU: Weekly calendar UI. Clicking a cell opens BookingModal with date/time prefilled.
 */
export default function ScheduleICU() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<ICU[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<{ date: string; start: string; end: string } | null>(null);

  // Load options from API hooks (mocked service)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [drRes, icuRes] = await Promise.all([listDoctors(), listICUs()]);
      if (!mounted) return;
      if (drRes.ok) setDoctors(drRes.data || []);
      if (icuRes.ok) setRooms(icuRes.data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Calendar: compute current week days (Mon-Sun) and time slots
  const now = new Date();
  const monday = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  }, [now]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [monday]);

  const hours = useMemo(() => {
    const list: string[] = [];
    for (let h = 7; h <= 19; h++) list.push(String(h).padStart(2, "0") + ":00");
    return list;
  }, []);

  const formatDate = (d: Date) => d.toISOString().slice(0,10);
  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(monday);
  }, [monday]);

  const handleCellClick = (d: Date, time: string) => {
    const date = formatDate(d);
    const start = time;
    const [hh, mm] = time.split(":");
    const endHour = String(Math.min(23, Number(hh) + 1)).padStart(2, "0");
    const end = `${endHour}:${mm}`;
    setSelected({ date, start, end });
    setModalOpen(true);
  };

  const onSave = (payload: BookingPayload) => {
    // Wire to API in future; for now just close the modal to confirm interaction wiring
    setModalOpen(false);
    console.log("Booking save requested", payload);
  };

  return (
    <section className="sched">
      <div className="sched__toolbar">
        <div className="sched__crumbs">
          <button className="link" type="button">Manage Availability</button>
          <span className="sep">›</span>
          <span className="active">Schedule ICU</span>
        </div>
        <div className="sched__controls">
          <button className="btn">{loading ? "Loading..." : "This Week"}</button>
        </div>
      </div>

      <div className="sched__header">
        <h2 className="sched__month">{monthLabel}</h2>
      </div>

      <div className="sched-grid" role="grid" aria-label="ICU weekly calendar">
        <div className="sched-grid__timehdr" />
        {days.map((d) => (
          <div key={d.toDateString()} className="sched-grid__dayhdr" role="columnheader" aria-label={d.toDateString()}>
            <div className="dw">{new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d)}</div>
            <div className="dn">{d.getDate()}</div>
          </div>
        ))}

        {hours.map((h) => (
          <React.Fragment key={h}>
            <div className="sched-grid__timecell" role="rowheader">{h}</div>
            {days.map((d) => (
              <button
                key={d.toDateString() + h}
                className="sched-grid__cell"
                role="gridcell"
                aria-label={`${d.toDateString()} at ${h}`}
                onClick={() => handleCellClick(d, h)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <BookingModal
        open={modalOpen}
        initial={selected || { date: new Date().toISOString().slice(0,10), start: "09:00", end: "10:00" }}
        doctors={doctors}
        rooms={rooms}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
      />
    </section>
  );
}
