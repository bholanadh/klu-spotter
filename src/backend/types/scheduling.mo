module {
  // Session identifier (e.g. "S1_2", "S3_4", "S5_6", "S7", "S8", "S9", "S8_9", "S10_11", "S12_13", "NONE")
  public type SessionId = Text;

  // Room occupancy status
  public type RoomStatus = { #EMPTY; #OCCUPIED };

  // Block classification
  public type Block = { #R_BLOCK; #C_BLOCK; #M_BLOCK };

  // A single class entry in the schedule seed data
  public type ScheduleEntry = {
    roomId    : Text;
    sessionId : SessionId;
    subject   : Text;
    // 0 = Sunday, 1 = Monday, … 6 = Saturday
    dayOfWeek : Nat;
    // "C1" | "C2" | "" (empty = applies to both clusters)
    cluster   : Text;
  };

  // A room record returned by getRooms()
  public type Room = {
    id             : Text;
    block          : Block;
    status         : RoomStatus;
    currentSession : SessionId;
    occupiedBy     : ?Text; // subject name if OCCUPIED, null if EMPTY
  };

  // Session info returned by getCurrentSession()
  public type SessionInfo = {
    sessionId    : SessionId;
    sessionLabel : Text;   // human-readable label e.g. "S1,2"
    startTime    : Text;   // e.g. "7:10 AM"
    endTime      : Text;   // e.g. "8:50 AM"
    isActive     : Bool;   // true if current time falls within this session window
  };
};
