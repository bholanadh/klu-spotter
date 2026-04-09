import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SessionInfo {
    sessionLabel: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    sessionId: SessionId;
}
export type SessionId = string;
export interface Room {
    id: string;
    status: RoomStatus;
    occupiedBy?: string;
    currentSession: SessionId;
    block: Block;
}
export enum Block {
    C_BLOCK = "C_BLOCK",
    R_BLOCK = "R_BLOCK",
    M_BLOCK = "M_BLOCK"
}
export enum RoomStatus {
    OCCUPIED = "OCCUPIED",
    EMPTY = "EMPTY"
}
export interface backendInterface {
    getClusterHoliday(cluster: string, dayOfWeek: bigint): Promise<boolean>;
    getCurrentSession(): Promise<SessionInfo>;
    getRooms(): Promise<Array<Room>>;
    getRoomsForDay(dayOfWeek: bigint, cluster: string): Promise<Array<Room>>;
}
