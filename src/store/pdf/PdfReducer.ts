import PdfActionTypes from './PdfActionTypes';
import PdfRecord, { initialStore } from './PdfRecord';

const initialState = new PdfRecord();

export default function pdfReducer(
  state: PdfRecord = initialState,
  action: any = {}
) {
  switch (action.type as PdfActionTypes) {
    case PdfActionTypes.SetDocumentLoadState:
      return state.with({ documentLoadState: action.value });
    case PdfActionTypes.SetDocumentNotesLoadState:
      return state.with({ documentNotesLoadState: action.value });
    case PdfActionTypes.SetCurrentPage:
      return state.with({ currentPage: action.value });
    case PdfActionTypes.SetDrawingEnabled:
      return state.with({ isDrawingEnabled: action.value });
    case PdfActionTypes.SetIsDrawing:
      return state.with({ isDrawing: action.value });
    case PdfActionTypes.SetRemoteUpdateEnabled:
      return state.with({ isRemoteUpdateEnabled: action.value });
    case PdfActionTypes.SetPenColorKey:
      return state.with({ penColorKey: action.value });
    case PdfActionTypes.SetPenSize:
      return state.with({ penSize: action.value });
    case PdfActionTypes.SetPdfNotesData:
      return state.with({ notesData: action.value });
    case PdfActionTypes.SetUiContainer:
      return state.with({ uiContainer: action.value });
    case PdfActionTypes.ResetPdfStore:
      return state.with({ ...initialStore });
    default:
      return state;
  }
}

export const getDocumentLoadState = (state) => {
  return state.pdf.documentLoadState;
};

export const getDocumentNotesLoadState = (state) => {
  return state.pdf.documentNotesLoadState;
};

export const getCurrentPage = (state) => {
  return state.pdf.currentPage;
};

export const getIsDrawingEnabled = (state) => {
  return state.pdf.isDrawingEnabled;
};
export const getIsDrawing = (state) => {
  return state.pdf.isDrawing;
};
export const getIsRemoteUpdateEnabled = (state) => {
  return state.pdf.isRemoteUpdateEnabled;
};
export const getPenColorKey = (state) => {
  return state.pdf.penColorKey;
};
export const getPenSize = (state) => {
  return state.pdf.penSize;
};
export const getNotesData = (state) => {
  return state.pdf.notesData;
};
export const getUiContainer = (state) => {
  return state.pdf.uiContainer;
};
