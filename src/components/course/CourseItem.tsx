import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import {
  FaRegClock,
  FaUsers,
  FaArchive,
  FaLock,
  FaUnlock,
  FaHashtag,
  FaShare,
} from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import ICourse from '../../models/ICourse';
import Localizer from '../../utilities/Localizer';
import SeriesState from '../../enums/SeriesState';
import * as CoursesActions from '../../store/courses/CoursesActions';
import Courses from '../../utilities/Courses';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import SharePermissionBadge from '../corp/SharePermissionBadge';
import DateFormatUtil, {
  prettyLongDateFormat,
  prettyTimeFormat,
  longDateFormat,
} from '../../utilities/DateFormatUtil';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IconLabelItem from '../display/IconLabelItem';

interface ICourseItemProps {
  course: ICourse;
}

interface IConnectedCourseItemProps extends DispatchProp<any> {
  isCorpVersion?: boolean;
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface ICourseItemState {}

class CourseItem extends SrUiComponent<
  ICourseItemProps & IConnectedCourseItemProps,
  ICourseItemState
> {
  openCourse(event: React.MouseEvent<any>, live?: boolean) {
    event.stopPropagation();
    event.preventDefault();
    if (Courses.accessAllowed(this.props.course.state)) {
      this.props.dispatch(CoursesActions.getCourse(this.props.course.id));
      this.navigate(
        'course/' + this.props.course.id + (live ? '?menu=live' : '')
      );
    }
  }

  instructorsLabel(course: ICourse) {
    if (!course || !course.instructors) {
      return null;
    }

    if (course.instructors.length > 1) {
      return (
        <p className="instructor sub-title">
          {Localizer.getFormatted(GENERAL_COMPONENT.INSTRUCTORS_PRESENTERS)}:{' '}
          {course.instructors.join(', ')}
        </p>
      );
    } else if (course.instructors.length === 1) {
      return (
        <p className="instructor sub-title">
          {Localizer.getFormatted(GENERAL_COMPONENT.INSTRUCTOR_PRESENTER)}:{' '}
          {course.instructors.join(', ')}
        </p>
      );
    }
    return null;
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
        instructors,
        availableUntil,
        sharePermission,
        displayId,
        sharedBy,
      },
    } = this.props;
    const userProfileTimezone = userInformation.toJS().timezone;

    return (
      <>
        {!isCorpVersion && (
          <div
            className={`list-item ${
              Courses.accessAllowed(state) ? 'selectable' : ''
            } ${SeriesState[state].toLowerCase()}`}
            onClick={(e) => this.openCourse(e)}
          >
            <div className="course-info">
              <p className="title">
                <span className="mr-2">{name}</span>
                {isCorpVersion && (
                  <SharePermissionBadge permissionCode={sharePermission} />
                )}
              </p>
              {this.instructorsLabel(course)}
            </div>
          </div>
        )}
        {isCorpVersion && (
          <div
            role="button"
            tabIndex={0}
            className={`course-item  
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
            onClick={(e) =>
              // only clickable if not expired
              !DateFormatUtil.getUnixToGivenTimezoneIsBefore(
                course.availableUntil,
                userProfileTimezone
              )
                ? this.openCourse(e)
                : null
            }
          >
            <div className="course-data">
              <div className="data-group primary">
                <div
                  className="title"
                  aria-label={Localizer.get('Meeting Name')}
                >
                  {name}
                </div>
                <div className="dates">
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
                          courseEnd,
                          userProfileTimezone,
                          prettyLongDateFormat
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="data-group secondary secondary-student">
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
                  className="grid-item-sharedby"
                  icon={() => (
                    <FaShare
                      className={`icon ${
                        sharedBy ? 'text-warning' : 'text-default'
                      }`}
                    />
                  )}
                  textNode={() => (
                    <>
                      {sharedBy.firstName ? sharedBy.firstName : ''}{' '}
                      {sharedBy.lastName ? sharedBy.lastName : ''}
                    </>
                  )}
                  ariaLabel={Localizer.get(
                    `This meeting was ${!isNull(sharedBy) ? '' : 'not'} shared`
                  )}
                  showDashes={isNull(sharedBy)}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default connect<IConnectedCourseItemProps, {}, ICourseItemProps>(
  AppMappers.AppMapper
)(CourseItem);
