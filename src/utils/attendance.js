const defaultAttendanceRecord = {
  punchCardData: '--',
  normalHours: 0,
  travelNormalHours: 0,
  paidLeaveHours: 0,
  unpaidLeaveHours: 0,
  restHours: 0,
  holidayHours: 0,
  paidStopHours: 0,
  unpaidStopHours: 0,
  cardOverHours: 0,
  applyOverHours: 0,
  normalOverHours: 0,
  travelOverHours: 0,
  restOverHours: 0,
  holidayOverHours: 0,
  overToLeaveHours: 0,
  leaveSettlementHours: 0,
  lateMinutes: 0,
  lateCount: 0,
  leaveEarlyMinutes: 0,
  leaveEarlyCount: 0,
  absenteeismHours: 0,
  correctionNormalHours: 0,
  correctionNormalOverHours: 0,
  correctionWeekendOverHours: 0,
  correctionHolidayOverHours: 0,
};

const mockAttendance = {
  '2024-11-01': {
    punchCardData: '08:56 / 18:05',
    normalHours: 8,
    restOverHours: 2,
    leaveSettlementHours: 1.5,
  },
  '2024-11-18': {
    punchCardData: '09:01 / 18:42',
    normalHours: 7.5,
    travelNormalHours: 1.5,
    cardOverHours: 1.2,
    normalOverHours: 0.8,
    lateMinutes: 3,
    leaveEarlyMinutes: 0,
  },
};

export function createEmptyAttendance() {
  return { ...defaultAttendanceRecord };
}

export async function fetchDailyAttendance(attendanceDate) {
  await new Promise((resolve) => setTimeout(resolve, 220));

  const record = mockAttendance[attendanceDate];
  if (!record) {
    return { ...defaultAttendanceRecord };
  }

  return { ...defaultAttendanceRecord, ...record };
}
