import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FaFont, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LoadStates, SrUiComponent } from 'react-strontium';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import DrawableColorPicker from '../drawing/DrawableColorPicker';
import DrawableSizePicker from '../drawing/DrawableSizePicker';
import DrawableControlItem from '../drawing/DrawableControlItem';
import { PenTypes } from '../../enums/PenTypes';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import Localizer from '../../utilities/Localizer';
import PdfMappers from '../../mappers/PdfMappers';

interface IConnectedPdfDrawableSurfaceControlsProps extends DispatchProp<any> {
  documentLoadState: LoadStates;
  penSize: PenSizes;
  penColorKey: PenColorMap;
  isDrawingEnabled: boolean;
}

interface IPdfDrawableSurfaceControlsProps {
  isNotesVisible: boolean;
  fullscreen: boolean;
  onToggleNotes: () => void;
}

interface IPdfDrawableSurfaceControlsState {}

class PdfDrawableSurfaceControls extends SrUiComponent<
  IConnectedPdfDrawableSurfaceControlsProps & IPdfDrawableSurfaceControlsProps,
  IPdfDrawableSurfaceControlsState
> {
  notifyParentToggleNotes() {
    const { onToggleNotes } = this.props;
    onToggleNotes();
  }

  performRender() {
    const {
      documentLoadState,
      penSize,
      penColorKey,
      isDrawingEnabled,
      isNotesVisible,
    } = this.props;

    if (documentLoadState !== LoadStates.Succeeded) return null;

    return (
      <div className="pdf-drawable-surface-controls drawable-controls mb-1">
        <Button
          bsStyle="default"
          onClick={() => this.notifyParentToggleNotes()}
        >
          {isNotesVisible ? (
            <>
              <FaChevronRight />
              <span className="ml-1">Close notes</span>
            </>
          ) : (
            <>
              <FaChevronLeft />
              <span className="ml-1">Open notes</span>
            </>
          )}
        </Button>

        {/* // TODO Uncomment out for Annotations */}
        {/* <DrawableSizePicker
          currentSize={penSize}
          penSize={PenSizes.Small}
          penType={PenTypes.Pen}
          disabled={!isDrawingEnabled}
        />

        <DrawableSizePicker
          currentSize={penSize}
          penSize={PenSizes.Large}
          penType={PenTypes.Highlighter}
          disabled={!isDrawingEnabled}
        />
        <div className="divider" />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Black}
          highlightPenColorKey={PenColorMap.HighlightBlack}
          currentColorKey={penColorKey}
          disabled={!isDrawingEnabled}
        />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Blue}
          highlightPenColorKey={PenColorMap.HighlightBlue}
          currentColorKey={penColorKey}
          disabled={!isDrawingEnabled}
        />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Red}
          highlightPenColorKey={PenColorMap.HighlightRed}
          currentColorKey={penColorKey}
          disabled={!isDrawingEnabled}
        />
        <DrawableColorPicker
          currentSize={penSize}
          penColorKey={PenColorMap.Yellow}
          highlightPenColorKey={PenColorMap.HighlightYellow}
          currentColorKey={penColorKey}
          disabled={!isDrawingEnabled}
        />
        <div className="divider" />
        <DrawableControlItem
          disabled={!isDrawingEnabled}
          onClick={() => this.broadcast(AppBroadcastEvents.DrawingUndo)}
          tooltipLabel={Localizer.get('undo')}
        >
          <img src="/images/undo-arrow.svg" alt="undo action" />
        </DrawableControlItem>
        <DrawableControlItem
          disabled={!isDrawingEnabled}
          onClick={() => this.broadcast(AppBroadcastEvents.DrawingClear)}
          tooltipLabel={Localizer.get('delete')}
        >
          <img src="/images/waste-bin.svg" alt="waste bin" />
        </DrawableControlItem>
        <div className="divider" />
        <DrawableControlItem
          disabled={false}
          onClick={() => this.notifyParentToggleNotes()}
          tooltipLabel={Localizer.get('notes')}
        >
          <FaFont />
        </DrawableControlItem> */}
      </div>
    );
  }
}

export default connect<
  IConnectedPdfDrawableSurfaceControlsProps,
  void,
  IPdfDrawableSurfaceControlsProps
>(PdfMappers.PdfMapper)(PdfDrawableSurfaceControls);
