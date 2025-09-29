import { ApiResponse, Availability, BookingRequest, Doctor, ICU, ID, ScheduleEntry } from "../types/domain";

/**
 * NOTE: This file provides mock services used by other parts of the app
 * (e.g., ScheduleICU) until they are refactored to real backend endpoints.
 * The AvailabilityManager component no longer uses these mocks and instead
 * calls the backend directly via HTTP in its own module.
 */

// Simple in-memory mock DB (for non-refactored components only)
const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Alice Chen", specialty: "Cardiology" },
  { id: "d2", name: "Dr. Rafael Singh", specialty: "Neurology" },
];
const icus: ICU[] = [
  { id: "i1", name: "ICU Room A", location: "Floor 2", capacity: 2 },
  { id: "i2", name: "ICU Room B", location: "Floor 3", capacity: 1 },
];

let availabilities: Availability[] = [
  { id: "a1", entityType: "doctor", entityId: "d1", day: "Mon", range: { start: "09:00", end: "13:00" } },
  { id: "a2", entityType: "icu", entityId: "i1", day: "Mon", range: { start: "08:00", end: "16:00" } },
];

let schedules: ScheduleEntry[] = [];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const ok = <T,>(data: T): ApiResponse<T> => ({ ok: true, data });
const fail = <T,>(msg: string): ApiResponse<T> => ({ ok: false, error: msg });

// PUBLIC_INTERFACE
export async function listDoctors(): Promise<ApiResponse<Doctor[]>> {
  /** Returns all doctors. Mocked with in-memory data. */
  await delay(250);
  return ok(doctors);
}

// PUBLIC_INTERFACE
export async function listICUs(): Promise<ApiResponse<ICU[]>> {
  /** Returns all ICU rooms. Mocked with in-memory data. */
  await delay(250);
  return ok(icus);
}

// PUBLIC_INTERFACE
export async function listAvailabilities(entityType?: "doctor" | "icu", entityId?: ID): Promise<ApiResponse<Availability[]>> {
  /** Lists availabilities, optionally filtered by entity type and ID. */
  await delay(250);
  let data = [...availabilities];
  if (entityType) data = data.filter(a => a.entityType === entityType);
  if (entityId) data = data.filter(a => a.entityId === entityId);
  return ok(data);
}

// PUBLIC_INTERFACE
export async function createAvailability(payload: Omit<Availability, "id">): Promise<ApiResponse<Availability>> {
  /** Creates a new availability for a doctor or ICU. */
  await delay(300);
  const id = `a_${Date.now()}`;
  const record: Availability = { ...payload, id };
  availabilities.push(record);
  return ok(record);
}

// PUBLIC_INTERFACE
export async function deleteAvailability(id: ID): Promise<ApiResponse<boolean>> {
  /** Deletes an availability by ID. */
  await delay(250);
  const before = availabilities.length;
  availabilities = availabilities.filter(a => a.id !== id);
  return before !== availabilities.length ? ok(true) : fail("Availability not found");
}

// PUBLIC_INTERFACE
export async function createBooking(payload: Omit<BookingRequest, "id">): Promise<ApiResponse<ScheduleEntry>> {
  /** Creates a schedule booking and returns the schedule entry. */
  await delay(400);
  const doctor = doctors.find(d => d.id === payload.doctorId);
  const icu = icus.find(i => i.id === payload.icuId);
  if (!doctor || !icu) return fail("Invalid doctor or ICU ID");

  const entry: ScheduleEntry = {
    id: `s_${Date.now()}`,
    doctor,
    icu,
    date: payload.date,
    time: payload.time,
    status: "confirmed"
  };
  schedules.push(entry);
  return ok(entry);
}

// PUBLIC_INTERFACE
export async function listSchedules(): Promise<ApiResponse<ScheduleEntry[]>> {
  /** Lists all schedules (booked entries). */
  await delay(300);
  return ok([...schedules]);
}

// PUBLIC_INTERFACE
export async function cancelSchedule(id: ID): Promise<ApiResponse<boolean>> {
  /** Cancels (removes) a schedule entry by ID. */
  await delay(250);
  const before = schedules.length;
  schedules = schedules.filter(s => s.id !== id);
  return before !== schedules.length ? ok(true) : fail("Schedule not found");
}
