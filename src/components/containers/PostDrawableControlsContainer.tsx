import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import DrawableSurfaceMappers from '../../mappers/DrawableSurfaceMappers';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import PostDrawableSurfaceControls from '../presentation/PostDrawableSurfaceControls';

interface IConnectedPostDrawableControlsContainerProps
  extends DispatchProp<any> {
  drawingEnabled?: boolean;
  penSize?: PenSizes;
  penColorKey?: PenColorMap;
}

interface IPostDrawableControlsContainerProps {
  fullscreen: boolean;
}

interface IPostDrawableControlsContainerState {}

class PostDrawableControlsContainer extends SrUiComponent<
  IConnectedPostDrawableControlsContainerProps &
    IPostDrawableControlsContainerProps,
  IPostDrawableControlsContainerState
> {
  performRender() {
    const { drawingEnabled, penSize, fullscreen, penColorKey } = this.props;

    return (
      <div className="post-drawable-controls-container">
        <PostDrawableSurfaceControls
          drawingEnabled={drawingEnabled}
          penSize={penSize}
          fullscreen={fullscreen}
          penColorKey={penColorKey}
        />
      </div>
    );
  }
}

export default connect<
  IConnectedPostDrawableControlsContainerProps,
  void,
  IPostDrawableControlsContainerProps
>(DrawableSurfaceMappers.PostDrawableSurfaceMapper)(
  PostDrawableControlsContainer
);
