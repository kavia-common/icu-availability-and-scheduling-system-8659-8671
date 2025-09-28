import React, { useEffect, useState } from "react";
import { Doctor, ICU, ScheduleEntry, TimeRange } from "../types/domain";
import { createBooking, listDoctors, listICUs, listSchedules, cancelSchedule } from "../services/api";

// PUBLIC_INTERFACE
export default function ScheduleICU() {
  /** Book ICU for a doctor with date and time; shows current schedules. */
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [icus, setICUs] = useState<ICU[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState("");
  const [icuId, setICUId] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [drRes, icuRes, scRes] = await Promise.all([listDoctors(), listICUs(), listSchedules()]);
      if (!mounted) return;
      if (drRes.ok && icuRes.ok && scRes.ok) {
        setDoctors(drRes.data || []);
        setICUs(icuRes.data || []);
        setSchedules(scRes.data || []);
      } else {
        setError(drRes.error || icuRes.error || scRes.error || "Failed to load data.");
      }
      setLoading(false);
    })();
    return () => { mounted = false; }
  }, []);

  const onBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!doctorId || !icuId) {
      setError("Please select both a doctor and ICU room.");
      return;
    }
    if (start >= end) {
      setError("End time must be later than start time.");
      return;
    }
    setSubmitting(true);
    const res = await createBooking({
      doctorId, icuId, date, time: { start, end } as TimeRange
    });
    if (res.ok && res.data) {
      setSchedules(prev => [res.data!, ...prev]);
    } else {
      setError(res.error || "Unable to create booking.");
    }
    setSubmitting(false);
  };

  const onCancel = async (id: string) => {
    const res = await cancelSchedule(id);
    if (res.ok) setSchedules(prev => prev.filter(s => s.id !== id));
    else setError(res.error || "Failed to cancel schedule.");
  }

  return (
    <div className="surface" style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Schedule ICU</h2>
      <p style={{ color: "var(--color-muted)", marginTop: 0, marginBottom: 16 }}>
        Create a booking by selecting a doctor, ICU room, date, and time.
      </p>

      <form onSubmit={onBook} className="grid grid-3" style={{ marginBottom: 16 }}>
        <div>
          <label style={label}>Doctor</label>
          <select className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Select...</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>ICU Room</label>
          <select className="select" value={icuId} onChange={(e) => setICUId(e.target.value)}>
            <option value="">Select...</option>
            {icus.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label style={label}>Start</label>
          <input className="input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label style={label}>End</label>
          <input className="input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Booking..." : "Book"}
          </button>
        </div>
      </form>

      {error && (
        <div className="surface" style={{ padding: 12, borderLeft: "4px solid var(--color-error)", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="surface" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(59,130,246,0.06)" }}>
            <tr>
              <th style={th}>Doctor</th>
              <th style={th}>ICU Room</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 12 }}>Loading...</td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 12, color: "var(--color-muted)" }}>No schedules yet.</td></tr>
            ) : (
              schedules.map(s => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={td}>{s.doctor.name}</td>
                  <td style={td}>{s.icu.name}</td>
                  <td style={td}>{s.date}</td>
                  <td style={td}>{s.time.start} - {s.time.end}</td>
                  <td style={td}><span style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: s.status === "confirmed" ? "rgba(16,185,129,.15)" : "rgba(107,114,128,.15)",
                    color: s.status === "confirmed" ? "#065F46" : "#374151",
                    fontWeight: 700,
                    fontSize: 12
                  }}>{s.status}</span></td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button className="btn" onClick={() => onCancel(s.id)} style={{ borderColor: "var(--color-border)" }}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" };
const th: React.CSSProperties = { textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: 12, fontSize: 14 };
