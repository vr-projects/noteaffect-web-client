import DrawableSurfaceActionTypes from './DrawableSurfaceActionTypes';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';

export function updatePenSize(size: PenSizes) {
  return async (dispatch, state) => {
    dispatch({ type: DrawableSurfaceActionTypes.ChangePenSize, value: size });
  };
}

export function updatePenColorKey(colorKey: PenColorMap) {
  return async (dispatch, state) => {
    dispatch({
      type: DrawableSurfaceActionTypes.ChangePenColorKey,
      value: colorKey,
    });
  };
}

export function updateDrawingEnabled(enabled: boolean) {
  return async (dispatch, state) => {
    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: enabled,
    });
  };
}

export function updateIsDrawing(drawing: boolean) {
  return async (dispatch, getState) => {
    if (getState().drawableSurface.drawingEnabled !== true) {
      dispatch({
        type: DrawableSurfaceActionTypes.ChangeIsDrawing,
        value: false,
      });
    } else {
      dispatch({
        type: DrawableSurfaceActionTypes.ChangeIsDrawing,
        value: drawing,
      });
    }
  };
}
