import React, { useEffect, useMemo, useState } from "react";
import { Doctor, ICU } from "../types/domain";
import { createBooking, listDoctors, listICUs, listSchedules } from "../services/api";
import "./ScheduleICU.scss";
import BookingModal, { BookingPayload } from "./BookingModal/BookingModal";

/**
 * PUBLIC_INTERFACE
 * ScheduleICU: Weekly calendar UI. Clicking a cell opens BookingModal with date/time prefilled.
 * Booking marks are vertically aligned with their weekday headers using a shared column anchor.
 */
export default function ScheduleICU() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<ICU[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<{ date: string; start: string; end: string } | null>(null);

  // Track booked cells as a Set of "YYYY-MM-DD|HH:mm" keys
  const [bookedCells, setBookedCells] = useState<Set<string>>(new Set());

  // Load options and existing schedules (mock API)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [drRes, icuRes, schedRes] = await Promise.all([listDoctors(), listICUs(), listSchedules()]);
      if (!mounted) return;
      if (drRes.ok) setDoctors(drRes.data || []);
      if (icuRes.ok) setRooms(icuRes.data || []);
      if (schedRes.ok && schedRes.data) {
        const next = new Set<string>();
        schedRes.data.forEach((s) => {
          const k = `${s.date}|${s.time.start}`;
          next.add(k);
        });
        setBookedCells(next);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Calendar: compute current week days (Mon-Sun) and time slots
  const now = new Date();
  const monday = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
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

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);
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

  // PUBLIC_INTERFACE
  const onSave = async (payload: BookingPayload) => {
    const doctorId = payload.doctorId || (doctors[0]?.id ?? "");
    const icuId = payload.orId || (rooms[0]?.id ?? "");
    if (!doctorId || !icuId) {
      setModalOpen(false);
      return;
    }
    await createBooking({
      doctorId,
      icuId,
      date: payload.date,
      time: { start: payload.start, end: payload.end },
      notes: payload.notes,
    });

    setBookedCells((prev) => {
      const next = new Set(prev);
      next.add(`${payload.date}|${payload.start}`);
      return next;
    });

    setModalOpen(false);
  };

  const cellHasBooking = (date: string, time: string) => bookedCells.has(`${date}|${time}`);

  return (
    <section className="sched">
      <div className="sched__card surface">
        <div className="sched__toolbar">
          <div className="sched__crumbs">
            <button className="link" type="button">
              Manage Availability
            </button>
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

        {/* Grid container: first row is header; subsequent rows are time x day cells */}
        <div className="sched-grid" role="grid" aria-label="ICU weekly calendar">
          {/* Sticky header: time gutter spacer + 7 weekday headers with shared padding */}
          <div className="sched-grid__timehdr" />
          {days.map((d) => (
            <div
              key={d.toDateString()}
              className="sched-grid__dayhdr"
              role="columnheader"
              aria-label={d.toDateString()}
            >
              <span className="dw">{new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d)}</span>
              <span className="dn">{d.getDate()}</span>
            </div>
          ))}

          {/* Body rows: each row is [time gutter] + 7 day cells */}
          {hours.map((h, rowIdx) => (
            <React.Fragment key={h}>
              <div
                className={`sched-grid__timecell${rowIdx === 0 ? " sched-grid__timecell--first" : ""}`}
                role="rowheader"
              >
                {h}
              </div>

              {days.map((d) => {
                const date = formatDate(d);
                const booked = cellHasBooking(date, h);
                const firstRowClass = rowIdx === 0 ? " sched-grid__cell--first" : "";
                return (
                  <button
                    key={d.toDateString() + h}
                    className={`sched-grid__cell booking-anchor${firstRowClass}${booked ? " is-booked" : ""}`}
                    role="gridcell"
                    aria-label={`${d.toDateString()} at ${h}${booked ? " (has booking)" : ""}`}
                    onClick={() => handleCellClick(d, h)}
                  >
                    {booked && (
                      <span
                        className="booking-mark"
                        aria-hidden={false}
                        role="img"
                        title="Has booking"
                      />
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <BookingModal
        open={modalOpen}
        initial={selected || { date: new Date().toISOString().slice(0, 10), start: "09:00", end: "10:00" }}
        doctors={doctors}
        rooms={rooms}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
      />
    </section>
  );
}
