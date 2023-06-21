import * as React from 'react';
import isUndefined from 'lodash/isUndefined';
import {
  SrUiComponent,
  QueryUtility,
  SrAppMessage,
  LoadStates,
  ApiHelpers,
} from 'react-strontium';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import IDepartment from '../../models/IDepartment';
import Localizer from '../../utilities/Localizer';
import AddDepartmentModalButton from './AddDepartmentModalButton';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import DepartmentRenameModalButton from './DepartmentRenameModalButton';
import ICourse from '../../models/ICourse';
import Numbers from '../../utilities/Numbers';
import ArbitraryGroupLayout from './ArbitraryGroupLayout';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';
import ErrorUtil from '../../utilities/ErrorUtil';

interface IDepartmentsViewProps {
  departments: IDepartment[];
  groups: IAdminTag[];
  options: any;
  isAdmin: boolean;
  periods: IPeriod[];
}

interface IDepartmentViewState {
  courses: ICourse[];
  loading: LoadStates;
  page: number;
  pages: number;
  filter: string;
}

export default class DepartmentsView extends SrUiComponent<
  IDepartmentsViewProps,
  IDepartmentViewState
> {
  initialState() {
    return {
      courses: [],
      loading: LoadStates.Unloaded,
      page: 0,
      pages: 0,
      filter: null,
    };
  }

  onComponentMounted() {
    const { options } = this.props;
    const { page, filter } = this.state;

    this.updateCourseList(
      page,
      options.department,
      options.period,
      filter,
      options.course
    );
  }

  getHandles() {
    return [
      AppBroadcastEvents.DepartmentCourseUpdated,
      AppBroadcastEvents.MeetingAdded,
      AppBroadcastEvents.MeetingUpdated,
      AppBroadcastEvents.MeetingDeleted,
      AppBroadcastEvents.ParticipantAdded,
      AppBroadcastEvents.ParticipantPromotionUpdated,
      AppBroadcastEvents.ParticipantDeleted,
      AppBroadcastEvents.UnregisteredDeleted,
      AppBroadcastEvents.DistributionListDeleted,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    const { options } = this.props;
    const { page, filter } = this.state;

    switch (msg.action) {
      case AppBroadcastEvents.DepartmentCourseUpdated:
      case AppBroadcastEvents.MeetingAdded:
      case AppBroadcastEvents.MeetingUpdated:
      case AppBroadcastEvents.MeetingDeleted:
      case AppBroadcastEvents.ParticipantAdded:
      case AppBroadcastEvents.ParticipantPromotionUpdated:
      case AppBroadcastEvents.ParticipantDeleted:
      case AppBroadcastEvents.UnregisteredDeleted:
      case AppBroadcastEvents.DistributionListDeleted:
        return this.updateCourseList(
          page,
          options.department,
          options.period,
          filter,
          options.course
        );
      default:
        return;
    }
  }

  async updateCourseList(
    page: number,
    department: string,
    period: string,
    filter: string,
    course: string
  ) {
    const { loading } = this.state;

    if (loading === LoadStates.Loading) {
      return;
    }
    if (isUndefined(department)) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.read(
        `departments/all/series?page=${page}&departmentId=${department}&periodId=${
          period || ''
        }&filter=${filter || ''}&courseId=${course}`
      );

      ErrorUtil.handleAPIErrors(resp, 'Error getting departments');

      const respData = JSON.parse(resp.data);
      this.setPartial({
        loading: LoadStates.Succeeded,
        courses: respData.data,
        page: respData.page,
        pages: respData.pages,
      });
    } catch (error) {
      this.setPartial({ loading: LoadStates.Failed });
      console.error(error);
    }
  }

  onNewProps(props: IDepartmentsViewProps) {
    const { options: prevOptions } = this.props;
    const { options: currOptions } = props;
    const { page, filter } = this.state;

    if (
      currOptions.period !== prevOptions.period ||
      currOptions.course !== prevOptions.course ||
      currOptions.department !== prevOptions.department
    ) {
      this.updateCourseList(
        page,
        currOptions.department,
        currOptions.period,
        filter,
        currOptions.course
      );
    }
  }

  parsedOptions(source: any) {
    return {
      department: Numbers.parse(source.department),
      period: Numbers.parse(source.period),
      course: Numbers.parse(source.course),
    };
  }

  filterUpdated(filter: string) {
    const { options } = this.props;
    const { page } = this.state;

    this.setPartial({ filter: filter });
    this.deferred(
      () => {
        const { department, period, course } = options;

        this.updateCourseList(page, department, period, filter, course);
      },
      350,
      'filter-update'
    );
  }

  returnToDepartments() {
    this.updateQuery(
      QueryUtility.buildQuery({ department: undefined, course: undefined })
    );
    this.setPartial({ page: 0, pages: 0 });
  }

  returnToDepartment() {
    this.updateQuery(QueryUtility.buildQuery({ course: undefined }));
    this.setPartial({ page: 0, pages: 0 });
  }

  selectedDepartment() {
    const { options, departments } = this.props;
    const parsed = this.parsedOptions(options);
    if (!parsed.department) return null;

    return (departments || []).find((d) => d.id === parsed.department);
  }

  selectedCourse() {
    const { options } = this.props;
    const { courses } = this.state;
    const parsed = this.parsedOptions(options);
    if (!parsed.course) return null;

    return (courses || []).find((c) => c.id === parsed.course);
  }

  performRender() {
    const { periods, groups, departments, options, isAdmin } = this.props;
    const { courses, loading, page, pages, filter } = this.state;
    let dept = this.selectedDepartment();
    let course = this.selectedCourse();

    return (
      <div className="departments-view department-management">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h3>
            <Breadcrumb>
              <BreadcrumbLink
                linkEnabled={!!dept}
                onClick={() => this.returnToDepartments()}
              >
                {Localizer.get('Departments')}
              </BreadcrumbLink>
              {!!dept && (
                <>
                  <BreadcrumbLink
                    linkEnabled={!!course}
                    onClick={() => this.returnToDepartment()}
                  >
                    {dept.name}
                  </BreadcrumbLink>{' '}
                  {!!course ? null : dept.default ? (
                    <span className="label label-warning">
                      {Localizer.get('Default')}
                    </span>
                  ) : (
                    <DepartmentRenameModalButton department={dept} />
                  )}
                </>
              )}
              {!!course && (
                <BreadcrumbLink linkEnabled={false}>
                  {course.name}
                </BreadcrumbLink>
              )}
            </Breadcrumb>
          </h3>
          {SystemRoleService.hasSomeRoles([
            SystemRoles.CLIENT_ADMIN,
            SystemRoles.ADMIN,
          ]) && !dept ? (
            <div>
              <AddDepartmentModalButton />
            </div>
          ) : null}
        </div>
        <ArbitraryGroupLayout
          groupType="Department"
          loading={loading}
          periods={periods}
          isAdmin={isAdmin}
          departments={departments}
          groups={groups}
          courses={courses}
          options={options}
          selectedCourse={course}
          pageNumber={page}
          pages={pages}
          filter={filter}
          pageChanged={(p) => {
            this.updateCourseList(
              p,
              options.department,
              options.period,
              filter,
              options.course
            );
          }}
          periodChanged={(p) => {
            this.updateQuery(
              QueryUtility.buildQuery({ period: p || undefined })
            );
          }}
          filterChanged={(p) => this.filterUpdated(p)}
        />
      </div>
    );
  }
}
