import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import PresentationControls from '../presentation/PresentationControls';
import PresentationData from '../../utilities/PresentationData';
import PresentationMappers from '../../mappers/PresentationMappers';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import PresentationState from '../../PresentationState';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';

interface IConnectedPresentationControlsContainer extends DispatchProp<any> {
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
}
interface IPresentationControlsContainerProps {
  lectureId: number;
  courseId: number;
}

interface IPresentationControlsContainerState {}

class PresentationControlsContainer extends SrUiComponent<
  IConnectedPresentationControlsContainer & IPresentationControlsContainerProps,
  IPresentationControlsContainerState
> {
  changeSlide(slideNumber: number) {
    const { dispatch, courseId, lectureId } = this.props;
    dispatch(
      PresentationActions.updateUserSlide(courseId, lectureId, slideNumber)
    );
  }

  performRender() {
    const { courseId, presentedData } = this.props;

    let data = PresentationData.currentData(courseId, presentedData);
    let maxSlides = PresentationData.maxAllowedSlide(courseId, presentedData);

    return (
      <PresentationControls
        maxSlides={maxSlides}
        presentationState={
          data
            ? data.get('state') || PresentationState.Unstarted
            : PresentationState.Unstarted
        }
        changeSlide={(slide) => this.changeSlide(slide)}
        currentSlide={!data ? 0 : data.get('currentSlide')}
        availableSlides={
          !data
            ? []
            : data
                .get('presentedSlides')
                .map((ps) => ps.get('slide'))
                .toArray()
        }
        userSlide={!data ? undefined : data.get('userSlide')}
      />
    );
  }
}

export default connect<
  IConnectedPresentationControlsContainer,
  void,
  IPresentationControlsContainerProps
>(PresentationMappers.PresentationMapper)(PresentationControlsContainer);
