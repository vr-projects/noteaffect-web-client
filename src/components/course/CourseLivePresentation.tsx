import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import isNull from 'lodash/isNull';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import ICourse from '../../models/ICourse';
import ILectureFrame from '../../models/ILectureFrame';
import ISlideNotes from '../../models/ISlideNotes';
import Localizer from '../../utilities/Localizer';
import PresentationState from '../../PresentationState';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import StrontiumSignalRHubBroadcastEvents from '../../broadcastEvents/StrontiumSignalRHubBroadcastEvents';
import LivePresentation from '../presentation/LivePresentation';
import PresentationNotesContainer, {
  NOTES_TYPE,
} from '../containers/PresentationNotesContainer';
import LiveQuestionContainer from '../containers/LiveQuestionContainer';
import PresentationQuestionsContainer from '../containers/PresentationQuestionsContainer';
import RightSidebar from '../layout/RightSidebar';
import AppMappers from '../../mappers/AppMappers';
import * as AppActions from '../../store/app/AppActions';
import ErrorUtil from '../../utilities/ErrorUtil';

interface IConnectedCourseLivePresentationProps extends DispatchProp<any> {
  isPresentationFullscreen: boolean;
}

interface ICourseLivePresentationProps {
  course: ICourse; // TODO Tech Debt refactor course to series
}

interface ICourseLivePresentationState {
  loading: LoadStates;
  notesVisible: boolean;
  smallScreenMode: boolean;
  questionsVisible: boolean;
  lectureId: number;
}

export class CourseLivePresentation extends SrUiComponent<
  IConnectedCourseLivePresentationProps & ICourseLivePresentationProps,
  ICourseLivePresentationState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      notesVisible: false,
      smallScreenMode: false,
      questionsVisible: false,
      lectureId: null,
    };
  }

  async onComponentMounted() {
    await this.registerForCourse();
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
      StrontiumSignalRHubBroadcastEvents.ReconnectSuccess,
      AppBroadcastEvents.TogglePresentationNotes,
      AppBroadcastEvents.TogglePresentationQuestions,
      AppBroadcastEvents.PresentationStarted,
      AppBroadcastEvents.PresentationStarting,
    ];
  }

  // TODO Tech debt refactor ALL AppBroadcastEvents to Redux, remove from project for future-proofing
  async onAppMessage(msg: SrAppMessage) {
    const { notesVisible, questionsVisible, lectureId } = this.state;
    const { course, isPresentationFullscreen, dispatch } = this.props;

    switch (true) {
      case msg.action === StrontiumSignalRHubBroadcastEvents.ReconnectSuccess:
        await this.registerForCourse();
        break;
      case msg.action === AppBroadcastEvents.TogglePresentationNotes:
        this.setPartial({ notesVisible: !notesVisible });
        break;
      case msg.action === AppBroadcastEvents.TogglePresentationQuestions:
        this.setPartial({ questionsVisible: !questionsVisible });
        break;
      case msg.action === AppBroadcastEvents.PresentationStarted &&
        !isPresentationFullscreen:
        dispatch(AppActions.toggleIsPresentationFullscreen(true));
        break;
      case msg.action === AppBroadcastEvents.PresentationStarting &&
        msg.data.seriesId === course.id &&
        msg.data.lectureId !== lectureId:
        this.setPartial({ lectureId: msg.data.lectureId });
        break;
    }
  }

  async registerForCourse() {
    const {
      dispatch,
      course: { id: courseId },
    } = this.props;

    this.setPartial({ loading: LoadStates.Loading });

    dispatch(PresentationActions.setRemoteNoteUpdatesEnabled(false));

    try {
      const resp = await ApiHelpers.createTo(
        'realtime',
        'RegisterFor',
        courseId
      );

      ErrorUtil.handleAPIErrors(
        resp,
        'There was an error starting the Live Presentation'
      );

      if (resp.good && (resp.data || []).length > 0) {
        const frames = resp.data as ILectureFrame[];
        const lectureId = resp.data[0].lectureId;

        this.setPartial({ lectureId: lectureId });

        // TODO tech debt wrap in try catch
        const notesResp = await ApiHelpers.read(`lectures/${lectureId}/notes`);

        if (notesResp.good) {
          const notesItems =
            (JSON.parse(notesResp.data) as ISlideNotes[]) || [];

          if (notesItems.length > 0) {
            notesItems.forEach(async (notesItem) => {
              await this.props.dispatch(
                PresentationActions.updateNotesData({
                  seriesId: courseId,
                  lectureId,
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

        const maxSlide = Math.max(...frames.map((f) => f.slide));
        frames.forEach(async (f) => {
          await this.props.dispatch(
            PresentationActions.updatePresentation({
              state: PresentationState.Live,
              courseId: this.props.course.id,
              lectureId: f.lectureId,
              slide: f.slide,
              totalSlides: maxSlide,
              id: f.id,
              sequence: f.sequence,
              imageUrl: f.imageUrl,
            })
          );
        });
      }

      dispatch(PresentationActions.setRemoteNoteUpdatesEnabled(true));
      this.setPartial({ loading: LoadStates.Unloaded });
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const { course, isPresentationFullscreen } = this.props;
    const {
      loading,
      notesVisible,
      questionsVisible,
      smallScreenMode,
      lectureId,
    } = this.state;
    const collapsedNotes = !notesVisible;
    const collapsedQuestions = !questionsVisible;

    if (isNull(course)) return null;

    return (
      <>
        <div
          className={
            'course-presentation ' +
            (isPresentationFullscreen ? 'full-screen' : '')
          }
        >
          <div className="presentation-view">
            <LivePresentation
              loading={loading}
              isPresentationFullscreen={isPresentationFullscreen}
              courseId={course.id}
              lectureId={lectureId}
            />
          </div>
          <LiveQuestionContainer courseId={course.id} />
        </div>

        {/* //** Notes Sidebar */}
        <RightSidebar
          isCollapsed={collapsedNotes}
          smallScreenMode={smallScreenMode}
          title={Localizer.get('Segment Notes')}
          className={`${isPresentationFullscreen ? 'full-screen' : ''}`}
          onClose={() => this.setPartial({ notesVisible: false })}
        >
          <div className="right-sidebar-content">
            <PresentationNotesContainer
              type={NOTES_TYPE.LIVE}
              collapsed={collapsedNotes}
              courseId={course.id}
            />
          </div>
        </RightSidebar>

        {/* //** Questions Sidebar */}
        <RightSidebar
          isCollapsed={collapsedQuestions}
          smallScreenMode={smallScreenMode}
          title={Localizer.get('Questions')}
          className={`${isPresentationFullscreen ? 'full-screen' : ''}`}
          onClose={() => this.setPartial({ questionsVisible: false })}
        >
          <PresentationQuestionsContainer
            collapsed={collapsedQuestions}
            courseId={course.id}
          />
        </RightSidebar>
      </>
    );
  }
}

export default connect<
  IConnectedCourseLivePresentationProps,
  void,
  ICourseLivePresentationProps
>(AppMappers.AppMapper)(CourseLivePresentation);
