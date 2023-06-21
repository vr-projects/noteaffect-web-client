import * as React from 'react';
import { SrUiComponent, WaitSpinner } from 'react-strontium';
import Localizer from '../../utilities/Localizer';

interface IPresentationAwaitingImageProps {
  show: boolean;
}

interface IPresentationAwaitingImageState {}

export default class PresentationAwaitingImage extends SrUiComponent<
  IPresentationAwaitingImageProps,
  IPresentationAwaitingImageState
> {
  performRender() {
    const { show } = this.props;
    if (!show) {
      return null;
    }

    return (
      <p className="presentation-awaiting-image state-message">
        {Localizer.get('Getting segment image...')}
      </p>
    );
  }
}
