import { fabric } from 'fabric';

export default class Canvas {
  public static rescaleObjects(canvas: fabric.Canvas, factor: number) {
    let objects = canvas.getObjects();
    objects.forEach((obj) => {
      this.setCustomPropertiesForObject(obj, factor);
      obj.scaleX = factor / obj['naOriginalScaleX'];
      obj.scaleY = factor / obj['naOriginalScaleY'];
      obj.left = obj['naOriginalLeft'] * obj.scaleX;
      obj.top = obj['naOriginalTop'] * obj.scaleY;
      obj.setCoords();
    });
  }

  public static setCustomPropertiesForCanvas(
    canvas: fabric.Canvas,
    factor: number
  ) {
    let objects = canvas.getObjects();
    objects.forEach((obj) => {
      this.setCustomPropertiesForObject(obj, factor);
    });
  }

  public static setCustomPropertiesForObject(
    obj: fabric.Object,
    factor: number
  ) {
    if (!obj['naOriginalScaleX']) {
      obj['naOriginalScaleX'] = factor;
    }

    if (!obj['naOriginalScaleY']) {
      obj['naOriginalScaleY'] = factor;
    }

    if (!obj['naOriginalLeft']) {
      obj['naOriginalLeft'] = obj.left;
    }

    if (!obj['naOriginalTop']) {
      obj['naOriginalTop'] = obj.top;
    }
  }
}
