export default class AccessibilityUtil {
  static handleEnterKey(e, cb: Function): void {
    if (!!e && e.hasOwnProperty('key') && e.key === 'Enter') {
      cb();
    }
  }
}
