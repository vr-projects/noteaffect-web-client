import * as Immutable from 'immutable';
import { LoadStates } from 'react-strontium';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import { IImmutablePdfNotes } from '../../interfaces/IPdfNotes';

interface IPdfRecordState {
  documentLoadState?: LoadStates;
  documentNotesLoadState?: LoadStates;
  currentPage?: number;
  isDrawingEnabled?: boolean;
  isDrawing?: boolean;
  isRemoteUpdateEnabled?: boolean;
  penColorKey?: PenColorMap;
  penSize?: PenSizes;
  uiContainer?: HTMLDivElement;
  notesData?: Immutable.Map<
    string,
    Immutable.Map<string, Immutable.Map<string, IImmutablePdfNotes>>
  >;
}

export const initialStore = {
  documentLoadState: LoadStates.Unloaded,
  documentNotesLoadState: LoadStates.Unloaded,
  currentPage: 1,
  isDrawingEnabled: false,
  isDrawing: false,
  isRemoteUpdateEnabled: false,
  penColorKey: PenColorMap.Black,
  penSize: PenSizes.Small,
  uiContainer: null,
  notesData: Immutable.Map<string, any>(),
};

export default class PdfRecord extends Immutable.Record(initialStore) {
  constructor(params?: IPdfRecordState) {
    params ? super(params) : super();
  }

  get<T extends keyof IPdfRecordState>(value: T): IPdfRecordState[T] {
    return super.get(value);
  }

  with(values: IPdfRecordState) {
    return this.merge(values) as this;
  }
}
