export interface ScheduleEntry {
  academicGroup: string
  date: string
  start: string
  end: string
  name: string
  discipline: string
  type: string
  address: string
  room: string
  teacher: string
}

export interface GroupedSchedule {
  [date: string]: ScheduleEntry[]
}
