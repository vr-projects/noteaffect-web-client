import * as React from 'react';
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
import { GROUPS_VIEW_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import ICourse from '../../models/ICourse';
import Numbers from '../../utilities/Numbers';
import ArbitraryGroupLayout from './ArbitraryGroupLayout';
import AddGroupPopover from './AddGroupPopover';
import GroupRenamePopover from './GroupRenamePopover';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import ErrorUtil from '../../utilities/ErrorUtil';

interface IGroupsViewProps {
  departments: IDepartment[];
  groups: IAdminTag[];
  options: any;
  isAdmin: boolean;
  periods: IPeriod[];
}

interface IGroupsViewState {
  courses: ICourse[];
  loading: LoadStates;
  page: number;
  pages: number;
  filter: string;
}

export default class GroupsView extends SrUiComponent<
  IGroupsViewProps,
  IGroupsViewState
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
      options.group,
      options.period,
      filter,
      options.course
    );
  }

  getHandles() {
    return [
      AppBroadcastEvents.DepartmentCourseUpdated,
      AppBroadcastEvents.MeetingDeleted,
      AppBroadcastEvents.UnregisteredDeleted,
      AppBroadcastEvents.DistributionListDeleted,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    const { options } = this.props;
    const { page, filter } = this.state;

    switch (msg.action) {
      case AppBroadcastEvents.DepartmentCourseUpdated:
      case AppBroadcastEvents.MeetingDeleted:
      case AppBroadcastEvents.UnregisteredDeleted:
      case AppBroadcastEvents.DistributionListDeleted:
        this.updateCourseList(
          page,
          options.group,
          options.period,
          filter,
          options.course
        );
        break;

      default:
        break;
    }
  }

  async updateCourseList(
    page: number,
    group: string,
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
        `departments/all/series?page=${page}&groupId=${group}&periodId=${
          period || ''
        }&filter=${filter || ''}&courseId=${course}`
      );

      ErrorUtil.handleAPIErrors(
        resp,
        'There was an error getting your course list'
      );

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

  onNewProps(props: IGroupsViewProps) {
    const { options: prevOptions } = this.props;
    const { options: currOptions } = props;
    const { page, filter } = this.state;

    if (
      currOptions.period !== prevOptions.period ||
      currOptions.course !== prevOptions.course ||
      currOptions.group !== prevOptions.group
    ) {
      this.updateCourseList(
        page,
        currOptions.group,
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
      group: Numbers.parse(source.group),
      course: Numbers.parse(source.course),
    };
  }

  filterUpdated(filter: string) {
    const { options } = this.props;
    const { page } = this.state;

    this.setPartial({ filter: filter });
    this.deferred(
      () => {
        this.updateCourseList(
          page,
          options.group,
          options.period,
          filter,
          options.course
        );
      },
      350,
      'filter-update'
    );
  }

  returnToGroups() {
    this.updateQuery(
      QueryUtility.buildQuery({ group: undefined, course: undefined })
    );
  }

  returnToGroup() {
    this.updateQuery(QueryUtility.buildQuery({ course: undefined }));
  }

  selectedGroup() {
    const { options, groups } = this.props;
    const parsed = this.parsedOptions(options);
    if (!parsed.group) {
      return null;
    }

    return (groups || []).find((d) => d.id === parsed.group);
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
    const group = this.selectedGroup();
    const course = this.selectedCourse();

    return (
      <div className="department-mgmt">
        <div className="row">
          <div className="col-sm-6 p-0">
            <h3>
              <Breadcrumb>
                <BreadcrumbLink
                  linkEnabled={!!group}
                  onClick={() => this.returnToGroups()}
                >
                  {Localizer.get('Groups')}
                </BreadcrumbLink>
                {!!group && (
                  <>
                    <BreadcrumbLink
                      linkEnabled={!!course}
                      onClick={() => this.returnToGroup()}
                    >
                      {group.name}
                    </BreadcrumbLink>{' '}
                    {!!course ? null : <GroupRenamePopover group={group} />}
                  </>
                )}
                {!!course && (
                  <BreadcrumbLink linkEnabled={false}>
                    {course.name}
                  </BreadcrumbLink>
                )}
              </Breadcrumb>
            </h3>
          </div>
        </div>
        {!group ? (
          <div className="row">
            <p>{Localizer.getFormatted(GROUPS_VIEW_COMPONENT.DESCRIPTION)}</p>
          </div>
        ) : null}
        {this.props.isAdmin && !group ? (
          <div className="row">
            <AddGroupPopover />
            <hr />
          </div>
        ) : null}
        <ArbitraryGroupLayout
          groupType="Group"
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
              options.group,
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
