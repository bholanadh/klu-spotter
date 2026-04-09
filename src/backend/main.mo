import Types "types/scheduling";
import SchedulingLib "lib/scheduling";
import SchedulingApi "mixins/scheduling-api";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

actor {
  let schedules : List.List<Types.ScheduleEntry> = SchedulingLib.seedSchedules();

  include SchedulingApi(schedules);
};
