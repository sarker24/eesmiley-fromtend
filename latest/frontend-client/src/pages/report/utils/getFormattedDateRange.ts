import moment from 'moment';
import { API_DATE_FORMAT } from 'utils/datetime';

const getFormattedTimeRange = (startDate: string, endDate: string): string => {
  return (
    moment(startDate, API_DATE_FORMAT).format('L') +
    ' - ' +
    moment(endDate, API_DATE_FORMAT).format('L')
  );
};

export default getFormattedTimeRange;
