import moment, { Moment } from 'moment-timezone';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { runtime } from 'react-strontium';
import ServiceReduxConnectionServices from 'services/ServiceReduxConnectionServices';

export const verboseDateTimeFormat = 'dddd, MMMM Do YYYY, h:mma';
export const longDateTimeFormat = 'MM/DD/YYYY hh:mm A';
export const longDateFormat = 'MM/DD/YY';
export const prettyLongDateFormat = 'MMMM D, YYYY';
export const prettyTimeFormat = 'h:mm A';

const EST = 'America/New_York';
const nullDashes = '--/--/----';

const timeZoneNames = {
  AKT: 'Alaska Time',
  AST: 'Atlantic Standard Time',
  ADT: 'Atlantic Daylight Time',
  EST: 'Eastern Standard Time',
  EDT: 'Eastern Daylight Time',
  CST: 'Central Standard Time',
  CDT: 'Central Daylight Time',
  HST: 'Hawaii-Aleutian Time (Honolulu)',
  HT: 'Hawaii-Aleutian Time (Adak)',
  MST: 'Mountain Standard Time',
  MDT: 'Mountain Daylight Time',
  PST: 'Pacific Standard Time',
  PDT: 'Pacific Daylight Time',
};
export default class DateFormatUtil {
  static format(d: Moment | string | number, formatStr?: string) {
    formatStr = formatStr || longDateFormat;
    return moment(d).format(formatStr);
  }

  static unix(d?: Moment) {
    const date = !isUndefined(d) ? d : moment();
    return moment(date).unix();
  }

  static getEST(d: number | Date | Moment, formatStr?: string) {
    return this.format(moment(d).tz(EST));
  }

  static getUnixToUserTimezone(d: number, formatStr?: string) {
    const userProfileTimezone = DateFormatUtil.getUserTimezone();
    if (isNull(d)) return nullDashes;
    formatStr = !!formatStr ? formatStr : longDateTimeFormat;
    return moment.unix(d).tz(userProfileTimezone).format(formatStr);
  }

  static getToGivenTimezone(d: any, userTimezone: string, formatStr?: string) {
    if (isNull(d)) return nullDashes;
    formatStr = !!formatStr ? formatStr : longDateTimeFormat;
    return moment(d).tz(userTimezone).format(formatStr);
  }

  static getUnixToGivenTimezone(
    d: number,
    timezone: string,
    formatStr?: string
  ) {
    if (isNull(d)) return nullDashes;
    timezone = !!timezone ? timezone : EST;
    formatStr = !!formatStr ? formatStr : longDateTimeFormat;
    return moment.unix(d).tz(timezone).format(formatStr);
  }

  static getUnixToEST(d: number, formatStr?: string) {
    if (isNull(d)) return nullDashes;
    formatStr = !!formatStr ? formatStr : longDateTimeFormat;
    return moment.unix(d).tz(EST).format(formatStr);
  }
  static getUnixGMT(d: number, formatStr: string) {
    if (isNull(d)) return nullDashes;
    return moment.unix(d).utc().format(formatStr);
  }
  static getUnixToESTIsBefore(d: number) {
    if (isNull(d)) return false;
    return moment.unix(d).tz(EST).isBefore(moment());
  }
  static getUnixToUserTimezoneIsBefore(d: number) {
    if (isNull(d)) return false;
    return moment
      .unix(d)
      .tz(DateFormatUtil.getUserTimezone())
      .isBefore(moment());
  }
  static getUnixToGivenTimezoneIsBefore(d: number, tz) {
    if (isNull(d)) return false;
    return moment.unix(d).tz(tz).isBefore(moment());
  }
  static getUnixToESTIsAfter(d: number) {
    if (isNull(d)) return false;
    return moment.unix(d).tz(EST).isAfter(moment());
  }
  static getUnixToUserTimezoneIsAfter(d: number) {
    if (isNull(d)) return false;
    return moment
      .unix(d)
      .tz(DateFormatUtil.getUserTimezone())
      .isAfter(moment());
  }
  static getUnixToGivenTimezoneIsAfter(d: number, tz) {
    if (isNull(d)) return false;
    return moment.unix(d).tz(tz).isAfter(moment());
  }
  static getDefaultMeetingStart() {
    const nowLocal = moment.tz(DateFormatUtil.getUserTimezone());
    const minsToNearestQuarterHour = 15 - (nowLocal.minute() % 15);
    return moment(nowLocal).add(minsToNearestQuarterHour, 'minutes');
  }
  static getDefaultMeetingEnd() {
    const hourFromNowLocal = moment
      .tz(DateFormatUtil.getUserTimezone())
      .add(1, 'hour');
    const minsToNearestQuarterHour = 15 - (hourFromNowLocal.minute() % 15);

    return moment(hourFromNowLocal).add(minsToNearestQuarterHour, 'minutes');
  }
  static getDayOfMonth(d: number) {
    if (isNull(d)) return false;
    return moment(d).date();
  }

  static getUserTimezone() {
    const svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    const timezone = svc.getUserInformation().get('timezone');
    return timezone;
  }

  static getUserTimezoneDisplay() {
    const svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    const timezone = svc.getUserInformation().get('timezone');
    var tz = moment().tz(timezone).format('z');
    return timeZoneNames[tz] || tz;
  }

  static getUserTimezoneAbbr() {
    const svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    const timezone = svc.getUserInformation().get('timezone');
    return moment().tz(timezone).format('z');
  }

  static getUnixToUserTimezoneAbbr(d: number) {
    if (isNull(d)) return DateFormatUtil.getUserTimezoneAbbr();
    let svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    let timezone = svc.getUserInformation().get('timezone');
    return moment.unix(d).tz(timezone).format('z');
  }

  static getDateToUserTimezoneAbbr(d: Date) {
    if (isNull(d)) return DateFormatUtil.getUserTimezoneAbbr();
    let svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    let timezone = svc.getUserInformation().get('timezone');
    return moment(d).tz(timezone).format('z');
  }

  static getUnixToGivenTimezoneAbbr(d: number, timezone: string) {
    if (isNull(d) || isUndefined(d))
      return DateFormatUtil.getGivenTimezoneAbbr(timezone);
    return moment.unix(d).tz(timezone).format('z');
  }

  static getGivenTimezoneAbbr(timezone: string) {
    timezone = !!timezone ? timezone : EST;
    return moment().tz(timezone).format('z');
  }
}
