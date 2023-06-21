import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import {
  FaCommentAlt,
  FaFont,
  FaCompressAlt,
  FaExpandAlt,
} from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import DrawableColorPicker from '../drawing/DrawableColorPicker';
import DrawableSizePicker from '../drawing/DrawableSizePicker';
import DrawableControlItem from '../drawing/DrawableControlItem';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import { PenTypes } from '../../enums/PenTypes';
import Localizer from '../../utilities/Localizer';
import AppMappers from '../../mappers/AppMappers';
import * as AppActions from '../../store/app/AppActions';

interface IConnectedDrawableSurfaceControlsProps extends DispatchProp<any> {
  isPresentationFullscreen: boolean;
}

interface IDrawableSurfaceControlsProps {
  penSize: PenSizes;
  penColorKey: PenColorMap;
  drawingEnabled: boolean;
  lectureQuestions: number;
}

interface IDrawableSurfaceControlsState {}

class DrawableSurfaceControls extends SrUiComponent<
  IConnectedDrawableSurfaceControlsProps & IDrawableSurfaceControlsProps,
  IDrawableSurfaceControlsState
> {
  performRender() {
    const {
      isPresentationFullscreen,
      dispatch,
      penSize,
      penColorKey,
      drawingEnabled,
      lectureQuestions,
    } = this.props;
    return (
      <div className="drawable-surface-controls drawable-controls">
        <DrawableSizePicker
          currentSize={penSize}
          penType={PenTypes.Pen}
          penSize={PenSizes.Small}
          disabled={!drawingEnabled}
        />
        <DrawableSizePicker
          currentSize={penSize}
          penType={PenTypes.Highlighter}
          penSize={PenSizes.Large}
          disabled={!drawingEnabled}
        />
        <div className="divider" />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Black}
          highlightPenColorKey={PenColorMap.HighlightBlack}
          currentColorKey={penColorKey}
          disabled={!drawingEnabled}
        />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Blue}
          highlightPenColorKey={PenColorMap.HighlightBlue}
          currentColorKey={penColorKey}
          disabled={!drawingEnabled}
        />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Red}
          highlightPenColorKey={PenColorMap.HighlightRed}
          currentColorKey={penColorKey}
          disabled={!drawingEnabled}
        />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Yellow}
          highlightPenColorKey={PenColorMap.HighlightYellow}
          currentColorKey={penColorKey}
          disabled={!drawingEnabled}
        />
        <div className="divider" />
        <DrawableControlItem
          onClick={() => this.broadcast(AppBroadcastEvents.DrawingUndo)}
          disabled={!drawingEnabled}
          tooltipLabel={Localizer.get('undo')}
        >
          <img src="/images/undo-arrow.svg" alt="undo action" />
        </DrawableControlItem>
        <DrawableControlItem
          onClick={() => this.broadcast(AppBroadcastEvents.DrawingClear)}
          disabled={!drawingEnabled}
          tooltipLabel={Localizer.get('delete')}
        >
          <img src="/images/waste-bin.svg" alt="waste bin" />
        </DrawableControlItem>
        <div className="divider" />
        <DrawableControlItem
          onClick={() => {
            dispatch(
              AppActions.toggleIsPresentationFullscreen(
                !isPresentationFullscreen
              )
            );
            if (!isPresentationFullscreen) {
              setTimeout(() => {
                window.resizeTo(
                  window.screen.availWidth,
                  window.screen.availHeight
                );
              }, 1000);
            }
          }}
          disabled={false}
          tooltipLabel={Localizer.get('fullscreen')}
        >
          {isPresentationFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
        </DrawableControlItem>
        <DrawableControlItem
          badges={lectureQuestions}
          onClick={() =>
            this.broadcast(AppBroadcastEvents.TogglePresentationQuestions)
          }
          disabled={false}
          tooltipLabel={Localizer.get('questions')}
        >
          <FaCommentAlt />
        </DrawableControlItem>
        <DrawableControlItem
          onClick={() =>
            this.broadcast(AppBroadcastEvents.TogglePresentationNotes)
          }
          disabled={false}
          tooltipLabel={Localizer.get('notes')}
        >
          <FaFont />
        </DrawableControlItem>
      </div>
    );
  }
}

export default connect<
  IConnectedDrawableSurfaceControlsProps,
  void,
  IDrawableSurfaceControlsProps
>(AppMappers.AppMapper)(DrawableSurfaceControls);
