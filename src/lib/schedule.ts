export type DayRange = string; // e.g., "16:00-19:00"
export type WeekendSpec = { even?: string; odd?: string };
export type HolidaysSpec = Record<string, string>; // labels like 'summer', 'christmas'

export type ScheduleInput = {
  weekday?: Partial<
    Record<
      "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
      DayRange
    >
  >;
  weekend?: WeekendSpec;
  holidays?: HolidaysSpec;
  handover?: { location?: string; notes?: string };
};

export type Schedule = Required<ScheduleInput>;

export function normalizeSchedule(input: ScheduleInput): Schedule {
  const defaultWeekday: Required<Schedule["weekday"]> = {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  };
  const wd: Required<Schedule["weekday"]> = {
    ...defaultWeekday,
    ...(input.weekday ?? {}),
  };
  const weekend: WeekendSpec = { even: "", odd: "", ...(input.weekend || {}) };
  const holidays: HolidaysSpec = { ...(input.holidays || {}) };
  const handover = { location: "", notes: "", ...(input.handover || {}) };

  return { weekday: wd, weekend, holidays, handover };
}
