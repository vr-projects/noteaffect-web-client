import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import PresentationMappers from '../../mappers/PresentationMappers';
import PresentationRenderer from '../presentation/PresentationRenderer';
import PresentationState from '../../PresentationState';
import PresentationData from '../../utilities/PresentationData';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import DataRecordingUtil from '../../utilities/DataRecordingUtil';

interface IPostPresentationRendererContainerProps extends DispatchProp<any> {
  courseId: number;
  observerOnly: boolean;
  postPresentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
}

interface IPostPresentationRendererContainerState {}

class PostPresentationRendererContainer extends SrUiComponent<
  IPostPresentationRendererContainerProps,
  IPostPresentationRendererContainerState
> {
  getData(props: IPostPresentationRendererContainerProps) {
    return PresentationData.currentData(
      props.courseId,
      props.postPresentedData
    );
  }

  getState(currentData: IImmutablePresentedDataMap) {
    return currentData
      ? currentData.get('state') || PresentationState.Unstarted
      : PresentationState.Unstarted;
  }

  onComponentMounted() {
    const { courseId, postPresentedData } = this.props;
    const lectureId = PresentationData.currentLectureId(
      courseId,
      postPresentedData
    );

    DataRecordingUtil.recordDataItem({
      key: 'Started viewing post presentation',
      id1: courseId,
      id2: lectureId,
    });

    DataRecordingUtil.recordDataItem({
      key: 'Post slide changed',
      id1: courseId,
      id2: lectureId,
      value1: 1,
    });
  }

  onNewProps(props: IPostPresentationRendererContainerProps) {
    const { courseId, postPresentedData } = this.props;
    const currentData = this.getData(this.props);
    const currentSlideData = PresentationData.lastCurrentSlide(
      courseId,
      postPresentedData
    );
    const newData = this.getData(props);
    const newSlideData = PresentationData.lastCurrentSlide(
      courseId,
      postPresentedData
    );
    const currentLiveSlideNumber =
      currentSlideData && currentData ? currentData.get('currentSlide') : 0;
    const currentUserSlideNumber =
      currentSlideData && currentData
        ? currentData.get('userSlide')
        : undefined;
    const newLiveSlideNumber =
      newSlideData && newData ? newData.get('currentSlide') : 0;
    const newUserSlideNumber =
      newSlideData && newData ? newData.get('userSlide') : undefined;
    const lectureId = PresentationData.currentLectureId(
      courseId,
      postPresentedData
    );

    // TODO refactor out conditional mess
    if (!newUserSlideNumber && currentUserSlideNumber) {
      DataRecordingUtil.recordDataItem({
        key: 'Post slide changed',
        id1: courseId,
        id2: lectureId,
        value1: currentLiveSlideNumber,
        value2: currentUserSlideNumber,
      });
    }

    if (newUserSlideNumber && newUserSlideNumber !== currentUserSlideNumber) {
      DataRecordingUtil.recordDataItem({
        key: 'Post slide changed',
        id1: courseId,
        id2: lectureId,
        value1: newUserSlideNumber,
      });
    } else if (
      currentLiveSlideNumber !== newLiveSlideNumber &&
      !currentUserSlideNumber
    ) {
      DataRecordingUtil.recordDataItem({
        key: 'Post slide changed',
        id1: this.props.courseId,
        id2: lectureId,
        value1: newLiveSlideNumber,
      });
    }
  }

  performRender() {
    const { courseId, postPresentedData, observerOnly } = this.props;
    const currentData = this.getData(this.props);
    const slideData = PresentationData.lastCurrentSlide(
      courseId,
      postPresentedData,
      false
    );
    const slideDataForPoll = PresentationData.lastCurrentSlide(
      courseId,
      postPresentedData
    );
    const userSlide = PresentationData.lastUserSlide(
      courseId,
      postPresentedData,
      false
    );
    const userSlideForPoll = PresentationData.lastUserSlide(
      courseId,
      postPresentedData
    );

    return (
      <PresentationRenderer
        currentSlide={!slideData ? 0 : currentData.get('currentSlide')}
        totalSlides={!slideData ? 0 : currentData.get('totalSlides')}
        userSlideNumber={!slideData ? undefined : currentData.get('userSlide')}
        slideImage={!slideData ? undefined : slideData.get('imageUrl')}
        userSlideImage={!userSlide ? undefined : userSlide.get('imageUrl')}
        unansweredPoll={
          !userSlideForPoll
            ? !slideDataForPoll
              ? false
              : slideDataForPoll.get('unansweredPoll')
            : userSlideForPoll.get('unansweredPoll')
        }
        presentationState={this.getState(currentData)}
        observerOnly={observerOnly}
      />
    );
  }
}

export default connect<any, void, IPostPresentationRendererContainerProps>(
  PresentationMappers.PresentationMapper
)(PostPresentationRendererContainer);
