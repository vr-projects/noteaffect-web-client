import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import DrawableSurfaceControls from '../presentation/DrawableSurfaceControls';
import DrawableSurfaceMappers from '../../mappers/DrawableSurfaceMappers';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';

interface IConnectedDrawableControlsContainerProps extends DispatchProp<any> {
  drawingEnabled?: boolean;
  penSize?: PenSizes;
  penColorKey?: PenColorMap;
}
interface IDrawableControlsContainerProps {
  lectureQuestions?: number;
}

interface IDrawableControlsContainerState {}

class DrawableControlsContainer extends SrUiComponent<
  IConnectedDrawableControlsContainerProps & IDrawableControlsContainerProps,
  IDrawableControlsContainerState
> {
  performRender() {
    const {
      drawingEnabled,
      penSize,
      penColorKey,
      lectureQuestions,
    } = this.props;

    return (
      <DrawableSurfaceControls
        drawingEnabled={drawingEnabled}
        penSize={penSize}
        penColorKey={penColorKey}
        lectureQuestions={lectureQuestions}
      />
    );
  }
}

export default connect<
  IConnectedDrawableControlsContainerProps,
  void,
  IDrawableControlsContainerProps
>(DrawableSurfaceMappers.DrawableSurfaceMapper)(DrawableControlsContainer);
