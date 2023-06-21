export default class DashUtil {
  static dashPlaceholder(condition, string, repeat = 1): string {
    if (condition) {
      return '-- --';
    }
    return string;
  }
  static giveMeDashes(): string {
    return '-- --';
  }
}
