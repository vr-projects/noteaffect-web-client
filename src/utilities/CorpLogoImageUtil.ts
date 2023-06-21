export default class CorpLogoImageUtil {
  static exceededFileSizeKb(
    fileSize: number,
    maxSizeKb: number = 200
  ): boolean {
    const fileSizeKb = Math.round(fileSize / 1024);
    return fileSizeKb > maxSizeKb;
  }

  static exceededAspectRatio(
    image: any,
    allowedHeight = 50,
    maxAllowedWidth = 425
  ): boolean {
    const imageAspectRatio = image.width / image.height;
    const allowedAspectRatio = maxAllowedWidth / allowedHeight;
    return imageAspectRatio > allowedAspectRatio;
  }
}
