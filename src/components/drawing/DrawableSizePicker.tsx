import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import { PenSizes } from '../../enums/PenSizes';
import { PenTypes } from '../../enums/PenTypes';
import TooltipWrapper from '../controls/TooltipWrapper';
import * as DrawableSurfaceActions from '../../store/drawable_surface/DrawableSurfaceActions';

interface IConnectedDrawableSizePickerProps extends DispatchProp<any> {}

interface IDrawableSizePickerProps {
  currentSize: PenSizes;
  penType: PenTypes;
  penSize: PenSizes;
  disabled: boolean;
}

interface IDrawableSizePickerState {}

export class DrawableSizePicker extends SrUiComponent<
  IConnectedDrawableSizePickerProps & IDrawableSizePickerProps,
  IDrawableSizePickerState
> {
  onNewProps(props: IDrawableSizePickerProps) {
    const { penSize: newPenSize, currentSize: newCurrentSize } = props;
    const { currentSize: prevCurrentSize } = this.props;

    if (
      this.sizeMatches(newPenSize, newCurrentSize) &&
      newCurrentSize !== prevCurrentSize
    ) {
      this.requestSizeChange(newPenSize);
    }
  }

  sizeMatches(penSize: PenSizes, currentSize: PenSizes) {
    return penSize === currentSize;
  }

  requestSizeChange(penSize: PenSizes) {
    const { dispatch } = this.props;
    dispatch(DrawableSurfaceActions.updatePenSize(penSize));
  }

  performRender() {
    const { penSize, penType, currentSize, disabled } = this.props;

    return (
      <TooltipWrapper
        id={`drawable-size-picker--${penType}-tooltip`}
        tooltipText={penType}
        disabled={disabled}
      >
        <Button
          onClick={() => this.requestSizeChange(penSize)}
          className={`drawable-size-picker control-item ${
            this.sizeMatches(penSize, currentSize) ? 'selected' : ''
          }`}
          tabIndex={0}
          disabled={disabled}
        >
          <img src={`/images/${penType}.svg`} alt={`using ${penType}`} />
        </Button>
      </TooltipWrapper>
    );
  }
}

export default connect<
  IConnectedDrawableSizePickerProps,
  void,
  IDrawableSizePickerProps
>(() => {
  return {};
})(DrawableSizePicker);
