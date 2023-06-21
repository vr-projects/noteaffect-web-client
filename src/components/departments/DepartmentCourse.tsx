import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent, QueryUtility } from 'react-strontium';
import { Button } from 'react-bootstrap';
import isNull from 'lodash/isNull';
import ICourse from '../../models/ICourse';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import SeriesState from '../../enums/SeriesState';
import IDepartment from '../../models/IDepartment';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import SharePermissionBadge from '../corp/SharePermissionBadge';
import DateFormatUtil, {
  longDateTimeFormat,
  longDateFormat,
} from '../../utilities/DateFormatUtil';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import AppMappers from '../../mappers/AppMappers';

interface IConnectedDepartmentCourseProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface IDepartmentCourseProps {
  isEduVersion?: boolean;
  isCorpVersion?: boolean;
  course: ICourse;
  departmentAdmin: boolean;
  showDepartment?: boolean;
  showPeriod?: boolean;
  departments?: IDepartment[];
  groups?: IAdminTag[];
  editParticipants: (course: ICourse) => void;
  editDepartment: (course: ICourse) => void;
  editGroups: (course: ICourse) => void;
  editPeriods: (course: ICourse) => void;
  editMeeting: (course: ICourse) => void;
  deleteMeeting: (course: ICourse) => void;
  periods: IPeriod[];
}

interface IDepartmentCourseState {}

class DepartmentCourse extends SrUiComponent<
  IConnectedDepartmentCourseProps & IDepartmentCourseProps,
  IDepartmentCourseState
