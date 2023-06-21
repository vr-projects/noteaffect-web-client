import * as React from 'react';
import { FaFont } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import DrawableColorPicker from '../drawing/DrawableColorPicker';
import DrawableSizePicker from '../drawing/DrawableSizePicker';
import DrawableControlItem from '../drawing/DrawableControlItem';
import { PenTypes } from '../../enums/PenTypes';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import Localizer from '../../utilities/Localizer';

interface IDrawableSurfaceControlsProps {
  fullscreen: boolean;
  penSize: PenSizes;
  penColorKey: PenColorMap;
  drawingEnabled: boolean;
}

interface IDrawableSurfaceControlsState {}

export default class PostDrawableSurfaceControls extends SrUiComponent<
  IDrawableSurfaceControlsProps,
  IDrawableSurfaceControlsState
> {
  performRender() {
    const { penSize, penColorKey, drawingEnabled } = this.props;

    return (
      <div className="post-drawable-surface-controls drawable-controls">
        <DrawableSizePicker
          currentSize={penSize}
          penSize={PenSizes.Small}
          penType={PenTypes.Pen}
          disabled={!drawingEnabled}
        />

        <DrawableSizePicker
          currentSize={penSize}
          penSize={PenSizes.Large}
          penType={PenTypes.Highlighter}
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
          disabled={!drawingEnabled}
          onClick={() => this.broadcast(AppBroadcastEvents.DrawingUndo)}
          tooltipLabel={Localizer.get('undo')}
        >
          <img src="/images/undo-arrow.svg" alt="undo action" />
        </DrawableControlItem>
        <DrawableControlItem
          disabled={!drawingEnabled}
          onClick={() => this.broadcast(AppBroadcastEvents.DrawingClear)}
          tooltipLabel={Localizer.get('delete')}
        >
          <img src="/images/waste-bin.svg" alt="waste bin" />
        </DrawableControlItem>
        <div className="divider" />
        <DrawableControlItem
          disabled={false}
          onClick={() =>
            this.broadcast(AppBroadcastEvents.TogglePresentationNotes)
          }
          tooltipLabel={Localizer.get('notes')}
        >
          <FaFont />
        </DrawableControlItem>
      </div>
    );
  }
}
