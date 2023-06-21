import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import PresentationMappers from '../../mappers/PresentationMappers';
import PresentationRenderer from '../presentation/PresentationRenderer';
import PresentationState from '../../PresentationState';
import PresentationData from '../../utilities/PresentationData';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import DataRecordingUtil from '../../utilities/DataRecordingUtil';
import * as PresentationActions from '../../store/presentation/PresentationActions';

interface IConnectedPresentationRendererContainerProp
  extends DispatchProp<any> {
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
}
interface IPresentationRendererContainerProps {
  courseId: number;
}

interface IPresentationRendererContainerState {}

class PresentationRendererContainer extends SrUiComponent<
  IConnectedPresentationRendererContainerProp &
    IPresentationRendererContainerProps,
  IPresentationRendererContainerState
> {
  getData(
    props: IConnectedPresentationRendererContainerProp &
      IPresentationRendererContainerProps
  ) {
    return PresentationData.currentData(props.courseId, props.presentedData);
  }

  getState(currentData: IImmutablePresentedDataMap) {
    return currentData
      ? currentData.get('state') || PresentationState.Unstarted
      : PresentationState.Unstarted;
  }

  onNewProps(
    props: IConnectedPresentationRendererContainerProp &
      IPresentationRendererContainerProps
  ) {
    const { courseId, presentedData, dispatch } = this.props;
    const currentData = this.getData(this.props);
    const currentState = this.getState(currentData);
    const currentSlideData = PresentationData.lastCurrentSlide(
      courseId,
      presentedData
    );
    const newData = this.getData(props);
    const newState = this.getState(newData);
    const newSlideData = PresentationData.lastCurrentSlide(
      courseId,
      props.presentedData
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
      props.presentedData
    );

    if (!newUserSlideNumber && currentUserSlideNumber) {
      DataRecordingUtil.recordDataItem({
        key: 'Caught up to live presentation',
        id1: courseId,
        id2: lectureId,
        value1: currentLiveSlideNumber,
        value2: currentUserSlideNumber,
      });
    }

    if (newUserSlideNumber && newUserSlideNumber !== currentUserSlideNumber) {
      DataRecordingUtil.recordDataItem({
        key: 'Viewed non-current slide',
        id1: courseId,
        id2: lectureId,
        value1: newUserSlideNumber,
      });
    } else if (
      currentLiveSlideNumber !== newLiveSlideNumber &&
      !currentUserSlideNumber
    ) {
      DataRecordingUtil.recordDataItem({
        key: 'Live slide changed',
        id1: courseId,
        id2: lectureId,
        value1: newLiveSlideNumber,
      });
    }

    if (
      currentState === PresentationState.Unstarted &&
      newState === PresentationState.Live
    ) {
      DataRecordingUtil.recordDataItem({
        key: 'Started viewing new presentation',
        id1: courseId,
        id2: lectureId,
      });
      this.broadcast(AppBroadcastEvents.PresentationStarted);

      dispatch(PresentationActions.updateUserSlide(courseId, lectureId, 1));
    }
  }

  performRender() {
    const { courseId, presentedData } = this.props;
    let currentData = this.getData(this.props);
    let slideData = PresentationData.lastCurrentSlide(courseId, presentedData);
    let userSlide = PresentationData.lastUserSlide(courseId, presentedData);

    return (
      <PresentationRenderer
        currentSlide={!slideData ? 0 : currentData.get('currentSlide')}
        totalSlides={!slideData ? 0 : currentData.get('totalSlides')}
        userSlideNumber={!slideData ? undefined : currentData.get('userSlide')}
        slideImage={!slideData ? undefined : slideData.get('imageUrl')}
        userSlideImage={!userSlide ? undefined : userSlide.get('imageUrl')}
        presentationState={this.getState(currentData)}
        observerOnly={false}
      />
    );
  }
}

export default connect<
  IConnectedPresentationRendererContainerProp,
  void,
  IPresentationRendererContainerProps
>(PresentationMappers.PresentationMapper)(PresentationRendererContainer);
