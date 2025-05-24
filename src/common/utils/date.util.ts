import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const BANGKOK_TZ = 'Asia/Bangkok';

export const getStartOfTodayInBangkok = (): Date => {
  return dayjs().tz(BANGKOK_TZ).startOf('day').toDate();
};

export const getEndOfTodayInBangkok = (): Date => {
  return dayjs().tz(BANGKOK_TZ).endOf('day').toDate();
};

export const getCurrentTimeInBangkok = (): Date => {
  return dayjs().tz(BANGKOK_TZ).toDate();
};

export const formatToBangkokTime = (date: Date): string => {
  return dayjs(date).tz(BANGKOK_TZ).format('YYYY-MM-DD HH:mm:ss');
};
