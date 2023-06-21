import ILecture from '../models/ILecture';
import moment from 'moment';

export default class LecturesUtil {
  public static sortedByDate(lectures: ILecture[], desc: boolean = true) {
    return (lectures || []).slice().sort((a, b) => {
      const dateOrder = desc
        ? (b.started || 3000000000) - (a.started || 3000000000)
        : (a.started || 3000000000) - (b.started || 3000000000);
      if (dateOrder !== 0) {
        return dateOrder;
      }
      return (b.name || '').localeCompare(a.name || '');
    });
  }

  public static sortedByName(lectures: ILecture[]) {
    return (lectures || []).sort((a, b) => {
      const nameOrder = (a.name || '').localeCompare(b.name || '');
      if (nameOrder !== 0) {
        return nameOrder;
      }

      return (b.started || 3000000000) - (a.started || 3000000000);
    });
  }

  public static fallbackName(lecture: ILecture) {
    return lecture.name || 'Unnamed Lecture';
  }

  // TODO tech debt remove this, use DateFormatUtil - use unixToGivenTimezone instead
  public static formattedStart(lecture: ILecture, short: boolean = false) {
    if (short) {
      return moment(lecture.started * 1000).format('MM-DD-YYYY hh:mma');
    }

    return moment(lecture.started * 1000).format('dddd, MMM Do YYYY, hh:mma');
  }
}
