import * as DrawableReducer from '../store/drawable_surface/DrawableSurfaceReducer';
import * as PresentationReducer from '../store/presentation/PresentationReducer';

export default class DrawableSurfaceMappers {
  public static DrawableSurfaceMapper = (state, props) => {
    return {
      drawingEnabled: DrawableReducer.getDrawingEnabled(state),
      penColorKey: DrawableReducer.getPenColorKey(state),
      penSize: DrawableReducer.getPenSize(state),
      presentedData: PresentationReducer.getPresentedData(state),
      notesData: PresentationReducer.getNotesData(state),
    };
  };

  public static PostDrawableSurfaceMapper = (state, props) => {
    return {
      drawingEnabled: DrawableReducer.getDrawingEnabled(state),
      penColorKey: DrawableReducer.getPenColorKey(state),
      penSize: DrawableReducer.getPenSize(state),
      presentedData: PresentationReducer.getPostPresentedData(state),
      notesData: PresentationReducer.getPostNotesData(state),
    };
  };
}
