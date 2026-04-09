import Types "../types/scheduling";
import SchedulingLib "../lib/scheduling";
import List "mo:core/List";

mixin (schedules : List.List<Types.ScheduleEntry>) {

  /// Returns all rooms with their current occupancy status (IST today, no cluster filter).
  public query func getRooms() : async [Types.Room] {
    SchedulingLib.getRooms(schedules)
  };

  /// Returns all rooms for a specific day-of-week and cluster.
  /// dayOfWeek: 0=Sunday … 6=Saturday
  /// cluster: "C1" | "C2" | "" (empty = no holiday filter applied)
  public query func getRoomsForDay(dayOfWeek : Nat, cluster : Text) : async [Types.Room] {
    SchedulingLib.getRoomsForDay(schedules, dayOfWeek, cluster)
  };

  /// Returns the current session identifier and time range (based on IST clock).
  public query func getCurrentSession() : async Types.SessionInfo {
    SchedulingLib.getCurrentSession(schedules)
  };

  /// Returns true if the given day is a cluster holiday.
  /// cluster: "C1" | "C2"; dayOfWeek: 0=Sunday … 6=Saturday
  public query func getClusterHoliday(cluster : Text, dayOfWeek : Nat) : async Bool {
    SchedulingLib.getClusterHoliday(cluster, dayOfWeek)
  };
};
