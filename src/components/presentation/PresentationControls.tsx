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

export default class PresentationControls extends SrUiComponent<
  IPresentationControlProps,
  IPresentationControlState
> {
  positionText() {
    let currentSlide = this.props.userSlide || this.props.currentSlide || 0;
    let currentText = '-';
    if (currentSlide !== 0) {
      currentText = currentSlide.toString();
    }
    return currentText;
  }

  atSlide(max: boolean) {
    const { userSlide, currentSlide, maxSlides } = this.props;
    if (max) {
      return (userSlide || currentSlide || 0) === (maxSlides || 0);
    } else {
      return (
        (userSlide || this.props.currentSlide || 0) ===
        Math.min(1, this.props.maxSlides || 0)
      );
    }
  }

  nextSlideNumber(): number {
    const {
      presentationState,
      userSlide,
      currentSlide,
      maxSlides,
    } = this.props;
    if (presentationState === PresentationState.Unstarted) {
      return null;
    }
    let newSlide = this.nextPresentSlide(userSlide ? userSlide : currentSlide);
    if (newSlide === maxSlides && !userSlide) {
      return null;
    }

    return newSlide;
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

    if (newSlide === currentSlide) {
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
    const { changeSlide, userSlide, maxSlides } = this.props;

    return (
      <div className="presentation-controls-wrapper">
        <div className="presentation-controls">
          <DrawableControlItem
            className={this.atSlide(false) ? 'disabled' : null}
            onClick={() => changeSlide(this.previousSlideNumber())}
            disabled={this.atSlide(false)}
            tooltipLabel={Localizer.get('back')}
          >
            <FaChevronLeft />
          </DrawableControlItem>
          <span className="current-slide">{this.positionText()}</span>
          <DrawableControlItem
            className={`${this.atSlide(true) ? 'disabled' : null} ml-0`}
            onClick={() => changeSlide(this.nextSlideNumber())}
            disabled={this.atSlide(true)}
            tooltipLabel={Localizer.get('forward')}
          >
            <FaChevronRight />
          </DrawableControlItem>

          <DrawableControlItem
            className={`variable ${
              !userSlide || maxSlides <= 1 ? 'disabled' : null
            } control-item-auto`}
            onClick={() => changeSlide(null)}
            disabled={!userSlide}
            hideTooltip
          >
            {Localizer.get('Catch up')}
          </DrawableControlItem>
        </div>
      </div>
    );
  }
}
