import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment'; // TODO Tech Debt use DateFormatUtil with userTimezone from AppMapper
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  SrAppMessage,
} from 'react-strontium';
import {
  INSTRUCTOR_COURSES_COMPONENT,
  COURSES_COMPONENT,
  GENERAL_COMPONENT,
} from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import SeriesState from '../../../enums/SeriesState';
import ICourse from '../../../models/ICourse';
import SearchFilterInput from '../../controls/SearchFilterInput';
import ListCalendarRadioToggler, {
  VIEW_TYPE,
} from '../../controls/ListCalendarRadioToggler';
import SortByDropdown from '../../controls/SortByDropdown';
import InstructorCourseGroup from './InstructorCourseGroup';
import CorpAddMeetingModalButton from '../../corp/CorpAddMeetingModalButton';
import CorpEditMeetingModal from '../../corp/CorpEditMeetingModal';
import CorpDeleteMeetingModal from '../../corp/CorpDeleteMeetingModal';
import AppMappers from '../../../mappers/AppMappers';
import EditParticipantsModal from '../../shared/EditParticipantsModal';
import CorpMeetingsZero from '../../corp/CorpMeetingsZero';
import DateFormatUtil from '../../../utilities/DateFormatUtil';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';
import SystemRoleService from '../../../services/SystemRoleService';
import SystemRoles from '../../../enums/SystemRoles';
import IImmutableObject from '../../../interfaces/IImmutableObject';
import IUserInformation from '../../../interfaces/IUserInformation';

enum CALENDAR_VIEW_TYPE {
  'DAY' = 'day',
  'WEEK' = 'week',
  'MONTH' = 'month',
  'YEAR' = 'year',
}

interface IConnectedInstructorCoursesComponentProps {
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
  lexicon?: string;
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}
interface IInstructorCoursesComponentProps {
  coursesLoading: LoadStates;
  courses: ICourse[];
}

interface IInstructorCoursesComponentState {
  addedMeetingId: number | null;
  isEditMeetingModalOpen: boolean;
  isDeleteMeetingModalOpen: boolean;
  isEditParticipantsModalOpen: boolean;
  editMeeting: ICourse | null;
  deleteMeeting: ICourse | null;
  editParticipantCourse: ICourse | null;
  searchFilterInputValue: string;
  selectedSortBy: string;
  listCalendarView: VIEW_TYPE;
  selectedCalendarView: CALENDAR_VIEW_TYPE;
}

const sortByMenuItems = [
  { label: 'Name', value: 'name' },
  { label: 'Start Time', value: 'courseStart' },
  { label: 'Date Created', value: 'id' },
];

const calendarViewMenuItems = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

class InstructorCoursesComponent extends SrUiComponent<
  IInstructorCoursesComponentProps & IConnectedInstructorCoursesComponentProps,
  IInstructorCoursesComponentState
