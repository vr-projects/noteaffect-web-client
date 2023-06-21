import * as React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import DrawableControlItem from '../drawing/DrawableControlItem';
import PresentationState from '../../PresentationState';
import Localizer from '../../utilities/Localizer';

interface IPresentationControlProps {
  presentationState: PresentationState;
  maxSlides: number;
  currentSlide: number;
  userSlide: number;
  availableSlides: number[];
  changeSlide: (slide: number) => void;
}

interface IPresentationControlState {}

export default class PostPresentationControls extends SrUiComponent<
  IPresentationControlProps,
  IPresentationControlState
> {
  positionText() {
    const { userSlide, currentSlide } = this.props;
    let newSlide = userSlide || currentSlide || 0;
    let currentText = '-';
    if (newSlide !== 0) {
      currentText = newSlide.toString();
    }
    return currentText;
  }

  atSlide(max: boolean) {
    const { userSlide, currentSlide, maxSlides } = this.props;
    if (max) {
      return (userSlide || currentSlide || 0) === (maxSlides || 0);
    }

    return (userSlide || currentSlide || 0) === Math.min(1, maxSlides || 0);
  }

  nextSlideNumber(): number {
    const { presentationState, userSlide, currentSlide } = this.props;
    if (presentationState === PresentationState.Unstarted) {
      return null;
    }

    return this.nextPresentSlide(userSlide ? userSlide : currentSlide);
  }

  nextPresentSlide(currentSlide: number): number {
    const { availableSlides, maxSlides } = this.props;

    let newSlide = currentSlide + 1;
    while (availableSlides.indexOf(newSlide) === -1 && newSlide <= maxSlides) {
      newSlide++;
    }

    if (newSlide > maxSlides) {
      newSlide = maxSlides;
    }

    return newSlide;
  }

  previousSlideNumber(): number {
    const { presentationState, userSlide, currentSlide } = this.props;

    if (presentationState === PresentationState.Unstarted) {
      return null;
    }

    let newSlide = this.previousPresentSlide(
      userSlide ? userSlide : currentSlide
    );

    if (newSlide === currentSlide && !userSlide) {
      return null;
    }
    return newSlide;
  }

  previousPresentSlide(currentSlide: number): number {
    const { availableSlides, maxSlides } = this.props;
    let newSlide = currentSlide - 1;
    while (
      availableSlides.indexOf(newSlide) === -1 &&
      newSlide >= Math.min(1, maxSlides || 0)
    ) {
      newSlide--;
    }

    if (newSlide < Math.min(1, maxSlides || 0)) {
      newSlide = Math.min(1, maxSlides || 0);
    }

    return newSlide;
  }

  performRender() {
    const { changeSlide } = this.props;

    return (
      <div className="post-presentation-controls presentation-controls">
        <div className="post-controls">
          <DrawableControlItem
            disabled={this.atSlide(false)}
            className={`post-presentation-control-chevron ${
              this.atSlide(false) ? 'disabled' : ''
            }`}
            onClick={() => this.props.changeSlide(this.previousSlideNumber())}
            tooltipLabel={Localizer.get('back')}
          >
            <FaChevronLeft />
          </DrawableControlItem>
          <span className="current-slide">{this.positionText()}</span>
          <DrawableControlItem
            disabled={this.atSlide(true)}
            className={`post-presentation-control-chevron ${
              this.atSlide(true) ? 'disabled' : ''
            }`}
            onClick={() => changeSlide(this.nextSlideNumber())}
            tooltipLabel={Localizer.get('forward')}
          >
            <FaChevronRight />
          </DrawableControlItem>
        </div>
      </div>
    );
  }
}
