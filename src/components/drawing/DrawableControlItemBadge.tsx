import * as React from 'react';
import { SrUiComponent } from 'react-strontium';

interface IDrawableControlItemBadgeProps {
  badges?: number;
}

interface IDrawableControlItemBadgeState {}

export default class DrawableControlItemBadge extends SrUiComponent<
  IDrawableControlItemBadgeProps,
  IDrawableControlItemBadgeState
> {
  performRender() {
    const { badges } = this.props;
    if (!badges || badges <= 0) {
      return null;
    }

    return (
      <div className="drawable-control-item-badge item-badge">{badges}</div>
    );
  }
}
