export interface Rect {
  width: number;
  height: number;
}

export default class BoxScaling {
  public static currentScale(reference: Rect, current: Rect): Rect {
    let scale: Rect = { width: 1, height: 1 };
    scale.width = current.width / reference.width;
    scale.height = current.height / reference.height;
    return scale;
  }
}
