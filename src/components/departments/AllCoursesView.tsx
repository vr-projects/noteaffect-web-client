import * as React from 'react';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
  QueryUtility,
} from 'react-strontium';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import IDepartment from '../../models/IDepartment';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import Numbers from '../../utilities/Numbers';
import ArbitraryGroupLayout from './ArbitraryGroupLayout';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import ErrorUtil from '../../utilities/ErrorUtil';

interface IAllCoursesViewProps {
  periods: IPeriod[];
  isAdmin: boolean;
  departments: IDepartment[];
  groups: IAdminTag[];
  options: any; // Todo tech debt add interface
}

interface IAllCoursesViewState {
  courses: ICourse[];
  loading: LoadStates;
  page: number;
  pages: number;
  filter: string;
}

export default class AllCoursesView extends SrUiComponent<
  IAllCoursesViewProps,
  IAllCoursesViewState
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

    this.updateCourseList(page, options.period, filter, options.course);
  }

  getHandles() {
    return [
      AppBroadcastEvents.DepartmentCourseUpdated,
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
      case AppBroadcastEvents.MeetingUpdated:
      case AppBroadcastEvents.MeetingDeleted:
      case AppBroadcastEvents.ParticipantAdded:
      case AppBroadcastEvents.ParticipantPromotionUpdated:
      case AppBroadcastEvents.ParticipantDeleted:
      case AppBroadcastEvents.UnregisteredDeleted:
      case AppBroadcastEvents.DistributionListDeleted:
        return this.updateCourseList(
          page,
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
    period: string,
    filter: string,
    course: string
  ) {
    const { loading } = this.state;

    if (loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.read(
        `departments/all/series?page=${page}&periodId=${period || ''}&filter=${
          filter || ''
        }&courseId=${course}`
      );

      ErrorUtil.handleAPIErrors(resp, 'Error getting course list');

      const respData = JSON.parse(resp.data);
      this.setPartial({
        loading: LoadStates.Succeeded,
        courses: respData.data,
        page: respData.page,
        pages: respData.pages,
      });
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  onNewProps(newProps: IAllCoursesViewProps) {
    const { options: prevOptions } = this.props;
    const { options: currOptions } = newProps;
    const { page, filter } = this.state;

    if (
      currOptions.period !== prevOptions.period ||
      currOptions.course !== prevOptions.course
    ) {
      this.updateCourseList(
        page,
        currOptions.period,
        filter,
        currOptions.course
      );
    }
  }

  selectedCourse() {
    const { options } = this.props;
    const { courses } = this.state;
    const parsed = this.parsedOptions(options);
    if (!parsed.course) {
      return null;
    }

    return (courses || []).find((c) => c.id === parsed.course);
  }

  filterUpdated(filter: string) {
    const { options } = this.props;
    this.setPartial({ filter: filter });
    this.deferred(
      () => {
        this.updateCourseList(
          this.state.page,
          options.period,
          filter,
          options.course
        );
      },
      350,
      'filter-update'
    );
  }

  parsedOptions(source: any) {
    return {
      department: Numbers.parse(source.department),
      period: Numbers.parse(source.period),
      course: Numbers.parse(source.course),
    };
  }

  performRender() {
    const { periods, departments, groups, options, isAdmin } = this.props;
    const { courses, loading, page, pages, filter } = this.state;
    const course = this.selectedCourse();

    return (
      <div className="department-management">
        <div className="">
          <h3>
            <Breadcrumb>
              <BreadcrumbLink
                linkEnabled={!!course}
                onClick={() =>
                  this.updateQuery(
                    QueryUtility.buildQuery({ course: undefined })
                  )
                }
              >
                {Localizer.getFormatted(GENERAL_COMPONENT.ALL_COURSES_MEETINGS)}
              </BreadcrumbLink>
              {!!course ? (
                <BreadcrumbLink linkEnabled={false}>
                  {course.name}
                </BreadcrumbLink>
              ) : null}
            </Breadcrumb>
          </h3>
        </div>
        <ArbitraryGroupLayout
          groupType="All"
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
            this.updateCourseList(p, options.period, filter, options.course);
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
