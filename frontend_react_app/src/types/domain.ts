export type ID = string;

export interface Doctor {
  id: ID;
  name: string;
  specialty?: string;
}

export interface ICU {
  id: ID;
  name: string;
  location?: string;
  capacity?: number;
}

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface TimeRange {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface Availability {
  id: ID;
  entityType: "doctor" | "icu";
  entityId: ID;
  day: Weekday;
  range: TimeRange;
}

export interface BookingRequest {
  id: ID;
  doctorId: ID;
  icuId: ID;
  date: string; // YYYY-MM-DD
  time: TimeRange;
  notes?: string;
}

export interface ScheduleEntry {
  id: ID;
  doctor: Doctor;
  icu: ICU;
  date: string;
  time: TimeRange;
  status: "confirmed" | "pending" | "cancelled";
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
