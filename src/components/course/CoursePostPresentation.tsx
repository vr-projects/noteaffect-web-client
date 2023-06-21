import * as React from 'react';
import isNull from 'lodash/isNull';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  ApiHelpers,
  SrAppMessage,
  LoadMask,
} from 'react-strontium';
import ICourse from '../../models/ICourse';
import Localizer from '../../utilities/Localizer';
import PresentationState from '../../PresentationState';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import { DispatchProp, connect } from 'react-redux';
import ISlideNotes from '../../models/ISlideNotes';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import ILecture from '../../models/ILecture';
import PostPresentation from '../presentation/PostPresentation';
import PresentationNotesContainer, {
  NOTES_TYPE,
} from '../containers/PresentationNotesContainer';
import PostQuestionModalContainer from '../containers/PostQuestionModalContainer';
import RightSidebar from '../layout/RightSidebar';
import AppMapper from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import { getIsObserverOnly } from '../../services/ParticipantPermissionService';

interface IConnectedCoursePostPresentationProps extends DispatchProp<any> {
  sessionId?: string;
  userInformation?: IImmutableObject<IUserInformation>;
  isCorpVersion?: boolean;
}

interface ICoursePostPresentationProps {
  course: ICourse;
  lecture: ILecture;
  initialSlide?: number;
}

interface ICourseLivePresentationState {
  loading: LoadStates;
  notesVisible: boolean;
  smallScreenMode: boolean;
  isSharedCourse: boolean;
  hasSharedNotesAnnotations: boolean;
}

export class CoursePostPresentation extends SrUiComponent<
  IConnectedCoursePostPresentationProps & ICoursePostPresentationProps,
  ICourseLivePresentationState
> {
  initialState() {
    const {
      course: { sharedBy },
    } = this.props;

    return {
      loading: LoadStates.Unloaded,
      notesVisible: false,
      smallScreenMode: false,
      questionsVisible: false,
      lectureId: null,
      isSharedCourse: !isNull(sharedBy),
      hasSharedNotesAnnotations: false,
    };
  }

  async onComponentMounted() {
    await this.setupPresentation();
    this.onWindowResized();
  }

  resizeCallback() {
    return () => this.onWindowResized();
  }

  onWindowResized() {
    this.setPartial({ smallScreenMode: window.innerWidth <= 750 });
  }

  getHandles() {
    return [
      AppBroadcastEvents.TogglePresentationNotes,
      AppBroadcastEvents.RefreshFrames,
    ];
  }

  async onAppMessage(msg: SrAppMessage) {
    const { lecture } = this.props;
    const { notesVisible } = this.state;

    switch (true) {
      case msg.action === AppBroadcastEvents.TogglePresentationNotes:
        this.setPartial({ notesVisible: !notesVisible });
        return;
      case msg.action === AppBroadcastEvents.RefreshFrames &&
        msg.data.lectureId === lecture.id:
        this.setupPresentation(false);
        return;
      default:
        return;
    }
  }

  // Method does API call to GET notes and sets to the store through several layers of methods
  async setupPresentation(reset: boolean = true) {
    const {
      dispatch,
      lecture,
      course,
      initialSlide,
      userInformation,
    } = this.props;
    const currentUserId = userInformation.toJS().id;
    let hasSharedNotesAnnotations = false;

    this.setPartial({ loading: LoadStates.Loading });

    dispatch(PresentationActions.setRemoteNoteUpdatesEnabled(false));

    const frames = lecture ? lecture.slideData : null;

    if (frames && frames.length > 0) {
      if (reset) {
        dispatch(
          PresentationActions.resetPostPresentation(course.id, currentUserId)
        );
        dispatch(
          PresentationActions.updatePostUserSlide(course.id, lecture.id, null)
        );

        const notesResp = await ApiHelpers.read(`lectures/${lecture.id}/notes`);

        if (notesResp.good) {
          const notesItems =
            (JSON.parse(notesResp.data) as ISlideNotes[]) || [];

          hasSharedNotesAnnotations = notesItems.some(
            (note) => note.userId !== currentUserId && note.sharedNote
          );

          if (notesItems.length > 0) {
            notesItems.forEach(async (notesItem) => {
              await dispatch(
                PresentationActions.setPostNotesDataToStore({
                  seriesId: course.id,
                  lectureId: lecture.id,
                  authorUserId: notesItem.userId,
                  currentUserId: currentUserId,
                  slide: notesItem.slide,
                  notesData: {
                    annotations: JSON.parse(notesItem.annotations),
                    notes: { notes: notesItem.notes },
                  },
                })
              );
            });
          }
        }
      }

      const maxSlide = Math.max(...frames.map((f) => f.slide));

      frames.forEach(async (f) => {
        await dispatch(
          PresentationActions.updatePostPresentation({
            state: PresentationState.Live,
            courseId: course.id,
            lectureId: f.lectureId,
            currentUserId: currentUserId,
            slide: f.slide,
            totalSlides: maxSlide,
            id: f.id,
            sequence: f.sequence,
            imageUrl: f.imageUrl,
            unansweredPoll: f.unansweredPoll,
            initialSlide: reset ? initialSlide : null,
          })
        );
      });
    }

    dispatch(PresentationActions.setRemoteNoteUpdatesEnabled(true));

    this.setPartial({
      loading: LoadStates.Succeeded,
      hasSharedNotesAnnotations,
    });
  }

  performRender() {
    if (this.state.loading !== LoadStates.Succeeded) {
      return null;
    }
    const { course, lecture, userInformation, isCorpVersion } = this.props;
    const {
      loading,
      notesVisible,
      smallScreenMode,
      isSharedCourse,
      hasSharedNotesAnnotations,
    } = this.state;
    const collapsedNotes = !notesVisible;
    const currentUserId = userInformation.toJS().id;
    const observerOnly = getIsObserverOnly(course, currentUserId);

    return (
      <div className="course-post-presentation">
        <div className="course-presentation">
          <div className="presentation-view">
            <PostPresentation
              isCorpVersion={isCorpVersion}
              fullscreen={false}
              course={course}
              lecture={lecture}
              currentUserId={currentUserId}
              isSharedCourse={isSharedCourse}
              hasSharedAnnotations={hasSharedNotesAnnotations}
              observerOnly={observerOnly}
            />
          </div>
          <PostQuestionModalContainer
            courseId={course.id}
            observerOnly={observerOnly}
          />
          <LoadMask state={loading} />
        </div>

        <RightSidebar
          isCollapsed={collapsedNotes}
          smallScreenMode={smallScreenMode}
          title={Localizer.get('Segment Notes')}
          onClose={() => this.setPartial({ notesVisible: false })}
        >
          <div className="right-sidebar-content">
            <PresentationNotesContainer
              type={NOTES_TYPE.POST}
              collapsed={collapsedNotes}
              courseId={course.id}
              isSharedCourse={isSharedCourse}
              hasSharedNotes={hasSharedNotesAnnotations}
            />
          </div>
        </RightSidebar>

        <LoadIndicator
          state={loading}
          loadingMessage={Localizer.get('Getting presentation information...')}
        />
      </div>
    );
  }
}

export default connect<
  IConnectedCoursePostPresentationProps,
  {},
  ICoursePostPresentationProps
>(AppMapper.AppMapper)(CoursePostPresentation);
