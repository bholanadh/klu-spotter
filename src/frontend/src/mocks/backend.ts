import type { backendInterface, Room, SessionInfo } from "../backend";
import { Block, RoomStatus } from "../backend";

const sampleSession: SessionInfo = {
  sessionId: "S3",
  sessionLabel: "S3",
  startTime: "09:00",
  endTime: "09:50",
  isActive: true,
};

const sampleRooms: Room[] = [
  { id: "R101", status: RoomStatus.EMPTY, currentSession: "S3", block: Block.R_BLOCK },
  { id: "R102", status: RoomStatus.OCCUPIED, occupiedBy: "CSE-A", currentSession: "S3", block: Block.R_BLOCK },
  { id: "R103", status: RoomStatus.EMPTY, currentSession: "S3", block: Block.R_BLOCK },
  { id: "R104", status: RoomStatus.OCCUPIED, occupiedBy: "ECE-B", currentSession: "S3", block: Block.R_BLOCK },
  { id: "R201", status: RoomStatus.EMPTY, currentSession: "S3", block: Block.R_BLOCK },
  { id: "R202", status: RoomStatus.OCCUPIED, occupiedBy: "IT-A", currentSession: "S3", block: Block.R_BLOCK },
  { id: "C101", status: RoomStatus.EMPTY, currentSession: "S3", block: Block.C_BLOCK },
  { id: "C102", status: RoomStatus.OCCUPIED, occupiedBy: "MECH-A", currentSession: "S3", block: Block.C_BLOCK },
  { id: "C103", status: RoomStatus.EMPTY, currentSession: "S3", block: Block.C_BLOCK },
  { id: "C201", status: RoomStatus.OCCUPIED, occupiedBy: "CIVIL-B", currentSession: "S3", block: Block.C_BLOCK },
  { id: "M101", status: RoomStatus.EMPTY, currentSession: "S3", block: Block.M_BLOCK },
  { id: "M102", status: RoomStatus.OCCUPIED, occupiedBy: "MBA-A", currentSession: "S3", block: Block.M_BLOCK },
];

export const mockBackend: backendInterface = {
  getClusterHoliday: async (_cluster: string, _dayOfWeek: bigint) => false,
  getCurrentSession: async () => sampleSession,
  getRooms: async () => sampleRooms,
  getRoomsForDay: async (_dayOfWeek: bigint, _cluster: string) => sampleRooms,
};
