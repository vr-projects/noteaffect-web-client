import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import PresentationState from '../../PresentationState';
import PresentationStateMessage from './PresentationStateMessage';
import PresentationAwaitingImage from './PresentationAwaitingImage';

interface IPresentationRendererProps {
  observerOnly: boolean;
  currentSlide?: number;
  totalSlides?: number;
  userSlideNumber?: number;
  userSlideImage?: string;
  slideImage?: string;
  presentationState: PresentationState;
  unansweredPoll?: boolean;
}

interface IPresentationRendererState {}

export default class PresentationRenderer extends SrUiComponent<
  IPresentationRendererProps,
  IPresentationRendererState
> {
  private getCurrentSlideStyle(image: string): string {
    const { observerOnly, unansweredPoll } = this.props;
    if (!observerOnly && unansweredPoll) {
      return 'none';
    }

    return image ? `url(${image})` : 'none';
  }

  private currentSlideImage(): string {
    const {
      userSlideNumber,
      userSlideImage,
      currentSlide,
      slideImage,
    } = this.props;

    if (userSlideNumber && userSlideImage && userSlideNumber !== currentSlide) {
      return userSlideImage;
    }
    return slideImage;
  }

  performRender() {
    const { presentationState, unansweredPoll, observerOnly } = this.props;
    const slideImage = this.currentSlideImage();
    const slideStyle = this.getCurrentSlideStyle(slideImage);

    return (
      <div
        className="presentation-renderer"
        style={{ backgroundImage: slideStyle }}
      >
        <PresentationAwaitingImage
          show={presentationState === PresentationState.Live && !slideImage}
        />
        <PresentationStateMessage
          presentationState={presentationState}
          unansweredPoll={unansweredPoll}
          observerOnly={observerOnly}
        />
      </div>
    );
  }
}
