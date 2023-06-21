import * as React from 'react';
import moment from 'moment';
import { Clearfix } from 'react-bootstrap';
import {
  SrUiComponent,
  QueryUtility,
  LoadStates,
  SrAppMessage,
  ApiHelpers,
} from 'react-strontium';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import IDepartment from '../../models/IDepartment';
import Localizer from '../../utilities/Localizer';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import AddPeriodPopover from './AddPeriodPopover';
import PeriodEditPopover from './PeriodEditPopover';
import Numbers from '../../utilities/Numbers';
import ArbitraryGroupLayout from './ArbitraryGroupLayout';
import ICourse from '../../models/ICourse';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import ErrorUtil from '../../utilities/ErrorUtil';

interface IPeriodsViewProps {
  departments: IDepartment[];
  groups: IAdminTag[];
  options: any;
  isAdmin: boolean;
  periods: IPeriod[];
}

interface IPeriodsViewState {
  courses: ICourse[];
  loading: LoadStates;
  page: number;
  pages: number;
  filter: string;
}

export default class PeriodsView extends SrUiComponent<
  IPeriodsViewProps,
  IPeriodsViewState
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
      AppBroadcastEvents.UnregisteredDeleted,
      AppBroadcastEvents.DistributionListDeleted,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    const { options } = this.props;
    const { page, filter } = this.state;

    switch (msg.action) {
      case AppBroadcastEvents.DepartmentCourseUpdated:
      case AppBroadcastEvents.UnregisteredDeleted:
      case AppBroadcastEvents.DistributionListDeleted:
        this.updateCourseList(page, options.period, filter, options.course);
        break;
      default:
        break;
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

      ErrorUtil.handleAPIErrors(
        resp,
        'There was an error updating your course list'
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

  onNewProps(props: IPeriodsViewProps) {
    const { options: currOptions } = props;
    const { options: prevOptions } = this.props;
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

  periodLabel(period: IPeriod) {
    if (!period.start || !period.end) {
      return Localizer.get('Unknown start or end');
    }

    // TODO tech debt update with DateFormatUtil
    return (
      moment(period.start * 1000).format('MMM Do YYYY') +
      ' - ' +
      moment(period.end * 1000).format('MMM Do YYYY')
    );
  }

  filterUpdated(filter: string) {
    const { options } = this.props;
    const { page } = this.state;

    this.setPartial({ filter: filter });
    this.deferred(
      () => {
        this.updateCourseList(page, options.period, filter, options.course);
      },
      350,
      'filter-update'
    );
  }

  parsedOptions(source: any) {
    return {
      department: Numbers.parse(source.department),
      period: Numbers.parse(source.period),
      group: Numbers.parse(source.group),
      course: Numbers.parse(source.course),
    };
  }

  returnToPeriods() {
    this.updateQuery(
      QueryUtility.buildQuery({ period: undefined, course: undefined })
    );
  }

  returnToPeriod() {
    this.updateQuery(QueryUtility.buildQuery({ course: undefined }));
  }

  selectedPeriod() {
    const { options, periods } = this.props;
    const parsed = this.parsedOptions(options);
    if (!parsed.period) {
      return null;
    }

    return (periods || []).find((d) => d.id === parsed.period);
  }

  selectedCourse() {
    const { options } = this.props;
    const { courses } = this.state;
    const parsed = this.parsedOptions(options);
    if (!parsed.course) return null;

    return (courses || []).find((c) => c.id === parsed.course);
  }

  performRender() {
    const { periods, departments, groups, options, isAdmin } = this.props;
    const { loading, courses, page, pages, filter } = this.state;
    const period = this.selectedPeriod();
    const course = this.selectedCourse();

    return (
      <div className="period-mgmt">
        <div className="row">
          <div className="col-sm-6 p-0">
            <h3>
              <Breadcrumb>
                <BreadcrumbLink
                  linkEnabled={!!period}
                  onClick={() => this.returnToPeriods()}
                >
                  {Localizer.get('Academic Periods')}
                </BreadcrumbLink>
                {period && (
                  <>
                    {period.name}{' '}
                    {period.default ? (
                      <span className="label label-warning">
                        {Localizer.get('Default')}
                      </span>
                    ) : (
                      <PeriodEditPopover period={period} />
                    )}
                  </>
                )}
              </Breadcrumb>
            </h3>
          </div>
          <Clearfix />
          {period && (
            <p className="helper-message">{this.periodLabel(period)}</p>
          )}
        </div>
        {this.props.isAdmin && !period && (
          <div className="row">
            <AddPeriodPopover />
            <hr />
          </div>
        )}
        <ArbitraryGroupLayout
          groupType="Period"
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
