import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import ILecture from '../../models/ILecture';
import PresentationMappers from '../../mappers/PresentationMappers';
import PresentationData from '../../utilities/PresentationData';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import PresentationState from '../../PresentationState';

import PostPresentationControls from '../presentation/PostPresentationControls';

interface IConnecteddPostPresentationControlsContainerProps
  extends DispatchProp<any> {
  postPresentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
}
interface IPostPresentationControlsContainerProps {
  courseId: number;
  lecture: ILecture;
}

interface IPostPresentationControlsContainerState {
  currentSlideNumber: number;
}

class PostPresentationControlsContainer extends SrUiComponent<
  IConnecteddPostPresentationControlsContainerProps &
    IPostPresentationControlsContainerProps,
  IPostPresentationControlsContainerState
> {
  initialState() {
    return {
      currentSlideNumber: null,
    };
  }

  changeSlide(slideNumber: number) {
    const {
      dispatch,
      courseId,
      lecture,
      lecture: { id: lectureId },
    } = this.props;
    if (!slideNumber) {
      return;
    }

    if (lecture.audioUrl) {
      dispatch(
        PresentationActions.updatePostUserSlide(
          courseId,
          lectureId,
          slideNumber
        )
      );
    } else {
      dispatch(
        PresentationActions.updatePostCurrentSlide(
          courseId,
          lectureId,
          slideNumber
        )
      );
    }

    this.setPartial({ currentSlideNumber: slideNumber });
  }

  performRender() {
    const { courseId, postPresentedData } = this.props;
    const data = PresentationData.currentData(courseId, postPresentedData);
    const maxSlides = PresentationData.maxAllowedSlide(
      courseId,
      postPresentedData
    );

    return (
      <PostPresentationControls
        maxSlides={maxSlides}
        presentationState={
          maxSlides > 0
            ? PresentationState.Finished
            : PresentationState.Unstarted
        }
        changeSlide={(slideNumber) => this.changeSlide(slideNumber)}
        currentSlide={!data ? 0 : data.get('currentSlide')}
        availableSlides={
          !data
            ? []
            : data
                .get('presentedSlides')
                .map((presentationSlide) => presentationSlide.get('slide'))
                .toArray()
        }
        userSlide={!data ? undefined : data.get('userSlide')}
      />
    );
  }
}

export default connect<
  IConnecteddPostPresentationControlsContainerProps,
  void,
  IPostPresentationControlsContainerProps
>(PresentationMappers.PresentationMapper)(PostPresentationControlsContainer);