> {
  initialState() {
    return {
      addedMeetingId: null,
      isEditMeetingModalOpen: false,
      isDeleteMeetingModalOpen: false,
      editMeeting: null,
      deleteMeeting: null,
      isEditParticipantsModalOpen: false,
      editParticipantCourse: null,
      searchFilterInputValue: '',
      selectedSortBy: 'name',
      listCalendarView: VIEW_TYPE.LIST,
      selectedCalendarView: CALENDAR_VIEW_TYPE.MONTH,
    };
  }

  getHandles() {
    return [
      AppBroadcastEvents.EditMeetingModalOpen,
      AppBroadcastEvents.DeleteMeetingModalOpen,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    switch (msg.action) {
      case AppBroadcastEvents.EditMeetingModalOpen:
        this.setPartial({
          editMeeting: msg.data.meeting,
          isEditMeetingModalOpen: true,
        });
        return;
      case AppBroadcastEvents.DeleteMeetingModalOpen:
        this.setPartial({
          deleteMeeting: msg.data.meeting,
          isDeleteMeetingModalOpen: true,
        });
        return;
      default:
        return;
    }
  }

  handleSearchInputFilter(searchFilterInputValue) {
    this.setPartial({ searchFilterInputValue });
  }

  handleClearedInput() {
    this.setPartial({
      searchFilterInputValue: '',
    });
  }

  handleListCalendarView(listCalendarView: VIEW_TYPE) {
    this.setState({
      listCalendarView,
    });
  }

  handleSelectedSortBy(value) {
    this.setPartial({
      selectedSortBy: value,
    });
  }

  handleCalendarViewChange(value: CALENDAR_VIEW_TYPE) {
    this.setPartial({
      selectedCalendarView: value,
    });
  }

  handleCreatedMeetingId(createdMeetingId) {
    // closed without saving
    if (createdMeetingId === undefined) {
      return;
    }
    // closed with saving
    this.setPartial({
      addedMeetingId: createdMeetingId,
    });
    this.setPartialAsync({
      isEditParticipantsModalOpen: true,
    });
  }

  getUpcomingMeetings() {
    const { courses } = this.props;
    const upcomingMeetings = courses.filter((course) =>
      DateFormatUtil.getUnixToUserTimezoneIsAfter(course.courseStart)
    );
    return upcomingMeetings;
  }

  getPastMeetings() {
    const { courses } = this.props;
    const pastMeetings = courses.filter(
      (course) =>
        DateFormatUtil.getUnixToUserTimezoneIsBefore(course.courseStart) &&
        !DateFormatUtil.getUnixToUserTimezoneIsBefore(course.availableUntil)
    );
    return pastMeetings;
  }

  getExpiredMeetings() {
    const { courses } = this.props;
    const expiredMeetings = courses.filter(
      (course) =>
        course.courseStart &&
        course.availableUntil &&
        DateFormatUtil.getUnixToUserTimezoneIsBefore(course.availableUntil)
    );
    return expiredMeetings;
  }

  getCalendarGroupings(calendarView: CALENDAR_VIEW_TYPE) {
    const { courses } = this.props;
    const selectedCalendarGrouping = [];

    switch (calendarView) {
      case CALENDAR_VIEW_TYPE.DAY:
        let dayGroupNames = [];
        // get a list of all the days in courses
        courses.forEach((course) => {
          if (course.courseStart) {
            dayGroupNames.push({
              day: moment.unix(course.courseStart).date(),
              sortBy: course.courseStart,
              label: DateFormatUtil.getUnixToUserTimezone(
                course.courseStart,
                'MMMM Do'
              ),
            });
          }
        });
        // remove any duplicates
        dayGroupNames = uniqBy(dayGroupNames, (group) => group.day);
        // loop thru the groups
        dayGroupNames.forEach((day) => {
          let coursesByDay = [];
          // then loop thru available courses
          courses.forEach((course) => {
            if (moment.unix(course.courseStart).date() === day.day) {
              coursesByDay.push(course);
            }
          });
          // package up the group and courses together
          selectedCalendarGrouping.push({
            groupName: day.label,
            sortBy: day.sortBy,
            courses: coursesByDay,
          });
        });
        return selectedCalendarGrouping.sort((a, b) => b.sortBy - a.sortBy);

      case CALENDAR_VIEW_TYPE.WEEK:
        let weekGroupNames = [];
        // get a list of all the weeks in courses
        courses.forEach((course) => {
          if (course.courseStart) {
            weekGroupNames.push(moment.unix(course.courseStart).week());
          }
        });
        // remove any duplicates
        weekGroupNames = uniq(weekGroupNames);
        // loop thru the groups
        weekGroupNames.forEach((week) => {
          let coursesByWeek = [];
          // then loop thru available courses
          courses.forEach((course) => {
            if (moment.unix(course.courseStart).week() === week) {
              coursesByWeek.push(course);
            }
          });
          // package up the group and courses together
          selectedCalendarGrouping.push({
            groupName: `Week ${week}`,
            weekNumber: week,
            courses: coursesByWeek,
          });
        });
        return selectedCalendarGrouping.sort(
          (a, b) => b.weekNumber - a.weekNumber
        );

      case CALENDAR_VIEW_TYPE.MONTH:
        let monthGroupNames = [];
        // get a list of all the months in courses
        courses.forEach((course) => {
          if (course.courseStart) {
            monthGroupNames.push(moment.unix(course.courseStart).month());
          }
        });
        // remove any duplicates
        monthGroupNames = uniq(monthGroupNames);
        // loop thru available months
        monthGroupNames.forEach((month) => {
          let coursesByMonth = [];
          // then loop thru available courses
          courses.forEach((course) => {
            if (moment.unix(course.courseStart).month() === month) {
              coursesByMonth.push(course);
            }
          });
          // package up the group and courses together
          selectedCalendarGrouping.push({
            groupName: moment().month(month).format('MMMM'),
            monthNumber: moment().month(month).format('M'),
            courses: coursesByMonth,
          });
        });
        return selectedCalendarGrouping.sort(
          (a, b) => b.monthNumber - a.monthNumber
        );

      case CALENDAR_VIEW_TYPE.YEAR:
        let yearGroupNames = [];
        // get a list of all the years in courses
        courses.forEach((course) => {
          if (course.courseStart) {
            yearGroupNames.push(moment.unix(course.courseStart).year());
          }
        });
        // remove any duplicates
        yearGroupNames = uniq(yearGroupNames);
        // loop thru available years
        yearGroupNames.forEach((year) => {
          let coursesByYear = [];
          // then loop thru available courses
          courses.forEach((course) => {
            if (moment.unix(course.courseStart).year() === year) {
              coursesByYear.push(course);
            }
          });
          // package up the group and courses together
          selectedCalendarGrouping.push({
            groupName: year,
            courses: coursesByYear,
          });
        });
        return selectedCalendarGrouping.sort(
          (a, b) => b.groupName - a.groupName
        );
      default:
        return selectedCalendarGrouping;
    }
  }

  performRender() {
    const { isEduVersion, isCorpVersion, coursesLoading, courses } = this.props;
    const {
      isEditMeetingModalOpen,
      isDeleteMeetingModalOpen,
      isEditParticipantsModalOpen,
      editMeeting,
      deleteMeeting,
      addedMeetingId,
      searchFilterInputValue,
      selectedSortBy,
      listCalendarView,
      selectedCalendarView,
    } = this.state;
    const hasCourses = !isEmpty(courses);
    return (
      <div
        className={`instructor-courses-component ${
          isCorpVersion ? 'is-corp' : ''
        }`}
      >
        <LoadIndicator
          state={coursesLoading}
          loadingMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.LOADING_COURSES_MEETINGS
          )}
          errorMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.ERROR_COURSES_MEETINGS
          )}
        />

        {/* Ed Version */}
        {isEduVersion && (
          <div className="instructor-courses-content">
            <div className="header-controls">
              <h1>
                {Localizer.getFormatted(
                  INSTRUCTOR_COURSES_COMPONENT.COURSE_MEETING_MANAGEMENT
                )}
              </h1>
            </div>

            {coursesLoading === LoadStates.Succeeded && (
              <>
                {hasCourses ? (
                  <div className="instructor-courses-container">
                    <InstructorCourseGroup
                      isCorpVersion={isCorpVersion}
                      groupName={Localizer.getFormatted(
                        COURSES_COMPONENT.CURRENT
                      )}
                      courses={courses.filter(
                        (course) =>
                          [SeriesState.Current, SeriesState.Live].indexOf(
                            course.state
                          ) !== -1
                      )}
                      sortBy={selectedSortBy}
                      searchFilterInputValue={searchFilterInputValue}
                    />
                    <InstructorCourseGroup
                      isCorpVersion={isCorpVersion}
                      groupName={Localizer.getFormatted(
                        COURSES_COMPONENT.UPCOMING
                      )}
                      courses={courses.filter(
                        (course) =>
                          [
                            SeriesState.UpcomingOpen,
                            SeriesState.Upcoming,
                          ].indexOf(course.state) !== -1
                      )}
                      sortBy={selectedSortBy}
                      searchFilterInputValue={searchFilterInputValue}
                    />
                    <InstructorCourseGroup
                      isCorpVersion={isCorpVersion}
                      groupName={Localizer.getFormatted(
                        COURSES_COMPONENT.PREVIOUS
                      )}
                      courses={courses.filter(
                        (course) =>
                          [SeriesState.EndedOpen, SeriesState.Ended].indexOf(
                            course.state
                          ) !== -1
                      )}
                      sortBy={selectedSortBy}
                      searchFilterInputValue={searchFilterInputValue}
                    />
                  </div>
                ) : (
                  <Alert bsStyle="danger">
                    {Localizer.getFormatted(COURSES_COMPONENT.UNREGISTERED)}
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {/* Corp Version */}
        {isCorpVersion && (
          <div className="instructor-courses-content">
            {coursesLoading === LoadStates.Succeeded && hasCourses && (
              <div className="loaded-content">
                <div className="header-controls">
                  <h1>
                    {Localizer.getFormatted(
                      INSTRUCTOR_COURSES_COMPONENT.COURSE_MEETING_MANAGEMENT
                    )}
                  </h1>

                  {/* Controls */}
                  <div className={`instructor-courses-controls`}>
                    {/* Search - name, meeting id */}
                    <SearchFilterInput
                      className="instructor-courses-controls--search flex-grow"
                      placeholder={`Search by Meeting Name or Meeting ID`}
                      updateCurrentVal={(val) =>
                        this.handleSearchInputFilter(val)
                      }
                      clearedInput={() => this.handleClearedInput()}
                    />
                    {/* ListCalendarToggle */}
                    <ListCalendarRadioToggler
                      onToggled={(value) => this.handleListCalendarView(value)}
                    />
                    {/* Meeting Metadata Sorter  */}
                    {listCalendarView === VIEW_TYPE.LIST && (
                      <SortByDropdown
                        id={`sortby-meeting`}
                        className="instructor-courses-controls--sort ml-1"
                        menuItems={sortByMenuItems}
                        onSelect={(val) => this.handleSelectedSortBy(val)}
                        selectedVal={selectedSortBy}
                      />
                    )}
                    {/* Calendar view toggle */}
                    {listCalendarView === VIEW_TYPE.CALENDAR && (
                      <SortByDropdown
                        id={`sortby-calendar`}
                        className="instructor-courses-controls--sort ml-1"
                        menuItems={calendarViewMenuItems}
                        onSelect={(val) =>
                          this.handleCalendarViewChange(
                            val as CALENDAR_VIEW_TYPE
                          )
                        }
                        selectedVal={selectedCalendarView}
                      />
                    )}

                    {/* Add Meeting */}
                    {SystemRoleService.hasSomeRoles([
                      SystemRoles.PRESENTER,
                      SystemRoles.SALES_PRESENTER,
                      SystemRoles.DEPARTMENT_ADMIN,
                      SystemRoles.CLIENT_ADMIN,
                      SystemRoles.ADMIN,
                    ]) && (
                      <CorpAddMeetingModalButton
                        className="instructor-courses-controls--add ml-1"
                        shouldBroadcastAdded={false}
                        onModalClose={(createdMeetingId) =>
                          this.handleCreatedMeetingId(createdMeetingId)
                        }
                      />
                    )}
                  </div>
                </div>
                {/* begin list view */}
                {listCalendarView === VIEW_TYPE.LIST && (
                  <div className="instructor-courses-container">
                    {/* Upcoming Meetings */}
                    <InstructorCourseGroup
                      className="upcoming-container"
                      isCorpVersion={isCorpVersion}
                      groupName={Localizer.get('Upcoming Meetings')}
                      courses={this.getUpcomingMeetings()}
                      sortBy={selectedSortBy}
                      searchFilterInputValue={searchFilterInputValue}
                    />
                    {/* Past Meetings */}
                    <InstructorCourseGroup
                      className="past-container"
                      isCorpVersion={isCorpVersion}
                      groupName={Localizer.get('Past Meetings')}
                      courses={this.getPastMeetings()}
                      sortBy={selectedSortBy}
                      searchFilterInputValue={searchFilterInputValue}
                    />
                    {/* Expired Meetings */}
                    <InstructorCourseGroup
                      className="expired-container"
                      isCorpVersion={isCorpVersion}
                      groupName={Localizer.get('Expired Meetings')}
                      courses={this.getExpiredMeetings()}
                      sortBy={selectedSortBy}
                      searchFilterInputValue={searchFilterInputValue}
                    />
                  </div>
                )}
                {/* begin calendar view */}
                {listCalendarView === VIEW_TYPE.CALENDAR && (
                  <div className="instructor-courses-container calendar-view">
                    {this.getCalendarGroupings(selectedCalendarView).map(
                      (group, index) => (
                        <InstructorCourseGroup
                          key={`calendar-iterator-${index}`}
                          isCorpVersion={isCorpVersion}
                          groupName={group.groupName}
                          courses={group.courses}
                          sortBy={'courseStart'}
                          searchFilterInputValue={searchFilterInputValue}
                        />
                      )
                    )}
                  </div>
                )}
                <CorpEditMeetingModal
                  departmentId={editMeeting ? editMeeting.departmentId : null}
                  show={isEditMeetingModalOpen}
                  meeting={editMeeting}
                  onClose={() => {
                    this.setPartial({
                      editMeeting: null,
                      isEditMeetingModalOpen: false,
                    });
                  }}
                />
                <CorpDeleteMeetingModal
                  show={isDeleteMeetingModalOpen}
                  meeting={deleteMeeting}
                  onClose={() => {
                    this.setPartial({
                      deleteMeeting: null,
                      isDeleteMeetingModalOpen: false,
                    });
                  }}
                />
              </div>
            )}
            {coursesLoading === LoadStates.Succeeded && !hasCourses && (
              <CorpMeetingsZero
                handleCreatedMeetingId={(createdMeetingId) =>
                  this.handleCreatedMeetingId(createdMeetingId)
                }
                shouldBroadcastAdded={false}
              />
            )}
            <EditParticipantsModal
              show={isEditParticipantsModalOpen}
              type={'add'}
              courseId={addedMeetingId}
              onClose={() =>
                this.setPartial({
                  editParticipantCourse: null,
                  isEditParticipantsModalOpen: false,
                })
              }
            />
          </div>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedInstructorCoursesComponentProps,
  {},
  IInstructorCoursesComponentProps
>(AppMappers.AppMapper)(InstructorCoursesComponent);