> {
  hasGroupTagsSection(groups, course) {
    return groups && course.courseTags && course.courseTags.length > 0;
  }

  sortedGroupTags(groups, course) {
    let tagIds = course.courseTags.map((ct) => ct.adminTagId);
    return groups
      .filter((g) => tagIds.indexOf(g.id) !== -1)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getDepartmentName(showDepartment, departments, course) {
    const hasDepartment =
      showDepartment && departments.some((d) => d.id === course.departmentId);
    if (hasDepartment) {
      return departments.find((d) => d.id === course.departmentId).name;
    }
    return null;
  }

  getPeriodName(showPeriod, periods, course) {
    const hasPeriod =
      showPeriod && periods.some((d) => d.id === course.periodId);

    if (hasPeriod) {
      return periods.find((d) => d.id === course.periodId).name;
    }

    return null;
  }

  performRender() {
    const seriesStateClass =
      SeriesState[this.props.course.state] !== undefined
        ? SeriesState[this.props.course.state].toLowerCase()
        : '';
    const {
      isEduVersion,
      isCorpVersion,
      departmentAdmin,
      groups,
      course,
      departments,
      showDepartment,
      periods,
      showPeriod,
      editParticipants,
      editDepartment,
      editGroups,
      editPeriods,
      editMeeting,
      deleteMeeting,
    } = this.props;

    const departmentName = this.getDepartmentName(
      showDepartment,
      departments,
      course
    );
    const periodName = this.getPeriodName(showPeriod, periods, course);
    const hasGroupTags = this.hasGroupTagsSection(groups, course);
    let sortedGroupTagsMap;
    if (hasGroupTags) {
      sortedGroupTagsMap = this.sortedGroupTags(groups, course);
    }

    return (
      <div
        className={`department-course  ${seriesStateClass} ${
          DateFormatUtil.getUnixToUserTimezoneIsBefore(course.availableUntil)
            ? 'isExpired'
            : ''
        }`}
      >
        <div className="row course-info">
          {/* // TODO tech debt needs div > button */}
          <div className="col-sm-7">
            <Button
              bsStyle="default"
              className="title na-title-link-btn"
              onClick={() =>
                this.updateQuery(QueryUtility.buildQuery({ course: course.id }))
              }
            >
              <span>{course.name}</span>
            </Button>
            {isCorpVersion && (
              <>
                <span>&nbsp;&nbsp;</span>
                <SharePermissionBadge permissionCode={course.sharePermission} />
              </>
            )}
            {departmentName && (
              <p className="sub-title">
                {Localizer.get('Department')}: {departmentName}
              </p>
            )}
            {isEduVersion && periodName && (
              <p className="sub-title">
                {Localizer.get('Period')}: {periodName}
              </p>
            )}

            {course && course.instructors && course.instructors.length > 0 && (
              <p className="instructor sub-title">
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.INSTRUCTORS_PRESENTERS
                )}
                : {course.instructors.join(', ')}
              </p>
            )}

            {!isNull(course.courseStart) && (
              <p className="instructor-course-item--start sub-title">
                {`${Localizer.get(
                  'Meeting Start:'
                )} ${DateFormatUtil.getUnixToUserTimezone(
                  course.courseStart,
                  longDateTimeFormat
                )}`}
              </p>
            )}
            {!isNull(course.courseEnd) && (
              <p className="instructor-course-item--end sub-title">
                {`${Localizer.get(
                  'Meeting End:'
                )} ${DateFormatUtil.getUnixToUserTimezone(
                  course.courseEnd,
                  longDateTimeFormat
                )}`}
              </p>
            )}
            {!isNull(course.availableUntil) && (
              <p className="instructor-course-item--expiration sub-title">
                {`${
                  DateFormatUtil.getUnixToUserTimezoneIsBefore(
                    course.availableUntil
                  )
                    ? Localizer.get('Expired:')
                    : Localizer.get('Expires:')
                } ${DateFormatUtil.getUnixGMT(
                  course.availableUntil,
                  longDateFormat
                )}`}
              </p>
            )}
            {isEduVersion && hasGroupTags && (
              <div className="sub-title groups">
                <span>{Localizer.get('Groups')}:</span>{' '}
                {sortedGroupTagsMap.map((g) => (
                  <span className="label label-info" key={g.id}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          {departmentAdmin ? (
            <div className="col-sm-5 text-right margin margin-top-sm">
              {isEduVersion && (
                <>
                  {groups.length > 0 ? (
                    <Button
                      bsStyle="default"
                      onClick={() => editGroups(course)}
                    >
                      {Localizer.get('Edit Groups')}
                    </Button>
                  ) : null}
                  <Button
                    bsStyle="default"
                    onClick={() => editDepartment(course)}
                  >
                    {Localizer.get('Change Department')}
                  </Button>
                  <Button bsStyle="default" onClick={() => editPeriods(course)}>
                    {Localizer.get('Change Period')}
                  </Button>
                  <Button
                    bsStyle="default"
                    onClick={() => editParticipants(course)}
                  >
                    {Localizer.get('Edit Participants')}
                  </Button>
                </>
              )}
              {isCorpVersion &&
                SystemRoleService.hasSomeRoles([
                  SystemRoles.DEPARTMENT_ADMIN,
                  SystemRoles.CLIENT_ADMIN,
                  SystemRoles.ADMIN,
                ]) && (
                  <>
                    <Button
                      bsStyle="default"
                      onClick={() => editDepartment(course)}
                    >
                      {Localizer.get('Change Department')}
                    </Button>
                    <Button
                      bsStyle="default"
                      onClick={() => editMeeting(course)}
                    >
                      {Localizer.get('Edit Meeting')}
                    </Button>
                    <Button
                      bsStyle="default"
                      onClick={() => deleteMeeting(course)}
                    >
                      {Localizer.get('Delete Meeting')}
                    </Button>
                    <Button
                      bsStyle="default"
                      onClick={() => editParticipants(course)}
                    >
                      {Localizer.get('Edit Participants')}
                    </Button>
                  </>
                )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default connect<
  IConnectedDepartmentCourseProps,
  {},
  IDepartmentCourseProps
>(AppMappers.AppMapper)(DepartmentCourse);
