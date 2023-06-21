import hslToRgb from '@f/hsl-to-rgb';

export default class ColorUtils {
  public static valueToRedGreenHue(value: number) {
    const clamped = Math.max(0, Math.min(value, 1));
    return 100 * clamped;
  }

  public static valueToRedGreenRgb(
    value: number,
    saturation: number = 1,
    lightness: number = 0.4
  ) {
    var hue = this.valueToRedGreenHue(value);
    return hslToRgb(hue, saturation, lightness);
  }

  public static valueToRedGreenRgbStyle(
    value: number,
    saturation: number = 1,
    lightness: number = 0.4,
    alpha: number = 1
  ) {
    var values = this.valueToRedGreenRgb(value, saturation, lightness);
    if (alpha === 1) {
      return `rgb(${values[0]},${values[1]},${values[2]})`;
    } else {
      return `rgba(${values[0]},${values[1]},${values[2]},${Math.max(
        0,
        Math.min(alpha, 1)
      )})`;
    }
  }
}
