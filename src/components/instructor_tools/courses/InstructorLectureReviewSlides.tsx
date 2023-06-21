import * as React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import DrawableControlItem from '../../drawing/DrawableControlItem';
import PresentationRenderer from '../../presentation/PresentationRenderer';
import PresentationState from '../../../PresentationState';
import PresentationPlaybackControls from '../../controls/PresentationPlaybackControls';
import ILecture from '../../../models/ILecture';
import Localizer from '../../../utilities/Localizer';

interface IInstructorLectureReviewSlidesProps {
  currentSlide: number;
  totalSlides: number;
  minSlide: number;
  slideImage: string;
  currentAnnotations: any;
  lecture: ILecture;
  changeSlide: (forward: boolean, slideNumber?: number) => void;
}

interface IInstructorLectureReviewSlidesState {}

export default class InstructorLectureReviewSlides extends SrUiComponent<
  IInstructorLectureReviewSlidesProps,
  IInstructorLectureReviewSlidesState
> {
  positionText() {
    const { currentSlide = 0 } = this.props;

    let currentText = '-';
    if (currentSlide !== 0) {
      currentText = currentSlide.toString();
    }

    return currentText;
  }

  atSlide(max: boolean) {
    const { currentSlide = 0, totalSlides = 0, minSlide = 1 } = this.props;
    if (max) {
      return currentSlide === totalSlides;
    }

    return currentSlide === Math.min(minSlide, totalSlides);
  }

  performRender() {
    const {
      lecture,
      currentSlide,
      totalSlides,
      slideImage,
      changeSlide,
    } = this.props;

    return (
      <div className="presentation">
        <div className="presentation-content">
          <PresentationRenderer
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            userSlideNumber={undefined}
            slideImage={slideImage}
            userSlideImage={undefined}
            presentationState={PresentationState.Live}
            observerOnly={false}
          />
        </div>
        <div className="presentation-controls-wrapper">
          <div className="presentation-controls d-flex align-self-start align-items-center">
            <DrawableControlItem
              disabled={this.atSlide(false)}
              className={this.atSlide(false) ? 'disabled' : null}
              onClick={() => changeSlide(false)}
              tooltipLabel={Localizer.get('back')}
            >
              <FaChevronLeft />
            </DrawableControlItem>
            <span className="current-slide">{this.positionText()}</span>
            <DrawableControlItem
              disabled={this.atSlide(true)}
              className={`${this.atSlide(true) ? 'disabled' : null} ml-0`}
              onClick={() => changeSlide(true)}
              tooltipLabel={Localizer.get('forward')}
            >
              <FaChevronRight />
            </DrawableControlItem>
          </div>
          <div className="flex-grow d-flex flex-column">
            <PresentationPlaybackControls
              isInstructor
              lecture={lecture}
              currentSlide={currentSlide}
              onPlaybackSlideChanged={(slide) => changeSlide(false, slide)}
            />
          </div>
        </div>
      </div>
    );
  }
}
