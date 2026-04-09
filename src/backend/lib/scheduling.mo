import Types "../types/scheduling";
import List "mo:core/List";
import Time "mo:core/Time";

module {

  public type Room          = Types.Room;
  public type SessionInfo   = Types.SessionInfo;
  public type ScheduleEntry = Types.ScheduleEntry;
  public type SessionId     = Types.SessionId;

  // IST = UTC + 5h30m = UTC + 330 minutes
  let IST_OFFSET_MINUTES : Int = 330;

  // Session windows: (sessionId, label, startMin, endMin, startLabel, endLabel)
  type SessionDef = {
    id         : Text;
    lbl        : Text;
    start      : Int;  // inclusive, minutes of day
    end_       : Int;  // exclusive
    startLabel : Text;
    endLabel   : Text;
  };

  let SESSION_DEFS : [SessionDef] = [
    { id = "S1_2";   lbl = "S1,2";    start = 430;  end_ = 530;  startLabel = "7:10 AM"; endLabel = "8:50 AM"  },
    { id = "S1";     lbl = "S1";      start = 430;  end_ = 480;  startLabel = "7:10 AM"; endLabel = "8:00 AM"  },
    { id = "S2";     lbl = "S2";      start = 480;  end_ = 530;  startLabel = "8:00 AM"; endLabel = "8:50 AM"  },
    { id = "S3_4";   lbl = "S3,4";    start = 560;  end_ = 660;  startLabel = "9:20 AM"; endLabel = "11:00 AM" },
    { id = "S3";     lbl = "S3";      start = 560;  end_ = 610;  startLabel = "9:20 AM"; endLabel = "10:10 AM" },
    { id = "S4";     lbl = "S4";      start = 610;  end_ = 660;  startLabel = "10:10 AM"; endLabel = "11:00 AM" },
    { id = "S5_6";   lbl = "S5,6";    start = 670;  end_ = 770;  startLabel = "11:10 AM"; endLabel = "12:50 PM" },
    { id = "S5";     lbl = "S5";      start = 670;  end_ = 720;  startLabel = "11:10 AM"; endLabel = "12:00 PM" },
    { id = "S6";     lbl = "S6";      start = 720;  end_ = 770;  startLabel = "12:00 PM"; endLabel = "12:50 PM" },
    { id = "S7";     lbl = "S7";      start = 770;  end_ = 830;  startLabel = "12:50 PM"; endLabel = "1:50 PM"  },
    { id = "S8_9";   lbl = "S8,9";    start = 830;  end_ = 940;  startLabel = "1:50 PM";  endLabel = "3:40 PM"  },
    { id = "S8";     lbl = "S8";      start = 830;  end_ = 880;  startLabel = "1:50 PM";  endLabel = "2:40 PM"  },
    { id = "S9";     lbl = "S9";      start = 890;  end_ = 940;  startLabel = "2:50 PM";  endLabel = "3:40 PM"  },
    { id = "S10_11"; lbl = "S10,11";  start = 950;  end_ = 1050; startLabel = "3:50 PM";  endLabel = "5:30 PM"  },
    { id = "S10";    lbl = "S10";     start = 950;  end_ = 1000; startLabel = "3:50 PM";  endLabel = "4:40 PM"  },
    { id = "S11";    lbl = "S11";     start = 1000; end_ = 1050; startLabel = "4:40 PM";  endLabel = "5:30 PM"  },
    { id = "S12_13"; lbl = "S12,13";  start = 1060; end_ = 1160; startLabel = "5:40 PM";  endLabel = "7:20 PM"  },
    { id = "S12";    lbl = "S12";     start = 1060; end_ = 1110; startLabel = "5:40 PM";  endLabel = "6:30 PM"  },
    { id = "S13";    lbl = "S13";     start = 1110; end_ = 1160; startLabel = "6:30 PM";  endLabel = "7:20 PM"  },
  ];

  // Lookup table: given a sessionId in a ScheduleEntry, which minute ranges does it span?
  func sessionSpan(sid : Text) : (Int, Int) {
    // Return (startMin, endMin) for a given session id
    let found = List.fromArray<SessionDef>(SESSION_DEFS).find(func (d : SessionDef) : Bool { d.id == sid });
    switch (found) {
      case (?d) (d.start, d.end_);
      case null  (0, 0);
    };
  };

  // Get current IST minute-of-day and day-of-week (0=Sun..6=Sat)
  func getISTMinuteAndDay() : (Int, Nat) {
    let nowNs : Int = Time.now();
    let nowSec : Int = nowNs / 1_000_000_000;
    let nowMin : Int = nowSec / 60;
    let istMin : Int = nowMin + IST_OFFSET_MINUTES;
    let minuteOfDay : Int = istMin % (24 * 60);
    let daysSinceEpoch : Int = istMin / (24 * 60);
    // Unix epoch (Jan 1, 1970) was a Thursday = day 4 (0=Sun)
    let dayOfWeekInt : Int = (daysSinceEpoch + 4) % 7;
    let dayOfWeek : Nat = if (dayOfWeekInt >= 0) { Int.toNat(dayOfWeekInt) } else { Int.toNat(dayOfWeekInt + 7) };
    (minuteOfDay, dayOfWeek);
  };

  /// Return the current IST session based on the canister clock (UTC + 5:30).
  public func getCurrentSession(_schedules : List.List<ScheduleEntry>) : SessionInfo {
    let (minuteOfDay, _) = getISTMinuteAndDay();
    // Find the first session window that contains the current minute
    // Prefer double sessions (S1_2, S3_4, etc.) over singles
    let defs = List.fromArray<SessionDef>(SESSION_DEFS);
    let active = defs.find(func (d : SessionDef) : Bool {
      minuteOfDay >= d.start and minuteOfDay < d.end_
    });
    switch (active) {
      case (?d) {
        { sessionId = d.id; sessionLabel = d.lbl; startTime = d.startLabel; endTime = d.endLabel; isActive = true }
      };
      case null {
        { sessionId = "NONE"; sessionLabel = "No Session"; startTime = "--"; endTime = "--"; isActive = false }
      };
    };
  };

  /// Returns true if the given day is a holiday for the given cluster.
  public func getClusterHoliday(cluster : Text, dayOfWeek : Nat) : Bool {
    if (dayOfWeek == 0) return true;          // Sunday = holiday for all
    if (cluster == "C1" and dayOfWeek == 6) return true;  // C1: Saturday off
    if (cluster == "C2" and dayOfWeek == 1) return true;  // C2: Monday off
    false
  };

  /// Return all rooms with occupancy status for the given day and cluster.
  public func getRoomsForDay(
    schedules : List.List<ScheduleEntry>,
    dayOfWeek : Nat,
    cluster   : Text,
  ) : [Room] {
    let (minuteOfDay, _) = getISTMinuteAndDay();

    // If it's a holiday for this cluster, return all rooms as EMPTY
    let isHoliday = getClusterHoliday(cluster, dayOfWeek);

    // All 9 rooms with their blocks
    let roomCatalogue : [(Text, Types.Block)] = [
      ("R206A", #R_BLOCK),
      ("R207",  #R_BLOCK),
      ("R208",  #R_BLOCK),
      ("C207",  #C_BLOCK),
      ("C208",  #C_BLOCK),
      ("C301",  #C_BLOCK),
      ("M101",  #M_BLOCK),
      ("M102",  #M_BLOCK),
      ("M201",  #M_BLOCK),
    ];

    List.fromArray<(Text, Types.Block)>(roomCatalogue).map<(Text, Types.Block), Room>(func (entry) {
      let (roomId, block) = entry;

      if (isHoliday) {
        return {
          id             = roomId;
          block          = block;
          status         = #EMPTY;
          currentSession = "NONE";
          occupiedBy     = null;
        };
      };

      // Find any schedule entry for this room+day+cluster that overlaps current time
      let occupied = schedules.find(func (e : ScheduleEntry) : Bool {
        let matchRoom = e.roomId == roomId;
        let matchDay  = e.dayOfWeek == dayOfWeek;
        let matchCluster = e.cluster == "" or cluster == "" or e.cluster == cluster;
        if (not matchRoom or not matchDay or not matchCluster) false
        else {
          let (sStart, sEnd) = sessionSpan(e.sessionId);
          minuteOfDay >= sStart and minuteOfDay < sEnd
        }
      });

      switch (occupied) {
        case (?e) {
          {
            id             = roomId;
            block          = block;
            status         = #OCCUPIED;
            currentSession = e.sessionId;
            occupiedBy     = ?e.subject;
          }
        };
        case null {
          {
            id             = roomId;
            block          = block;
            status         = #EMPTY;
            currentSession = "NONE";
            occupiedBy     = null;
          }
        };
      };
    }).toArray()
  };

  /// Convenience wrapper: infers IST today's dayOfWeek, no cluster filter.
  public func getRooms(schedules : List.List<ScheduleEntry>) : [Room] {
    let (_, dayOfWeek) = getISTMinuteAndDay();
    getRoomsForDay(schedules, dayOfWeek, "")
  };

  /// Build and return the initial seed schedule entries for all rooms.
  public func seedSchedules() : List.List<ScheduleEntry> {
    let entries = List.empty<ScheduleEntry>();

    // ── R-Block: R206A ──────────────────────────────────────────────────────
    // Monday (1)
    entries.add({ roomId = "R206A"; sessionId = "S1_2";   subject = "Maths-III Lab";          dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "R206A"; sessionId = "S3_4";   subject = "DSA Lab";                dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "R206A"; sessionId = "S5";     subject = "DBMS";                   dayOfWeek = 1; cluster = "" });
    entries.add({ roomId = "R206A"; sessionId = "S8_9";   subject = "OS Lab";                 dayOfWeek = 1; cluster = "C1" });
    // Tuesday (2)
    entries.add({ roomId = "R206A"; sessionId = "S3";     subject = "Computer Networks";      dayOfWeek = 2; cluster = "" });
    entries.add({ roomId = "R206A"; sessionId = "S5_6";   subject = "Python Lab";             dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "R206A"; sessionId = "S10_11"; subject = "Compiler Design Lab";    dayOfWeek = 2; cluster = "C1" });
    // Wednesday (3)
    entries.add({ roomId = "R206A"; sessionId = "S1";     subject = "Software Engineering";   dayOfWeek = 3; cluster = "" });
    entries.add({ roomId = "R206A"; sessionId = "S3_4";   subject = "Web Tech Lab";           dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "R206A"; sessionId = "S8";     subject = "Cloud Computing";        dayOfWeek = 3; cluster = "C2" });
    // Thursday (4)
    entries.add({ roomId = "R206A"; sessionId = "S5";     subject = "AI";                     dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "R206A"; sessionId = "S8_9";   subject = "ML Lab";                 dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "R206A"; sessionId = "S12_13"; subject = "IOT Lab";                dayOfWeek = 4; cluster = "C2" });
    // Friday (5)
    entries.add({ roomId = "R206A"; sessionId = "S3";     subject = "DBMS";                   dayOfWeek = 5; cluster = "" });
    entries.add({ roomId = "R206A"; sessionId = "S5_6";   subject = "Networks Lab";           dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "R206A"; sessionId = "S10";    subject = "Elective";               dayOfWeek = 5; cluster = "C2" });
    // Saturday (6) — C2 only (C1 is off on Sat)
    entries.add({ roomId = "R206A"; sessionId = "S1_2";   subject = "Remedial Class";         dayOfWeek = 6; cluster = "C2" });
    entries.add({ roomId = "R206A"; sessionId = "S3";     subject = "Tutorial";               dayOfWeek = 6; cluster = "C2" });

    // ── R-Block: R207 ───────────────────────────────────────────────────────
    entries.add({ roomId = "R207"; sessionId = "S1";     subject = "Maths-III";              dayOfWeek = 1; cluster = "" });
    entries.add({ roomId = "R207"; sessionId = "S3_4";   subject = "Physics Lab";            dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "R207"; sessionId = "S8_9";   subject = "DSP Lab";                dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "R207"; sessionId = "S5";     subject = "COA";                    dayOfWeek = 2; cluster = "" });
    entries.add({ roomId = "R207"; sessionId = "S10_11"; subject = "VLSI Lab";               dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "R207"; sessionId = "S3";     subject = "Signals & Systems";      dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "R207"; sessionId = "S5_6";   subject = "Microprocessors Lab";    dayOfWeek = 3; cluster = "" });
    entries.add({ roomId = "R207"; sessionId = "S1_2";   subject = "Embedded Systems";       dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "R207"; sessionId = "S8";     subject = "Control Systems";        dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "R207"; sessionId = "S3";     subject = "Power Electronics";      dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "R207"; sessionId = "S12_13"; subject = "Project Review";         dayOfWeek = 5; cluster = "" });
    entries.add({ roomId = "R207"; sessionId = "S1_2";   subject = "Extra Class";            dayOfWeek = 6; cluster = "C2" });

    // ── R-Block: R208 ───────────────────────────────────────────────────────
    entries.add({ roomId = "R208"; sessionId = "S3";     subject = "Engineering Drawing";    dayOfWeek = 1; cluster = "" });
    entries.add({ roomId = "R208"; sessionId = "S5_6";   subject = "Chemistry Lab";          dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "R208"; sessionId = "S8_9";   subject = "Mechanics Lab";          dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "R208"; sessionId = "S1";     subject = "Thermodynamics";         dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "R208"; sessionId = "S5";     subject = "Manufacturing Proc.";    dayOfWeek = 3; cluster = "" });
    entries.add({ roomId = "R208"; sessionId = "S3_4";   subject = "CAD Lab";                dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "R208"; sessionId = "S10_11"; subject = "Fluid Mechanics Lab";    dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "R208"; sessionId = "S8";     subject = "Heat Transfer";          dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "R208"; sessionId = "S1_2";   subject = "Robotics Lab";           dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "R208"; sessionId = "S5";     subject = "Automobile Engineering"; dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "R208"; sessionId = "S3_4";   subject = "Workshop";               dayOfWeek = 6; cluster = "C2" });

    // ── C-Block: C207 ───────────────────────────────────────────────────────
    entries.add({ roomId = "C207"; sessionId = "S1_2";   subject = "Full Stack Dev Lab";     dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "C207"; sessionId = "S3";     subject = "Java Programming";       dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S5_6";   subject = "React Lab";              dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S8_9";   subject = "Spring Boot Lab";        dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "C207"; sessionId = "S1";     subject = "Advanced Java";          dayOfWeek = 3; cluster = "" });
    entries.add({ roomId = "C207"; sessionId = "S3_4";   subject = "Microservices Lab";      dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S5";     subject = "DevOps";                 dayOfWeek = 4; cluster = "C2" });
    entries.add({ roomId = "C207"; sessionId = "S10_11"; subject = "Docker Lab";             dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "C207"; sessionId = "S8";     subject = "Kubernetes";             dayOfWeek = 5; cluster = "" });
    entries.add({ roomId = "C207"; sessionId = "S12_13"; subject = "Capstone Project";       dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "C207"; sessionId = "S1_2";   subject = "Hackathon Prep";         dayOfWeek = 6; cluster = "C2" });

    // ── C-Block: C208 ───────────────────────────────────────────────────────
    entries.add({ roomId = "C208"; sessionId = "S3";     subject = "Data Structures";        dayOfWeek = 1; cluster = "" });
    entries.add({ roomId = "C208"; sessionId = "S8_9";   subject = "Algorithms Lab";         dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "C208"; sessionId = "S1_2";   subject = "Graph Theory";           dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "C208"; sessionId = "S5";     subject = "Discrete Maths";         dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "C208"; sessionId = "S10_11"; subject = "Combinatorics Lab";      dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "C208"; sessionId = "S3_4";   subject = "Number Theory";          dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "C208"; sessionId = "S5_6";   subject = "Cryptography Lab";       dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "C208"; sessionId = "S8";     subject = "Network Security";       dayOfWeek = 4; cluster = "C2" });
    entries.add({ roomId = "C208"; sessionId = "S1";     subject = "Ethical Hacking";        dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "C208"; sessionId = "S12_13"; subject = "Penetration Testing";    dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "C208"; sessionId = "S3";     subject = "Revision Class";         dayOfWeek = 6; cluster = "C2" });

    // ── C-Block: C301 ───────────────────────────────────────────────────────
    entries.add({ roomId = "C301"; sessionId = "S5";     subject = "Big Data Analytics";     dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "C301"; sessionId = "S1_2";   subject = "Hadoop Lab";             dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "C301"; sessionId = "S3";     subject = "Spark Framework";        dayOfWeek = 2; cluster = "" });
    entries.add({ roomId = "C301"; sessionId = "S8_9";   subject = "Data Warehouse Lab";     dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "C301"; sessionId = "S5_6";   subject = "ETL Pipeline Lab";       dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "C301"; sessionId = "S1";     subject = "Business Intelligence";  dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "C301"; sessionId = "S10_11"; subject = "Tableau Lab";            dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "C301"; sessionId = "S3_4";   subject = "PowerBI Workshop";       dayOfWeek = 4; cluster = "C2" });
    entries.add({ roomId = "C301"; sessionId = "S8";     subject = "R Programming";          dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "C301"; sessionId = "S5";     subject = "Statistics for Data";    dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "C301"; sessionId = "S1_2";   subject = "Data Science Seminar";   dayOfWeek = 6; cluster = "C2" });

    // ── M-Block: M101 ───────────────────────────────────────────────────────
    entries.add({ roomId = "M101"; sessionId = "S3_4";   subject = "Management Principles";  dayOfWeek = 1; cluster = "" });
    entries.add({ roomId = "M101"; sessionId = "S5_6";   subject = "Marketing Management";   dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S8";     subject = "Financial Accounting";   dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "M101"; sessionId = "S1_2";   subject = "Business Law";           dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S3";     subject = "Organizational Behavior"; dayOfWeek = 3; cluster = "" });
    entries.add({ roomId = "M101"; sessionId = "S10_11"; subject = "Supply Chain Mgmt Lab";  dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "M101"; sessionId = "S5";     subject = "Operations Research";    dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S8_9";   subject = "ERP Lab";                dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "M101"; sessionId = "S1";     subject = "Entrepreneurship";       dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "M101"; sessionId = "S12_13"; subject = "Business Case Study";    dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "M101"; sessionId = "S3_4";   subject = "Weekend Workshop";       dayOfWeek = 6; cluster = "C2" });

    // ── M-Block: M102 ───────────────────────────────────────────────────────
    entries.add({ roomId = "M102"; sessionId = "S1";     subject = "Communication Skills";   dayOfWeek = 1; cluster = "C2" });
    entries.add({ roomId = "M102"; sessionId = "S5_6";   subject = "Technical Writing Lab";  dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "M102"; sessionId = "S3_4";   subject = "Presentation Skills";    dayOfWeek = 2; cluster = "" });
    entries.add({ roomId = "M102"; sessionId = "S8_9";   subject = "Group Discussion";       dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "M102"; sessionId = "S5";     subject = "Interview Prep";         dayOfWeek = 3; cluster = "C1" });
    entries.add({ roomId = "M102"; sessionId = "S1_2";   subject = "Aptitude Training";      dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "M102"; sessionId = "S10_11"; subject = "Coding Contest Prep";    dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "M102"; sessionId = "S3";     subject = "Personality Dev.";       dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "M102"; sessionId = "S8";     subject = "Resume Writing";         dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "M102"; sessionId = "S5_6";   subject = "Mock Interviews";        dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "M102"; sessionId = "S1_2";   subject = "Placement Training";     dayOfWeek = 6; cluster = "C2" });

    // ── M-Block: M201 ───────────────────────────────────────────────────────
    entries.add({ roomId = "M201"; sessionId = "S5";     subject = "Research Methodology";   dayOfWeek = 1; cluster = "" });
    entries.add({ roomId = "M201"; sessionId = "S8_9";   subject = "Literature Review Lab";  dayOfWeek = 1; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S1_2";   subject = "Research Paper Writing"; dayOfWeek = 2; cluster = "C2" });
    entries.add({ roomId = "M201"; sessionId = "S3";     subject = "Data Collection Methods"; dayOfWeek = 2; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S5_6";   subject = "Statistical Analysis Lab"; dayOfWeek = 3; cluster = "" });
    entries.add({ roomId = "M201"; sessionId = "S10_11"; subject = "SPSS Lab";               dayOfWeek = 3; cluster = "C2" });
    entries.add({ roomId = "M201"; sessionId = "S3_4";   subject = "Thesis Writing";         dayOfWeek = 4; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S8";     subject = "Conference Preparation"; dayOfWeek = 4; cluster = "" });
    entries.add({ roomId = "M201"; sessionId = "S1";     subject = "Patent Filing";          dayOfWeek = 5; cluster = "C2" });
    entries.add({ roomId = "M201"; sessionId = "S12_13"; subject = "Project Viva";           dayOfWeek = 5; cluster = "C1" });
    entries.add({ roomId = "M201"; sessionId = "S3_4";   subject = "Research Symposium";     dayOfWeek = 6; cluster = "C2" });

    entries
  };
};
