import DrawableSurfaceActionTypes from './DrawableSurfaceActionTypes';
import DrawableSurfaceRecord from './DrawableSurfaceRecord';

const initialState = new DrawableSurfaceRecord();
export default function drawableSurfaceReducer(
  state: DrawableSurfaceRecord = initialState,
  action: any = {}
) {
  switch (action.type as DrawableSurfaceActionTypes) {
    case DrawableSurfaceActionTypes.ChangeDrawingEnabled:
      return state.with({ drawingEnabled: action.value });
    case DrawableSurfaceActionTypes.ChangePenColorKey:
      return state.with({ penColorKey: action.value });
    case DrawableSurfaceActionTypes.ChangePenSize:
      return state.with({ penSize: action.value });
    case DrawableSurfaceActionTypes.ChangeIsDrawing:
      return state.with({ isDrawing: action.value });
    default:
      return state;
  }
}

export function getDrawingEnabled(state) {
  return state.drawableSurface.drawingEnabled;
}

export function getPenColorKey(state) {
  return state.drawableSurface.penColorKey;
}

export function getPenSize(state) {
  return state.drawableSurface.penSize;
}

export function getIsDrawing(state) {
  return state.drawableSurface.isDrawing;
}
