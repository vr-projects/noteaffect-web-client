import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import {
  FaRegClock,
  FaUsers,
  FaArchive,
  FaUnlock,
  FaLock,
  FaHashtag,
  FaAngleDown,
  FaCommentAlt,
} from 'react-icons/fa';
import { MenuItem, Dropdown } from 'react-bootstrap';
import { BsBellFill } from 'react-icons/bs';
import { SrUiComponent } from 'react-strontium';
import AppMappers from '../../../mappers/AppMappers';
import ICourse from '../../../models/ICourse';
import SeriesState from '../../../enums/SeriesState';
import Courses from '../../../utilities/Courses';
import * as CoursesActions from '../../../store/courses/CoursesActions';
import { GENERAL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import AccessibilityUtil from '../../../utilities/AccessibilityUtil';
import SharePermissionBadge from '../../corp/SharePermissionBadge';
import DateFormatUtil, {
  longDateTimeFormat,
  longDateFormat,
  prettyLongDateFormat,
  prettyTimeFormat,
} from '../../../utilities/DateFormatUtil';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';
import IImmutableObject from '../../../interfaces/IImmutableObject';
import IUserInformation from '../../../interfaces/IUserInformation';
import IconLabelItem from '../../display/IconLabelItem';

interface IInstructorCourseItemProps {
  course: ICourse;
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface IConnectedInstructorCourseItemProps extends DispatchProp<any> {
  isCorpVersion?: boolean;
}

interface IInstructorCourseItemState {}

class InstructorCourseItem extends SrUiComponent<
  IInstructorCourseItemProps & IConnectedInstructorCourseItemProps,
  IInstructorCourseItemState
> {
  openCourse(event: React.MouseEvent<any>) {
    event.stopPropagation();
    event.preventDefault();
    const {
      course: { state: courseState, id: courseId },
    } = this.props;
    if (Courses.accessAllowed(courseState)) {
      this.props.dispatch(CoursesActions.getCourse(courseId));
      this.navigate('instructor/course/' + courseId);
    }
  }

  // Corp version
  onEditBtnClick(e) {
    e.stopPropagation();
    const { course: meeting } = this.props;
    this.broadcast(AppBroadcastEvents.EditMeetingModalOpen, { meeting });
  }

  // Corp version
  onDeleteBtnClick(e) {
    e.stopPropagation();
    const { course: meeting } = this.props;
    this.broadcast(AppBroadcastEvents.DeleteMeetingModalOpen, { meeting });
  }

  handleOpenCourse(e) {
    this.openCourse(e);
  }

  performRender() {
    const {
      userInformation,
      isCorpVersion,
      course,
      course: {
        name,
        state,
        courseStart,
        courseEnd,
        availableUntil,
        instructors,
        sharePermission,
        displayId,
        hasNewViolation,
        questionCount,
      },
    } = this.props;
    const userProfileTimezone = userInformation.toJS().timezone;
    const hasUnansweredQuestions =
      !isNull(questionCount) &&
      questionCount.questions - questionCount.answered > 0;

    return (
      <div
        role="button"
        tabIndex={0}
        className={`instructor-course-item  
          ${SeriesState[state].toLowerCase()} ${
          isCorpVersion ? 'isCorp' : ''
        } ${
          DateFormatUtil.getUnixToGivenTimezoneIsAfter(
            courseStart,
            userProfileTimezone
          )
            ? Localizer.get('upcoming')
            : Localizer.get('past')
        } ${
          DateFormatUtil.getUnixToGivenTimezoneIsBefore(
            availableUntil,
            userProfileTimezone
          )
            ? Localizer.get('expired')
            : ''
        }`}
        onClick={(e) => this.handleOpenCourse(e)}
        onKeyDown={(e) =>
          AccessibilityUtil.handleEnterKey(e, () => this.handleOpenCourse(e))
        }
      >
        {isCorpVersion && (
          <div className="course-data">
            <div className="data-group primary">
              <div className="title" aria-label={Localizer.get('Meeting Name')}>
                {name}
              </div>
              <div
                className="dates"
                aria-label={Localizer.get('Meeting Dates')}
              >
                {courseStart && (
                  <>
                    <span aria-label="start date">
                      {DateFormatUtil.getUnixToGivenTimezone(
                        courseStart,
                        userProfileTimezone,
                        prettyLongDateFormat
                      )}
                    </span>{' '}
                  </>
                )}
                {courseEnd && (
                  <>
                    –
                    <span aria-label="end date">
                      {' '}
                      {DateFormatUtil.getUnixToGivenTimezone(
                        course.courseEnd,
                        userProfileTimezone,
                        prettyLongDateFormat
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="data-group secondary secondary-instructor">
              <IconLabelItem
                className="grid-item-times"
                icon={() => <FaRegClock className="icon" />}
                textNode={() => (
                  <>
                    <span aria-label="start time">
                      {DateFormatUtil.getUnixToGivenTimezone(
                        courseStart,
                        userProfileTimezone,
                        prettyTimeFormat
                      )}
                    </span>
                    <span aria-label="to">&nbsp;-&nbsp;</span>
                    <span aria-label="end time">
                      {DateFormatUtil.getUnixToGivenTimezone(
                        courseEnd,
                        userProfileTimezone,
                        prettyTimeFormat
                      )}
                    </span>
                  </>
                )}
                ariaLabel={Localizer.get('meeting times')}
                showDashes={isNull(courseStart) || isNull(courseEnd)}
              />

              <IconLabelItem
                className="grid-item-presenters"
                icon={() => <FaUsers className="icon" />}
                textNode={() => instructors.join(', ')}
                ariaLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.INSTRUCTORS_PRESENTERS
                )}
                showDashes={isEmpty(instructors)}
              />

              <IconLabelItem
                className="grid-item-expires"
                icon={() => <FaArchive className="icon" />}
                textNode={() => (
                  <>
                    <span>{Localizer.get('Expires')}</span>
                    <span>&nbsp;</span>
                    <span>
                      {DateFormatUtil.getUnixGMT(
                        availableUntil,
                        longDateFormat
                      )}
                    </span>
                  </>
                )}
                ariaLabel={Localizer.get('Expires')}
                showDashes={isNull(availableUntil)}
              />

              <IconLabelItem
                className="grid-item-permissions"
                icon={() =>
                  sharePermission >= 2 ? (
                    <FaLock className="icon" />
                  ) : (
                    <FaUnlock className="icon" />
                  )
                }
                textNode={() => (
                  <SharePermissionBadge permissionCode={sharePermission} />
                )}
                ariaLabel={Localizer.get('Share permission')}
                showDashes={isNull(sharePermission)}
              />

              <IconLabelItem
                className="grid-item-meetingId"
                icon={() => <FaHashtag className="icon" />}
                textNode={() => <>{displayId}</>}
                ariaLabel={Localizer.get('Meeting ID')}
                showDashes={isNull(displayId)}
              />

              <IconLabelItem
                className="grid-item-violations"
                icon={() => (
                  <BsBellFill
                    className={`icon ${
                      hasNewViolation ? 'text-warning' : 'text-default'
                    }`}
                  />
                )}
                textNode={() => <>{Localizer.get('Has Violations')}</>}
                ariaLabel={Localizer.get('Violations')}
                showDashes={!hasNewViolation}
              />
              <IconLabelItem
                className="grid-item-questions"
                icon={() => (
                  <FaCommentAlt
                    className={`icon ${
                      hasUnansweredQuestions
                        ? 'text-success-light'
                        : 'text-default'
                    }`}
                  />
                )}
                textNode={() => <>{Localizer.get('Has Questions')}</>}
                ariaLabel={Localizer.get('Questions')}
                showDashes={!hasUnansweredQuestions}
              />
            </div>
            <Dropdown
              id={`context-menu-`}
              pullRight
              className="data-group context"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) =>
                AccessibilityUtil.handleEnterKey(e, () => e.stopPropagation())
              }
            >
              <Dropdown.Toggle className="data-context-menu" noCaret>
                <FaAngleDown className="icon" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem
                  eventKey="1"
                  onClick={(e) => this.onEditBtnClick(e)}
                  onKeyDown={(e) =>
                    AccessibilityUtil.handleEnterKey(e, () =>
                      this.onEditBtnClick(e)
                    )
                  }
                >
                  {Localizer.get('Edit')}
                </MenuItem>
                <MenuItem
                  eventKey="2"
                  onClick={(e) => this.onDeleteBtnClick(e)}
                  onKeyDown={(e) =>
                    AccessibilityUtil.handleEnterKey(e, () =>
                      this.onDeleteBtnClick(e)
                    )
                  }
                >
                  {Localizer.get('Delete')}
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
        {!isCorpVersion && (
          <div className="course-info">
            <p className={`title ${isCorpVersion ? 'btn-link' : ''}`}>
              <span>{course.name}</span>
            </p>
            {course && course.instructors && !isEmpty(course.instructors) && (
              <p className="instructor-course-item--instructor sub-title">
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.INSTRUCTORS_PRESENTERS
                )}
                : {course.instructors.join(', ')}
              </p>
            )}
            {isCorpVersion && (
              <>
                {!isNull(course.sharePermission) && (
                  <p className="instructor-course-item--sharing sub-title">
                    Sharing Permission:&nbsp;&nbsp;
                    <SharePermissionBadge
                      permissionCode={course.sharePermission}
                    />
                  </p>
                )}
                <p className="instructor-course-item--meeting-id sub-title">
                  {`${Localizer.get('Meeting ID:')} ${course.displayId}`}
                </p>
                {!isNull(course.courseStart) && (
                  <p className="instructor-course-item--start sub-title">
                    {`${Localizer.get(
                      'Meeting Start:'
                    )} ${DateFormatUtil.getUnixToGivenTimezone(
                      course.courseStart,
                      userProfileTimezone,
                      longDateTimeFormat
                    )}`}
                  </p>
                )}
                {!isNull(course.courseEnd) && (
                  <p className="instructor-course-item--end sub-title">
                    {`${Localizer.get(
                      'Meeting End:'
                    )} ${DateFormatUtil.getUnixToGivenTimezone(
                      course.courseEnd,
                      userProfileTimezone,
                      longDateTimeFormat
                    )}`}
                  </p>
                )}
                {!isNull(course.availableUntil) && (
                  <p className="instructor-course-item--expiration sub-title">
                    {`${
                      DateFormatUtil.getUnixToGivenTimezoneIsBefore(
                        course.availableUntil,
                        userProfileTimezone
                      )
                        ? Localizer.get('Expired:')
                        : Localizer.get('Expires:')
                    } ${DateFormatUtil.getUnixGMT(
                      course.availableUntil,
                      longDateFormat
                    )}`}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedInstructorCourseItemProps,
  {},
  IInstructorCourseItemProps
>(AppMappers.AppMapper)(InstructorCourseItem);
