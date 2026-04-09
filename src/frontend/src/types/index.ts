// Room and scheduling types matching backend contracts

export type RoomStatus = "EMPTY" | "OCCUPIED";

export type Block = "R_BLOCK" | "C_BLOCK" | "M_BLOCK";

export interface Room {
  id: string;
  block: Block;
  status: RoomStatus;
  currentSession: string;
  occupiedBy?: string;
}

export interface SessionInfo {
  sessionId: string;
  sessionLabel: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export type ClusterType = "C1" | "C2";

export type SemesterType = "EVEN" | "ODD";

export interface RoomFilters {
  dayOfWeek: number;
  cluster: ClusterType;
  semester: SemesterType;
}

export interface BlockInfo {
  key: Block;
  label: string;
  shortLabel: string;
}

export const BLOCKS: BlockInfo[] = [
  { key: "R_BLOCK", label: "R-Block", shortLabel: "R" },
  { key: "C_BLOCK", label: "C-Block", shortLabel: "C" },
  { key: "M_BLOCK", label: "M-Block", shortLabel: "M" },
];

export const SESSION_TIMINGS: {
  id: string;
  label: string;
  start: string;
  end: string;
}[] = [
  { id: "S1_2", label: "S1-S2", start: "07:10", end: "08:50" },
  { id: "S3_4", label: "S3-S4", start: "09:20", end: "11:00" },
  { id: "S5_6", label: "S5-S6", start: "11:10", end: "12:50" },
  { id: "S7", label: "Lunch", start: "12:50", end: "13:50" },
  { id: "S8_9", label: "S8-S9", start: "13:50", end: "15:40" },
  { id: "S10_11", label: "S10-S11", start: "15:50", end: "17:30" },
  { id: "S12_13", label: "S12-S13", start: "17:40", end: "19:20" },
];
