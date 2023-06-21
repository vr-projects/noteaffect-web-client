import * as Immutable from 'immutable';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import IDrawableRecordProps from '../../interfaces/IDrawableRecordProps';

const defaultProps: IDrawableRecordProps = {
  drawingEnabled: false,
  isDrawing: false,
  penColorKey: PenColorMap.Black,
  penSize: PenSizes.Small,
};

export default class DrawableSurfaceRecord extends Immutable.Record(
  defaultProps
) {
  constructor(params?: IDrawableRecordProps) {
    params ? super(params) : super();
  }

  get<T extends keyof IDrawableRecordProps>(value: T): IDrawableRecordProps[T] {
    return super.get(value);
  }

  with(values: IDrawableRecordProps) {
    return this.merge(values) as this;
  }
}
