export default class JSONutil {
  static isValid(jsonStr: string): boolean {
    try {
      var json = JSON.parse(jsonStr);
      return typeof json === 'object';
    } catch (e) {
      return false;
    }
  }
}
