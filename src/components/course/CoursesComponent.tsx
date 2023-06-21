import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, LoadStates, LoadIndicator } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import ICourse from '../../models/ICourse';
import {
  COURSES_COMPONENT,
  GENERAL_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import CourseGroup from './CourseGroup';
import SeriesState from '../../enums/SeriesState';
import CorpMeetingsZero from '../corp/CorpMeetingsZero';
import SearchFilterInput from '../controls/SearchFilterInput';
import ListCalendarRadioToggler, {
  VIEW_TYPE,
} from '../controls/ListCalendarRadioToggler';
import SortByDropdown from '../controls/SortByDropdown';
import DateFormatUtil from '../../utilities/DateFormatUtil';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';

enum CALENDAR_VIEW_TYPE {
  'DAY' = 'day',
  'WEEK' = 'week',
  'MONTH' = 'month',
  'YEAR' = 'year',
}

interface ICoursesComponentProps {
  coursesLoading: LoadStates;
  courses: ICourse[];
}

interface IConnectedCoursesComponentProps {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
  isEduVersion?: boolean;
  isCorpVersion?: boolean;
}

interface ICoursesComponentState {
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

class CoursesComponent extends SrUiComponent<
  ICoursesComponentProps & IConnectedCoursesComponentProps,
  ICoursesComponentState
> {
  initialState() {
    return {
      searchFilterInputValue: '',
      selectedSortBy: 'name',
      listCalendarView: VIEW_TYPE.LIST,
      selectedCalendarView: CALENDAR_VIEW_TYPE.MONTH,
    };
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
    // After creating a meeting, the InstructorCoursesComponent proceeds to display the add participants modal.  We are not currently doing that here.
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
      listCalendarView,
      selectedSortBy,
      selectedCalendarView,
      searchFilterInputValue,
    } = this.state;
    const hasCourses = !isEmpty(courses);
    const upcomingMeetings = this.getUpcomingMeetings();
    const pastMeetings = this.getPastMeetings();
    const expiredMeetings = this.getExpiredMeetings();

    return (
      <div
        className={`instructor-courses-component ${
          isCorpVersion ? 'is-corp' : ''
        }`}
      >
        <LoadIndicator
          state={this.props.coursesLoading}
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
              <h1>{Localizer.getFormatted(COURSES_COMPONENT.TITLE)}</h1>
            </div>
            {coursesLoading === LoadStates.Succeeded && (
              <>
                {hasCourses ? (
                  <div className="instructor-courses-container">
                    <CourseGroup
                      groupName={Localizer.getFormatted(
                        COURSES_COMPONENT.CURRENT
                      )}
                      state={[SeriesState.Current, SeriesState.Live]}
                      courses={this.props.courses}
                    />
                    <CourseGroup
                      groupName={Localizer.getFormatted(
                        COURSES_COMPONENT.UPCOMING
                      )}
                      state={[SeriesState.UpcomingOpen, SeriesState.Upcoming]}
                      courses={this.props.courses}
                    />
                    <CourseGroup
                      groupName={Localizer.getFormatted(
                        COURSES_COMPONENT.PREVIOUS
                      )}
                      state={[SeriesState.EndedOpen, SeriesState.Ended]}
                      courses={this.props.courses}
                    />
                  </div>
                ) : (
                  <Alert bsStyle="info">
                    {Localizer.getFormatted(COURSES_COMPONENT.UNREGISTERED)}
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {/* Corp Version */}
        {isCorpVersion && (
          <div className="courses-content flex-grow-column-container">
            {coursesLoading === LoadStates.Succeeded && hasCourses && (
              <div className="loaded-content">
                <div className="header-controls d-flex justify-content-between align-items-center">
                  <h1>{Localizer.getFormatted(COURSES_COMPONENT.TITLE)}</h1>
                </div>
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
                        this.handleCalendarViewChange(val as CALENDAR_VIEW_TYPE)
                      }
                      selectedVal={selectedCalendarView}
                    />
                  )}
                </div>
                {/* begin list view */}
                {listCalendarView === VIEW_TYPE.LIST && (
                  <div className="instructor-courses-container">
                    {/* Upcoming Meetings */}
                    {upcomingMeetings.length > 0 && (
                      <CourseGroup
                        className="upcoming-container"
                        isCorpVersion={isCorpVersion}
                        groupName={Localizer.get('Upcoming Meetings')}
                        courses={upcomingMeetings}
                        sortBy={selectedSortBy}
                        searchFilterInputValue={searchFilterInputValue}
                      />
                    )}
                    {/* Past Meetings */}
                    {pastMeetings.length > 0 && (
                      <CourseGroup
                        className="past-container"
                        isCorpVersion={isCorpVersion}
                        groupName={Localizer.get('Past Meetings')}
                        courses={pastMeetings}
                        sortBy={selectedSortBy}
                        searchFilterInputValue={searchFilterInputValue}
                      />
                    )}
                    {/* Expired Meetings */}
                    {expiredMeetings.length > 0 && (
                      <CourseGroup
                        className="expired-container"
                        isCorpVersion={isCorpVersion}
                        groupName={Localizer.get('Expired Meetings')}
                        courses={expiredMeetings}
                        sortBy={selectedSortBy}
                        searchFilterInputValue={searchFilterInputValue}
                      />
                    )}
                  </div>
                )}
                {/* begin calendar view */}
                {listCalendarView === VIEW_TYPE.CALENDAR && (
                  <div className="instructor-courses-container calendar-view">
                    {this.getCalendarGroupings(selectedCalendarView).map(
                      (group, index) =>
                        group.courses.length > 0 && (
                          <CourseGroup
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
              </div>
            )}
            {coursesLoading === LoadStates.Succeeded && !hasCourses && (
              <CorpMeetingsZero
                shouldBroadcastAdded={false}
                handleCreatedMeetingId={(createdMeetingId) =>
                  this.handleCreatedMeetingId(createdMeetingId)
                }
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedCoursesComponentProps,
  {},
  ICoursesComponentProps
>(AppMappers.AppMapper)(CoursesComponent);
