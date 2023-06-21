import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import { FaFileAlt, FaBook, FaList, FaBolt } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  QueryUtility,
  Animated,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import ICourse from '../../models/ICourse';
import {
  GENERAL_COMPONENT,
  COURSE_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import CourseLivePresentation from './CourseLivePresentation';
import CourseLectures from './CourseLectures';
import MenuView from '../controls/MenuView';
import MenuNavItem from '../controls/MenuNavItem';
import CourseOverview from './CourseOverview';
import QuestionsCountIcon from '../display/QuestionsCountIcon';
import CourseQuestions from './CourseQuestions';
import { getIsObserverOnly } from '../../services/ParticipantPermissionService';
import { getIsSecuredSeries } from '../../services/SharePermissionService';
import StrontiumSignalRHubBroadcastEvents from '../../broadcastEvents/StrontiumSignalRHubBroadcastEvents';
import SecurityOverlay from '../security/SecurityOverlay';
import ISecurityError from '../../models/ISecurityError';
import SeriesDocuments from '../documents/SeriesDocuments';
import * as SecurityActions from '../../store/security/SecurityActions';
import * as PresentationActions from '../../store/presentation/PresentationActions';

interface IConnectedCourseComponentProps extends DispatchProp<any> {
  isSecurityMode: boolean;
  isSecurityAppOn: boolean;
  isSecurityAppLoading: boolean;
  securityErrors: ISecurityError[];
  isSecurityCheckDone: boolean;
  userInformation?: IImmutableObject<IUserInformation>;
  isCorpVersion?: Boolean;
}
interface ICourseComponentProps {
  menu: string;
  lectureId: number;
  courseLoading: LoadStates;
  course: ICourse;
  query: any;
}

interface ICourseComponentState {
  viewLoading: boolean;
}

enum MENU_VIEWS {
  OVERVIEW = 'overview',
  LECTURES = 'lectures', // presentations for corp
  DOCUMENTS = 'documents',
  QUESTIONS = 'questions',
  LIVE = 'live',
}

class CourseComponent extends SrUiComponent<
  IConnectedCourseComponentProps & ICourseComponentProps,
  ICourseComponentState
> {
  private _allowedMenus: string[];

  initialState() {
    return {
      viewLoading: true,
    };
  }

  async onComponentMounted() {
    const { dispatch } = this.props;
    await dispatch(SecurityActions.resetSecurityStore());
    await this.setupView(this.props);
  }

  /**
   * Method determines if is a non-Open series
   * Dispatches action to set is secure series to store
   * and action to initialize the pinging and launching of the Security App
   * hasInitSecureMode flag is to prevent rerenders calling endpoint more than once
   */
  private hasInitSecureMode = false;
  async initSecurityMode() {
    if (this.hasInitSecureMode) {
      return;
    }

    this.hasInitSecureMode = true;
    const { course, dispatch } = this.props;
    await dispatch(SecurityActions.resetSecurityStore());

    const isSecuredSeries = getIsSecuredSeries(course.sharePermission);
    await dispatch(SecurityActions.setIsSecurityMode(isSecuredSeries));
    await dispatch(SecurityActions.initSecurityApp(isSecuredSeries, course.id));
  }

  onNewProps(props: ICourseComponentProps) {
    this.setupView(props);
  }

  /**
   * Method called when component destroyed, makes call to Security App endpoint
   * to shut it down
   */
  async onComponentWillUnmount() {
    const { dispatch, course } = this.props;
    const isSecuredSeries = getIsSecuredSeries(course.sharePermission);
    await dispatch(SecurityActions.shutDownSecurityApp(isSecuredSeries));
  }

  getHandles() {
    return [StrontiumSignalRHubBroadcastEvents.ReconnectSuccess];
  }

  async onAppMessage(msg: SrAppMessage) {
    if (msg.action === StrontiumSignalRHubBroadcastEvents.ReconnectSuccess) {
      await this.registerForUpdates(this.props);
    }
  }

  async setupView(props: ICourseComponentProps) {
    if (isNull(props.course)) {
      return;
    }

    await this.registerForUpdates(props);

    this._allowedMenus = [
      MENU_VIEWS.OVERVIEW,
      MENU_VIEWS.LECTURES,
      MENU_VIEWS.DOCUMENTS,
      MENU_VIEWS.QUESTIONS,
      MENU_VIEWS.LIVE,
    ];

    await this.initSecurityMode();

    this.forceUpdate();

    this.setPartial({
      viewLoading: false,
    });
  }

  async registerForUpdates(props) {
    await ApiHelpers.createTo(
      'realtime',
      'RegisterForUpdates',
      props.course.id
    );
  }

  allowedMenu() {
    const { query } = this.props;
    const { viewLoading } = this.state;

    if (viewLoading) return null;

    if (
      isEmpty(query) ||
      !has(query, 'menu') ||
      (has(query, 'menu') && !(this._allowedMenus || []).includes(query.menu))
    ) {
      return MENU_VIEWS.OVERVIEW;
    }

    return query.menu;
  }

  handleShowMenuView = async (id) => {
    const {
      dispatch,
      course: { id: courseId },
    } = this.props;

    await dispatch(PresentationActions.setIsOnLivePresentationView(false));
    await dispatch(SecurityActions.changedCourseTabsStopMonitoring(courseId));

    this.updateQuery(
      QueryUtility.buildQuery({
        menu: id,
        lecture: undefined,
        initialSlide: undefined,
      })
    );
  };

  performRender() {
    const {
      isSecurityMode,
      isSecurityAppLoading,
      securityErrors,
      isSecurityCheckDone,
      query,
      course,
      lectureId,
      isCorpVersion,
      userInformation,
    } = this.props;
    const { viewLoading } = this.state;

    const enableNavButtons =
      isSecurityCheckDone &&
      (!isSecurityMode ||
        (isSecurityMode && !isSecurityAppLoading && isEmpty(securityErrors)));

    const { id: currentUserId } = userInformation.toJS();

    const hideLivePresentation =
      isCorpVersion && getIsObserverOnly(course, currentUserId);

    let initialSlide = parseInt(query.initialSlide);
    initialSlide = isNaN(initialSlide) ? null : initialSlide;

    if (viewLoading) return null;

    return (
      <div className="course-component">
        <SecurityOverlay
          series={course}
          routesToMonitor={[
            'menu=lectures&lecture',
            'menu=live',
            'menu=documents',
          ]}
        />

        {!isNull(course) && (
          <>
            <MenuView
              header={course.name}
              onNavItemSelected={(id) => this.handleShowMenuView(id)}
              currentSelection={this.allowedMenu()}
            >
              {/* //** Series/Course/Meeting Overview Tab and View */}
              <MenuNavItem
                id={MENU_VIEWS.OVERVIEW}
                disabled={!enableNavButtons}
                content={() => (
                  <Animated in key="overview-tab">
                    <CourseOverview course={course} lectureId={lectureId} />
                  </Animated>
                )}
              >
                <FaBook />
                <span>
                  {Localizer.getFormatted(COURSE_COMPONENT.MENU_OVERVIEW)}
                </span>
              </MenuNavItem>
              {/* //** Presentations/Lectures Tab and View */}
              <MenuNavItem
                id={MENU_VIEWS.LECTURES}
                disabled={!enableNavButtons}
                content={() => (
                  <Animated in key="lectures-tab">
                    <CourseLectures
                      initialSlide={initialSlide}
                      course={course}
                      lectureId={lectureId}
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
                disabled={!enableNavButtons}
                content={() => (
                  <Animated in key="documents-tab">
                    <SeriesDocuments series={course} />
                  </Animated>
                )}
              >
                <FaFileAlt />
                <span>
                  {Localizer.getFormatted(GENERAL_COMPONENT.DOCUMENTS)}
                </span>
              </MenuNavItem>
              {/* //** Questions Tab and View */}
              <MenuNavItem
                id={MENU_VIEWS.QUESTIONS}
                disabled={!enableNavButtons}
                content={() => (
                  <Animated in key="questions-tab">
                    <CourseQuestions course={course} />
                  </Animated>
                )}
              >
                <QuestionsCountIcon courseId={course.id} />
                <span>{Localizer.get('Questions')}</span>
              </MenuNavItem>
              {/* //** Live Presentation Tab and View */}
              {!hideLivePresentation && (
                <MenuNavItem
                  id={MENU_VIEWS.LIVE}
                  disabled={!enableNavButtons}
                  content={() => <CourseLivePresentation course={course} />}
                >
                  <FaBolt />
                  <span>{Localizer.get('Live Presentation')}</span>
                </MenuNavItem>
              )}
            </MenuView>
          </>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedCourseComponentProps,
  {},
  ICourseComponentProps
>(AppMappers.AppMapper)(CourseComponent);
