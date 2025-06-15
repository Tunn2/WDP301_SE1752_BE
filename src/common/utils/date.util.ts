import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 🔥 SỬA TỪ BANGKOK SANG HO_CHI_MINH
const VIETNAM_TZ = 'Asia/Ho_Chi_Minh';

export const getStartOfTodayInVietnam = (): Date => {
  return dayjs().tz(VIETNAM_TZ).startOf('day').toDate();
};

export const getEndOfTodayInVietnam = (): Date => {
  return dayjs().tz(VIETNAM_TZ).endOf('day').toDate();
};

export const getCurrentTimeInVietnam = (): Date => {
  return dayjs().tz(VIETNAM_TZ).toDate();
};

export const formatToVietnamTime = (date: Date): string => {
  return dayjs(date).tz(VIETNAM_TZ).format('YYYY-MM-DD HH:mm:ss');
};

// 🔥 THÊM FUNCTION ĐỂ CONVERT INPUT DATE
export const getDateRangeInVietnam = (
  inputDate?: string | Date,
): { startDate: Date; endDate: Date } => {
  const targetDate = inputDate ? dayjs(inputDate) : dayjs();

  return {
    startDate: targetDate.tz(VIETNAM_TZ).startOf('day').toDate(),
    endDate: targetDate.tz(VIETNAM_TZ).endOf('day').toDate(),
  };
};

// 🔥 THÊM FUNCTION DEBUG
export const debugTimezone = () => {
  const now = dayjs();
  console.log('=== DAYJS TIMEZONE DEBUG ===');
  console.log('Current time (system):', now.format());
  console.log('Current time (Vietnam):', now.tz(VIETNAM_TZ).format());
  console.log(
    'Start of day (Vietnam):',
    now.tz(VIETNAM_TZ).startOf('day').format(),
  );
  console.log(
    'End of day (Vietnam):',
    now.tz(VIETNAM_TZ).endOf('day').format(),
  );
};
