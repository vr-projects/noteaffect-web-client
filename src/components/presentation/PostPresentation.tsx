import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import { SrUiComponent } from 'react-strontium';
import { DispatchProp, connect } from 'react-redux';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import ILecture from '../../models/ILecture';
import ICourse from '../../models/ICourse';
import PostPresentationControlsContainer from '../containers/PostPresentationControlsContainer';
import PostPresentationRendererContainer from '../containers/PostPresentationRendererContainer';
import PollReviewer from '../course/PollReviewer';
import PresentationData from '../../utilities/PresentationData';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import Immutable from 'immutable';
import PostDrawableControlsContainer from '../containers/PostDrawableControlsContainer';
import PostDrawableContainer from '../containers/PostDrawableContainer';
import PresentationPlaybackControls from '../controls/PresentationPlaybackControls';
import PresentationMappers from '../../mappers/PresentationMappers';
import MultiRadioToggler, {
  IOption,
} from 'components/controls/MultiRadioToggler';
import * as DrawableSurfaceActions from '../../store/drawable_surface/DrawableSurfaceActions';
import SecurityShieldWall from '../security/SecurityShieldWall';
import ISecurityError from '../../models/ISecurityError';
import ISecurityViolation from '../../models/ISecurityViolation';

export enum SHARE_ANNOTATIONS_TYPE {
  MINE = 'mine',
  SHARED = 'shared',
}

const toggleOptions: IOption[] = [
  { label: 'Mine', value: SHARE_ANNOTATIONS_TYPE.MINE, style: 'info' },
  { label: 'Shared', value: SHARE_ANNOTATIONS_TYPE.SHARED, style: 'info' },
];

interface IConnectedPostPresentationProps extends DispatchProp<any> {
  isSecurityMode?: boolean;
  isSecurityAppLoading?: boolean;
  securityErrors?: ISecurityError[];
  securityViolations?: ISecurityViolation[];
  postPresentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
}

interface IPostPresentationProps {
  fullscreen: boolean;
  course: ICourse;
  lecture: ILecture;
  currentUserId: number;
  isSharedCourse: boolean;
  hasSharedAnnotations: boolean;
  isCorpVersion: boolean;
  observerOnly: boolean;
}

interface IPostPresentationState {
  containerRef: HTMLDivElement;
  showSharedAnnotations: boolean;
}

class PostPresentation extends SrUiComponent<
  IConnectedPostPresentationProps & IPostPresentationProps,
  IPostPresentationState
> {
  initialState() {
    return {
      containerRef: undefined,
      showAnnotationsType: null,
      showSharedAnnotations: false,
    };
  }

  onComponentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(DrawableSurfaceActions.updateDrawingEnabled(false));
  }

  updateRef(ref: HTMLDivElement) {
    const { dispatch } = this.props;
    const { containerRef } = this.state;
    if (!containerRef) {
      this.setState({ containerRef: ref });
      dispatch(PresentationActions.updateUiContainer(ref));
    }
  }

  toggleSharedAnnotations(val: SHARE_ANNOTATIONS_TYPE) {
    const { dispatch } = this.props;
    const isShared = val === SHARE_ANNOTATIONS_TYPE.SHARED;

    this.setPartial({
      showSharedAnnotations: val === SHARE_ANNOTATIONS_TYPE.SHARED,
    });

    dispatch(DrawableSurfaceActions.updateDrawingEnabled(!isShared));
  }

  performRender() {
    const {
      isSecurityMode,
      isSecurityAppLoading,
      securityErrors,
      securityViolations,
      course: { id: courseId },
      postPresentedData,
      fullscreen,
      lecture,
      currentUserId,
      isSharedCourse,
      hasSharedAnnotations,
      isCorpVersion,
      observerOnly,
      dispatch,
    } = this.props;
    const { showSharedAnnotations } = this.state;

    const data = PresentationData.currentData(courseId, postPresentedData);
    const currentSlide = data
      ? data.get('userSlide') || data.get('currentSlide')
      : 1;
    const showShieldWall =
      isSecurityMode &&
      (isSecurityAppLoading ||
        !isEmpty(securityErrors) ||
        !isEmpty(securityViolations));

    const showPresentation =
      !isSecurityMode ||
      (isSecurityMode &&
        !isSecurityAppLoading &&
        isEmpty(securityErrors) &&
        isEmpty(securityViolations));

    return (
      <div
        className="post-presentation presentation"
        ref={(r) => this.updateRef(r)}
      >
        {showShieldWall && (
          <SecurityShieldWall
            isSecurityAppLoading={isSecurityAppLoading}
            securityErrors={securityErrors}
          />
        )}
        {showPresentation && (
          <div className="post-presentation-wrapper">
            <div className="presentation-menu">
              {isCorpVersion && isSharedCourse && hasSharedAnnotations && (
                <>
                  <MultiRadioToggler
                    label={`Show Annotations:`}
                    options={toggleOptions}
                    onToggled={(val) => this.toggleSharedAnnotations(val)}
                    defaultOptionIndex={0}
                    disable={false}
                    className="shared-annotations-toggler"
                  />
                </>
              )}

              <PostDrawableControlsContainer fullscreen={fullscreen} />
            </div>
            <div className="presentation-content">
              <PostPresentationRendererContainer
                courseId={courseId}
                observerOnly={observerOnly}
              />

              <PostDrawableContainer
                courseId={courseId}
                currentUserId={currentUserId}
                isSharedCourse={isSharedCourse}
                showSharedAnnotations={showSharedAnnotations}
              />
            </div>
            <div className="presentation-controls-wrapper">
              <PostPresentationControlsContainer
                courseId={courseId}
                lecture={lecture}
              />
              <PresentationPlaybackControls
                isInstructor={false}
                lecture={lecture}
                currentSlide={currentSlide}
                onPlaybackSlideChanged={(slideNumber) =>
                  dispatch(
                    PresentationActions.updatePostCurrentSlide(
                      courseId,
                      lecture.id,
                      slideNumber
                    )
                  )
                }
              />
            </div>
          </div>
        )}

        <PollReviewer
          lecture={lecture}
          selectedSlideNumber={currentSlide}
          observerOnly={observerOnly}
        />
      </div>
    );
  }
}

export default connect<
  IConnectedPostPresentationProps,
  void,
  IPostPresentationProps
>(PresentationMappers.PresentationMapper)(PostPresentation);
