import React, { useEffect, useState } from "react";
import { ScheduleEntry } from "../types/domain";
import { cancelSchedule, listSchedules } from "../services/api";

interface ScheduleManagerProps {
  onBack: () => void;
}

// PUBLIC_INTERFACE
export default function ScheduleManager({ onBack }: ScheduleManagerProps) {
  /** Standalone schedule manager page with list and quick actions. */
  const [items, setItems] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await listSchedules();
      if (!mounted) return;
      if (res.ok) setItems(res.data || []);
      else setError(res.error || "Failed to load schedules.");
      setLoading(false);
    })();
    return () => { mounted = false; }
  }, []);

  const onCancel = async (id: string) => {
    const res = await cancelSchedule(id);
    if (res.ok) setItems(prev => prev.filter(s => s.id !== id));
    else setError(res.error || "Failed to cancel schedule.");
  }

  return (
    <div className="surface" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 6 }}>Schedule Manager</h2>
          <p style={{ color: "var(--color-muted)", marginTop: 0 }}>Review and manage all bookings.</p>
        </div>
        <button className="btn" onClick={onBack} style={{ borderColor: "var(--color-border)" }}>Back</button>
      </div>

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
              <th style={th}>ICU</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 12 }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 12, color: "var(--color-muted)" }}>No scheduled entries.</td></tr>
            ) : (
              items.map(s => (
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

const th: React.CSSProperties = { textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: 12, fontSize: 14 };
