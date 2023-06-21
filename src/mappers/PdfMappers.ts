import * as PdfReducer from '../store/pdf/PdfReducer';

export default class PdfMappers {
  public static PdfMapper = (state, props) => {
    return {
      documentLoadState: PdfReducer.getDocumentLoadState(state),
      documentNotesLoadState: PdfReducer.getDocumentNotesLoadState(state),
      currentPage: PdfReducer.getCurrentPage(state),
      isDrawingEnabled: PdfReducer.getIsDrawingEnabled(state),
      isDrawing: PdfReducer.getIsDrawing(state),
      isRemoteUpdateEnabled: PdfReducer.getIsRemoteUpdateEnabled(state),
      penColorKey: PdfReducer.getPenColorKey(state),
      penSize: PdfReducer.getPenSize(state),
      uiContainer: PdfReducer.getUiContainer(state),
      notesData: PdfReducer.getNotesData(state),
    };
  };
}
