import * as React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import PresentationRenderer from '../presentation/PresentationRenderer';
import PresentationState from '../../PresentationState';
import DrawableSurface from '../drawing/DrawableSurface';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import DrawableControlItem from '../drawing/DrawableControlItem';
import Localizer from '../../utilities/Localizer';

interface ILectureReviewSlidesProps {
  currentSlide: number;
  totalSlides: number;
  minSlide: number;
  slideImage: string;
  currentAnnotations: any;
  changeSlide: (forward: boolean) => void;
}

interface ILectureReviewSlidesState {}

class LectureReviewSlides extends SrUiComponent<
  ILectureReviewSlidesProps,
  ILectureReviewSlidesState
> {
  positionText() {
    const { currentSlide = 0, totalSlides = 0 } = this.props;
    const currentText = currentSlide === 0 ? '-' : currentSlide.toString();
    const maxSlides = this.props.totalSlides;
    const maxText = totalSlides === 0 ? '-' : maxSlides.toString();

    return `${currentText} / ${maxText}`;
  }

  atSlide(max: boolean) {
    const { currentSlide, totalSlides, minSlide } = this.props;
    if (max) {
      return (currentSlide || 0) === (totalSlides || 0);
    }
    return (currentSlide || 0) === Math.min(minSlide || 1, totalSlides || 0);
  }

  performRender() {
    const { changeSlide } = this.props;

    return (
      <div className="presentation">
        <div className="presentation-content">
          <PresentationRenderer
            currentSlide={this.props.currentSlide}
            totalSlides={this.props.totalSlides}
            userSlideNumber={undefined}
            slideImage={this.props.slideImage}
            userSlideImage={undefined}
            presentationState={PresentationState.Live}
            observerOnly={false}
          />
          <DrawableSurface
            drawingEnabled={false}
            penSize={PenSizes.Large}
            penColorKey={PenColorMap.Black}
            currentSlide={
              this.props.currentAnnotations ? this.props.currentSlide : 0
            }
            currentAnnotations={this.props.currentAnnotations}
            dataChanged={(d, r) => {}}
            drawing={(d) => {}}
          />
        </div>
        <div>
          <div className="presentation-controls">
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
              className={this.atSlide(true) ? 'disabled' : null}
              onClick={() => changeSlide(true)}
              tooltipLabel={Localizer.get('forward')}
            >
              <FaChevronRight />
            </DrawableControlItem>
          </div>
        </div>
      </div>
    );
  }
}

export default LectureReviewSlides;
