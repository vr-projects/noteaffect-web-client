import * as React from 'react';
import kebabCase from 'lodash/kebabCase';
import { Button } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import TooltipWrapper from '../controls/TooltipWrapper';
import DrawableControlItemBadge from './DrawableControlItemBadge';

interface IDrawableControlItemProps {
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  badges?: number;
  tooltipLabel?: string;
  hideTooltip?: boolean;
  disabled: boolean;
}

interface IDrawableControlItemState {}

export default class DrawableControlItem extends SrUiComponent<
  IDrawableControlItemProps,
  IDrawableControlItemState
> {
  performRender() {
    const {
      onClick,
      selected,
      disabled,
      badges,
      className = '',
      tooltipLabel = '',
      hideTooltip = false,
      children,
    } = this.props;

    return (
      <TooltipWrapper
        id={`drawable-control-item-${kebabCase(tooltipLabel)}-tooltip`}
        tooltipText={tooltipLabel}
        hideTooltip={hideTooltip}
        disabled={disabled}
      >
        <Button
          className={`control-item ${className} ${selected ? 'selected' : ''}`}
          disabled={disabled}
          onClick={() => {
            if (onClick) {
              onClick();
            }
          }}
        >
          <>{children}</>
          <DrawableControlItemBadge badges={badges} />
        </Button>
      </TooltipWrapper>
    );
  }
}
