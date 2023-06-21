export default class Numbers {
  static parse(numStr: string, defaultValue: number = undefined): number {
    let result = parseInt(numStr);
    return isNaN(result) ? defaultValue : result;
  }
}
