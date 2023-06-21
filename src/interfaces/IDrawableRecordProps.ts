import { PenColorMap } from '../enums/PenColors';
import { PenSizes } from '../enums/PenSizes';

export default interface IDrawableRecordProps {
  drawingEnabled?: boolean;
  isDrawing?: boolean;
  penColorKey?: PenColorMap;
  penSize?: PenSizes;
}
