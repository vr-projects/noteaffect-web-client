import * as React from 'react';
import { FaStar, FaUserAlt, FaList, FaSignal, FaFileAlt } from 'react-icons/fa';
import { BsBellFill } from 'react-icons/bs';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  QueryUtility,
  Animated,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import ICourse from '../../../models/ICourse';
import { GENERAL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import AsyncComponentLoader from '../../AsyncComponentLoader';
import MenuView from '../../controls/MenuView';
import MenuNavItem from '../../controls/MenuNavItem';
import InstructorCourseLectures from './InstructorCourseLectures';
import QuestionsCountIcon from '../../display/QuestionsCountIcon';
import StrontiumSignalRHubBroadcastEvents from 'broadcastEvents/StrontiumSignalRHubBroadcastEvents';
import SeriesDocuments from '../../documents/SeriesDocuments';

enum MENU_VIEWS {
  LECTURES = 'lectures', // presentations for corp
  QUESTIONS = 'questions',
  ENGAGEMENT = 'engagement',
  ANALYTICS = 'analytics',
  PARTICIPANTS = 'participants',
  DOCUMENTS = 'documents',
  SECURITY = 'security',
}

interface IInstructorCourseDetailProps {
  menu: string;
  lectureId: number;
  documentId: number;
  courseLoading: LoadStates;
  course: ICourse;
  userId: number;
  query: any;
}

interface IInstructorCourseDetailState {}

export default class InstructorCourseDetail extends SrUiComponent<
  IInstructorCourseDetailProps,
  IInstructorCourseDetailState
> {
  private _allowedMenus: string[];

  onComponentMounted() {
    this.setupView(this.props);
  }

  onNewProps(props: IInstructorCourseDetailProps) {
    this.setupView(props);
  }

  getHandles() {
    return [StrontiumSignalRHubBroadcastEvents.ReconnectSuccess];
  }

  async onAppMessage(msg: SrAppMessage) {
    if (msg.action === StrontiumSignalRHubBroadcastEvents.ReconnectSuccess) {
      await this.registerForUpdates(this.props);
    }
  }

  async registerForUpdates(props) {
    await ApiHelpers.createTo(
      'realtime',
      'RegisterForUpdates',
      props.course.id
    );
  }

  async setupView(props: IInstructorCourseDetailProps) {
    if (!props.course) {
      return;
    }

    await this.registerForUpdates(props);

    this._allowedMenus = [
      'lectures',
      'questions',
      'engagement',
      'analytics',
      'participants',
      'documents',
      'security',
    ];

    this.forceUpdate();
  }

  allowedMenu() {
    if (
      !this.props.menu ||
      !this._allowedMenus ||
      this._allowedMenus.indexOf(this.props.menu) === -1
    ) {
      return 'lectures';
    }

    return this.props.menu;
  }

  performRender() {
    const {
      query,
      courseLoading,
      course,
      lectureId,
      documentId,
      userId,
    } = this.props;
    let initialSlide = parseInt(query.initialSlide);
    initialSlide = isNaN(initialSlide) ? null : initialSlide;

    return (
      <div className="instructor-course-detail course-overview">
        <LoadIndicator
          state={courseLoading}
          loadingMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.LOADING_COURSE_MEETING
          )}
          errorMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.ERROR_COURSE_MEETING
          )}
        />
        {course ? (
          <MenuView
            header={course.name}
            onNavItemSelected={(id) =>
              this.updateQuery(QueryUtility.buildQuery({ menu: id }, true))
            }
            currentSelection={this.allowedMenu()}
          >
            {/* //** Presentations/Lectures Tab and View */}
            <MenuNavItem
              id={MENU_VIEWS.LECTURES}
              content={() => (
                <Animated in key="lectures-tab">
                  <InstructorCourseLectures
                    course={course}
                    lectureId={lectureId}
                    initialSlide={initialSlide}
                  />
                </Animated>
              )}
            >
              <FaList />
              <span>
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.LECTURES_PRESENTATIONS
                )}
              </span>
            </MenuNavItem>
            {/* //** Documents Tab and View */}
            <MenuNavItem
              id={MENU_VIEWS.DOCUMENTS}
              content={() => (
                <Animated in key="documents-tab">
                  <SeriesDocuments series={course} isPresenter />
                </Animated>
              )}
            >
              <FaFileAlt />
              <span>{Localizer.getFormatted(GENERAL_COMPONENT.DOCUMENTS)}</span>
            </MenuNavItem>
            {/* //** Participant Questions Tab and View */}
            <MenuNavItem
              id={MENU_VIEWS.QUESTIONS}
              content={() => (
                <Animated in key="questions-tab">
                  <AsyncComponentLoader
                    loader={() => import('./InstructorCourseQuestions')}
                    course={course}
                  />
                </Animated>
              )}
            >
              <QuestionsCountIcon isInstructor courseId={course.id} />
              <span>
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.STUDENT_PARTICIPANT_QUESTIONS
                )}
              </span>{' '}
            </MenuNavItem>
            {/* //** Engagement Tab and View */}
            <MenuNavItem
              id={MENU_VIEWS.ENGAGEMENT}
              content={() => (
                <Animated in key="engagement-tab">
                  <AsyncComponentLoader
                    loader={() => import('../../shared/CourseEngagement')}
                    course={course}
                    lectureId={lectureId}
                    userId={userId}
                    isDepartment={false}
                  />
                </Animated>
              )}
            >
              <FaStar />
              <span>{Localizer.get('Engagement')}</span>
            </MenuNavItem>
            {/* //** Analytics Tab and View */}
            <MenuNavItem
              id={MENU_VIEWS.ANALYTICS}
              content={() => (
                <Animated in key="analytics-tab">
                  <AsyncComponentLoader
                    loader={() => import('../../shared/CourseAnalytics')}
                    isDepartment={false}
                    course={course}
                    lectureId={lectureId}
                    documentId={documentId}
                  />
                </Animated>
              )}
            >
              <FaSignal />
              <span>{Localizer.get('Analytics')}</span>
            </MenuNavItem>
            {/* //** Participants Tab and View */}
            <MenuNavItem
              id={MENU_VIEWS.PARTICIPANTS}
              content={() => (
                <Animated in key="participants-tab">
                  <AsyncComponentLoader
                    loader={() => import('./CourseParticipantsPage')}
                    lectureId={lectureId}
                    course={course}
                    participant={userId}
                  />
                </Animated>
              )}
            >
              <FaUserAlt />
              <span>{Localizer.get('Participants')}</span>
            </MenuNavItem>
            {/* //** Security Tab and View */}
            {course.sharePermission > 1 && (
              <MenuNavItem
                id={MENU_VIEWS.SECURITY}
                content={() => (
                  <Animated in key="security-tab">
                    <AsyncComponentLoader
                      loader={() => import('./CourseSecurityEvents')}
                      course={course}
                      lectureId={lectureId}
                      query={query}
                    />
                  </Animated>
                )}
              >
                <BsBellFill
                  className={`${course.hasNewViolation ? 'text-warning' : ''}`}
                />
                <span>{Localizer.get('Security Events')}</span>
              </MenuNavItem>
            )}
          </MenuView>
        ) : null}
      </div>
    );
  }
}
