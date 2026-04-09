import Types "../types/scheduling";
import List "mo:core/List";
import Time "mo:core/Time";

module {

  // ──────────────────────────────────────────────────────────
  // Types re-exported for convenience
  // ──────────────────────────────────────────────────────────
  public type Room          = Types.Room;
  public type SessionInfo   = Types.SessionInfo;
  public type ScheduleEntry = Types.ScheduleEntry;
  public type SessionId     = Types.SessionId;

  // ──────────────────────────────────────────────────────────
  // Session windows (all times in minutes since midnight IST)
  // ──────────────────────────────────────────────────────────
  // S1,2:    7:10 – 8:50   (430 – 530)
  // S3,4:    9:20 – 11:00  (560 – 660)
  // S5,6:   11:10 – 12:50  (670 – 770)
  // S7:     12:50 – 13:50  (770 – 830)  lunch
  // S8:     13:50 – 14:40  (830 – 880)
  // S9:     14:50 – 15:40  (890 – 940)
  // S8_9:   13:50 – 15:40  (830 – 940)  double
  // S10,11: 15:50 – 17:30  (950 – 1050)
  // S12,13: 17:40 – 19:20  (1060 – 1160)

  type SessionWindow = {
    id           : SessionId;
    sessionLabel : Text;
    start        : Nat;   // inclusive, minutes since midnight
    end          : Nat;   // exclusive, minutes since midnight
    startTxt     : Text;
    endTxt       : Text;
  };

  // Note: S8_9 is a superset of S8+S9 – we handle it in occupancy lookup only,
  // NOT as an independent clock window (S8 and S9 cover those minutes separately).
  let sessionWindows : [SessionWindow] = [
    { id = "S1_2";   sessionLabel = "S1,2";       start = 430;  end = 530;  startTxt = "7:10 AM";  endTxt = "8:50 AM"  },
    { id = "S3_4";   sessionLabel = "S3,4";       start = 560;  end = 660;  startTxt = "9:20 AM";  endTxt = "11:00 AM" },
    { id = "S5_6";   sessionLabel = "S5,6";       start = 670;  end = 770;  startTxt = "11:10 AM"; endTxt = "12:50 PM" },
    { id = "S7";     sessionLabel = "S7 (Lunch)"; start = 770;  end = 830;  startTxt = "12:50 PM"; endTxt = "1:50 PM"  },
    { id = "S8";     sessionLabel = "S8";         start = 830;  end = 880;  startTxt = "1:50 PM";  endTxt = "2:40 PM"  },
    { id = "S9";     sessionLabel = "S9";         start = 890;  end = 940;  startTxt = "2:50 PM";  endTxt = "3:40 PM"  },
    { id = "S10_11"; sessionLabel = "S10,11";     start = 950;  end = 1050; startTxt = "3:50 PM";  endTxt = "5:30 PM"  },
    { id = "S12_13"; sessionLabel = "S12,13";     start = 1060; end = 1160; startTxt = "5:40 PM";  endTxt = "7:20 PM"  },
  ];

  // ──────────────────────────────────────────────────────────
  // Helper: current IST minute-of-day and day-of-week
  // ──────────────────────────────────────────────────────────

  /// IST = UTC + 5h30m = UTC + 330 minutes.
  /// Time.now() returns Int nanoseconds.
  func istMinuteOfDay() : Nat {
    let nowNs : Int = Time.now();
    let nowSec : Int = nowNs / 1_000_000_000;
    let istSec : Int = nowSec + 330 * 60;          // shift to IST
    let secInDay : Int = istSec % 86400;
    let secInDayNat : Nat = if (secInDay < 0) {
      (secInDay + 86400).toNat()
    } else {
      secInDay.toNat()
    };
    secInDayNat / 60
  };

  /// Returns 0=Sunday … 6=Saturday for IST wall-clock day.
  func istDayOfWeek() : Nat {
    let nowNs : Int = Time.now();
    let nowSec : Int = nowNs / 1_000_000_000;
    let istSec : Int = nowSec + 330 * 60;
    // Unix epoch 1970-01-01 was a Thursday → day index 4
    let daysSinceEpoch : Nat = (istSec / 86400).toNat();
    (daysSinceEpoch + 4) % 7  // 0=Sun, 1=Mon, …, 6=Sat
  };

  // ──────────────────────────────────────────────────────────
  // Session logic
  // ──────────────────────────────────────────────────────────

  /// Return the current IST session based on the canister clock (UTC + 5:30).
  public func getCurrentSession(_schedules : List.List<ScheduleEntry>) : SessionInfo {
    let minute = istMinuteOfDay();
    let found = sessionWindows.find(
      func(w : SessionWindow) : Bool { minute >= w.start and minute < w.end }
    );
    switch (found) {
      case (?w) {
        {
          sessionId    = w.id;
          sessionLabel = w.sessionLabel;
          startTime    = w.startTxt;
          endTime      = w.endTxt;
          isActive     = true;
        }
      };
      case null {
        {
          sessionId    = "NONE";
          sessionLabel = "No Active Session";
          startTime    = "";
          endTime      = "";
          isActive     = false;
        }
      };
    }
  };

  // ──────────────────────────────────────────────────────────
  // Room catalogue — all known rooms with their blocks
  // ──────────────────────────────────────────────────────────

  type RoomCatalogue = { id : Text; block : Types.Block };

  let roomCatalogue : [RoomCatalogue] = [
    { id = "R206A"; block = #R_BLOCK },
    { id = "R207";  block = #R_BLOCK },
    { id = "R208";  block = #R_BLOCK },
    { id = "C207";  block = #C_BLOCK },
    { id = "C208";  block = #C_BLOCK },
    { id = "C301";  block = #C_BLOCK },
    { id = "M101";  block = #M_BLOCK },
    { id = "M102";  block = #M_BLOCK },
    { id = "M201";  block = #M_BLOCK },
  ];

  // ──────────────────────────────────────────────────────────
  // Room logic
  // ──────────────────────────────────────────────────────────

  /// Return all rooms with occupancy status for the current session,
  /// respecting cluster holiday rules via dayOfWeek + cluster filtering.
  /// Cluster is embedded in the ScheduleEntry via a "cluster" field — we
  /// match entries where entry.sessionId == currentSessionId AND
  /// entry.dayOfWeek == todayDow.
  /// The public API overload (mixin) passes dayOfWeek and cluster from the
  /// frontend so the frontend can query any day/cluster combination.
  public func getRoomsForDay(
    schedules : List.List<ScheduleEntry>,
    dayOfWeek : Nat,
    cluster   : Text,
  ) : [Room] {
    let sessionInfo = getCurrentSession(schedules);
    let curSession  = sessionInfo.sessionId;

    // On a cluster holiday, every room is empty
    if (getClusterHoliday(cluster, dayOfWeek)) {
      return roomCatalogue.map(
        func(r : RoomCatalogue) : Room {{
          id             = r.id;
          block          = r.block;
          status         = #EMPTY;
          currentSession = curSession;
          occupiedBy     = null;
        }}
      );
    };

    // Build a map of roomId → subject for this (day, session, cluster)
    // A schedule entry matches if:
    //   - dayOfWeek matches
    //   - cluster matches (empty string = any cluster)
    //   - sessionId matches current session OR the entry covers a double session
    //     that overlaps the current session window
    func sessionMatches(entrySession : SessionId) : Bool {
      if (entrySession == curSession) return true;
      // Double session S8_9 covers both S8 and S9 clock windows
      if (entrySession == "S8_9" and (curSession == "S8" or curSession == "S9")) return true;
      false
    };

    // Collect all occupied rooms for this slot
    let occupied = schedules.filter(
      func(e : ScheduleEntry) : Bool {
        e.dayOfWeek == dayOfWeek
        and sessionMatches(e.sessionId)
        and (cluster == "" or e.cluster == cluster or e.cluster == "")
      }
    );

    roomCatalogue.map(
      func(r : RoomCatalogue) : Room {
        let entry = occupied.find(func(e : ScheduleEntry) : Bool { e.roomId == r.id });
        switch (entry) {
          case (?e) {{
            id             = r.id;
            block          = r.block;
            status         = #OCCUPIED;
            currentSession = curSession;
            occupiedBy     = ?e.subject;
          }};
          case null {{
            id             = r.id;
            block          = r.block;
            status         = #EMPTY;
            currentSession = curSession;
            occupiedBy     = null;
          }};
        }
      }
    )
  };

  /// Convenience wrapper used by the mixin (no day/cluster args — infers IST today).
  public func getRooms(schedules : List.List<ScheduleEntry>) : [Room] {
    getRoomsForDay(schedules, istDayOfWeek(), "")
  };

  // ──────────────────────────────────────────────────────────
  // Cluster holiday logic
  // ──────────────────────────────────────────────────────────

  /// C1 cluster: Saturday (6) is a holiday.
  /// C2 cluster: Monday (1) is a holiday.
  public func getClusterHoliday(cluster : Text, dayOfWeek : Nat) : Bool {
    if (cluster == "C1" and dayOfWeek == 6) return true;
    if (cluster == "C2" and dayOfWeek == 1) return true;
    // Sundays are holidays for everyone
    if (dayOfWeek == 0) return true;
    false
  };

  // ──────────────────────────────────────────────────────────
  // Seed data builder
  // ──────────────────────────────────────────────────────────

  /// Build and return the initial seed schedule entries.
  /// Provides ≥3 entries per room across varied sessions and days.
  public func seedSchedules() : List.List<ScheduleEntry> {
    let entries = List.empty<ScheduleEntry>();

    // ── C-Block ───────────────────────────────────────────────
    // C207 – S1_2 Mon/Tue/Wed C1; S5_6 Thu C2; S10_11 Fri C1
    entries.add({ roomId = "C207"; sessionId = "S1_2";   subject = "Data Structures";      dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S1_2";   subject = "Data Structures";      dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S1_2";   subject = "Data Structures";      dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S5_6";   subject = "Algorithm Design";     dayOfWeek = 4; cluster = "C2" });
    entries.add({ roomId = "C207"; sessionId = "S10_11"; subject = "Database Management";  dayOfWeek = 5; cluster = "C1" });

    // C208 – S3_4 Mon/Wed C2; S8_9 Tue C1; S12_13 Thu C2
    entries.add({ roomId = "C208"; sessionId = "S3_4";   subject = "Computer Networks";    dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "C208"; sessionId = "S3_4";   subject = "Computer Networks";    dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "C208"; sessionId = "S8_9";   subject = "Operating Systems";    dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "C208"; sessionId = "S12_13"; subject = "Software Engineering"; dayOfWeek = 4; cluster = "C2" });

    // C301 – S5_6 Mon C1; S3_4 Wed C2; S10_11 Thu C1
    entries.add({ roomId = "C301"; sessionId = "S5_6";   subject = "Machine Learning";     dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "C301"; sessionId = "S3_4";   subject = "Cloud Computing";      dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "C301"; sessionId = "S10_11"; subject = "Cyber Security";       dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "C301"; sessionId = "S1_2";   subject = "Web Development";      dayOfWeek = 5; cluster = "C2" });

    // ── R-Block ───────────────────────────────────────────────
    // R206A – S3_4 Tue/Thu C1; S8 Mon C2; S12_13 Wed C1
    entries.add({ roomId = "R206A"; sessionId = "S3_4";   subject = "Digital Electronics"; dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "R206A"; sessionId = "S3_4";   subject = "Digital Electronics"; dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "R206A"; sessionId = "S8";     subject = "Microprocessors";     dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "R206A"; sessionId = "S12_13"; subject = "VLSI Design";         dayOfWeek = 3; cluster = "C1" });

    // R207 – S1_2 Mon/Fri C2; S5_6 Tue C1; S9 Wed C2
    entries.add({ roomId = "R207"; sessionId = "S1_2";  subject = "Engineering Maths";   dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "R207"; sessionId = "S1_2";  subject = "Engineering Maths";   dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "R207"; sessionId = "S5_6";  subject = "Control Systems";     dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "R207"; sessionId = "S9";    subject = "Signal Processing";   dayOfWeek = 3; cluster = "C2" });

    // R208 – S10_11 Mon-Wed C1; S3_4 Thu C2; S5_6 Fri C1
    entries.add({ roomId = "R208"; sessionId = "S10_11"; subject = "Embedded Systems";    dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "R208"; sessionId = "S10_11"; subject = "Embedded Systems";    dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "R208"; sessionId = "S10_11"; subject = "Embedded Systems";    dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "R208"; sessionId = "S3_4";   subject = "IoT Systems";         dayOfWeek = 4; cluster = "C2" });
    entries.add({ roomId = "R208"; sessionId = "S5_6";   subject = "Robotics";            dayOfWeek = 5; cluster = "C1" });

    // ── M-Block ───────────────────────────────────────────────
    // M101 – S5_6 Mon-Fri C1 (lab)
    entries.add({ roomId = "M101"; sessionId = "S5_6"; subject = "Physics Lab";    dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S5_6"; subject = "Physics Lab";    dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S5_6"; subject = "Physics Lab";    dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S5_6"; subject = "Physics Lab";    dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S5_6"; subject = "Physics Lab";    dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S3_4"; subject = "Chemistry Lab";  dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "M101"; sessionId = "S3_4"; subject = "Chemistry Lab";  dayOfWeek = 4; cluster = "C2" });

    // M102 – S8_9 Mon/Wed C2; S1_2 Tue C1; S10_11 Fri C2
    entries.add({ roomId = "M102"; sessionId = "S8_9";   subject = "Electronics Lab";  dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "M102"; sessionId = "S8_9";   subject = "Electronics Lab";  dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "M102"; sessionId = "S1_2";   subject = "Circuits Lab";     dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "M102"; sessionId = "S10_11"; subject = "Measurements Lab"; dayOfWeek = 5; cluster = "C2" });

    // M201 – S12_13 Mon-Wed C1; S8 Thu C2; S3_4 Fri C1
    entries.add({ roomId = "M201"; sessionId = "S12_13"; subject = "Project Lab";       dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S12_13"; subject = "Project Lab";       dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S12_13"; subject = "Project Lab";       dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S8";     subject = "Seminar Room";      dayOfWeek = 4; cluster = "C2" });
    entries.add({ roomId = "M201"; sessionId = "S3_4";   subject = "Research Workshop"; dayOfWeek = 5; cluster = "C1" });

    entries
  };
};
