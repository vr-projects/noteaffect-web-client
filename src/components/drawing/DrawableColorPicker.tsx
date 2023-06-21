import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import { FaCheck } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import { PenColorMap, PenColors, PenColorLabels } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import TooltipWrapper from '../controls/TooltipWrapper';
import * as DrawableSurfaceActions from '../../store/drawable_surface/DrawableSurfaceActions';

interface IDrawableColorPickerProps extends DispatchProp<any> {
  currentSize: PenSizes;
  penColorKey: PenColorMap;
  highlightPenColorKey: PenColorMap;
  currentColorKey: PenColorMap;
  disabled: boolean;
}

interface IDrawableColorPickerState {}

export class DrawableColorPicker extends SrUiComponent<
  IDrawableColorPickerProps,
  IDrawableColorPickerState
> {
  onNewProps(props: IDrawableColorPickerProps) {
    const {
      penColorKey: newPenColorKey,
      highlightPenColorKey: newHighlightPenColorKey,
      currentColorKey: newCurrentColorKey,
      currentSize: newCurrentSize,
    } = props;
    const { currentSize: prevCurrentSize } = this.props;

    if (
      this.colorMatches(
        newPenColorKey,
        newHighlightPenColorKey,
        newCurrentColorKey
      ) &&
      newCurrentSize !== prevCurrentSize
    ) {
      this.requestColorChange(
        newCurrentSize,
        newPenColorKey,
        newHighlightPenColorKey
      );
    }
  }

  controlColor() {
    const { currentSize, penColorKey, highlightPenColorKey } = this.props;
    return currentSize === PenSizes.Small
      ? PenColors[penColorKey]
      : PenColors[highlightPenColorKey];
  }

  colorMatches(
    penColorKey: PenColorMap,
    highlightPenColorKey: PenColorMap,
    currentColorKey: PenColorMap
  ) {
    return (
      penColorKey === currentColorKey ||
      highlightPenColorKey === currentColorKey
    );
  }

  requestColorChange(currentSize, penColorKey, highlightPenColorKey) {
    const { dispatch } = this.props;

    if (currentSize === PenSizes.Small) {
      dispatch(DrawableSurfaceActions.updatePenColorKey(penColorKey));
      return;
    }

    dispatch(DrawableSurfaceActions.updatePenColorKey(highlightPenColorKey));
    return;
  }

  performRender() {
    const {
      currentSize,
      penColorKey,
      highlightPenColorKey,
      currentColorKey,
      disabled,
    } = this.props;
    const labelKey =
      currentSize === PenSizes.Small ? penColorKey : highlightPenColorKey;

    return (
      <TooltipWrapper
        id={`drawable-color-picker--${penColorKey}-tooltip`}
        tooltipText={`${PenColorLabels[labelKey]}`}
        disabled={disabled}
      >
        <Button
          onClick={() =>
            this.requestColorChange(
              currentSize,
              penColorKey,
              highlightPenColorKey
            )
          }
          className={`drawable-color-picker control-color ${
            penColorKey === PenColorMap.Yellow ? 'bright ' : ''
          } ${
            this.colorMatches(
              penColorKey,
              highlightPenColorKey,
              currentColorKey
            )
              ? 'selected'
              : ''
          }`}
          style={{ backgroundColor: this.controlColor() }}
          disabled={disabled}
        >
          <FaCheck />
        </Button>
      </TooltipWrapper>
    );
  }
}

export default connect<any, void, IDrawableColorPickerProps>(() => {
  return {};
})(DrawableColorPicker);
