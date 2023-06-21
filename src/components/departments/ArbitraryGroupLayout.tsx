import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Clearfix } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SrUiComponent, QueryUtility, LoadStates } from 'react-strontium';
import IDepartment from '../../models/IDepartment';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import ICourse from '../../models/ICourse';
import Numbers from '../../utilities/Numbers';
import GroupCourseDetail from './GroupCourseDetail';
import ArbitraryGroupDetail from './ArbitraryGroupDetail';
import { ARBITRARY_GROUP_LAYOUT_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import AppMappers from '../../mappers/AppMappers';
import SearchFilterInput from '../controls/SearchFilterInput';

interface IConnectedArbitraryGroupLayoutProps {
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
  lexicon?: string;
}

interface IArbitraryGroupLayoutProps {
  groupType: string;
  departments: IDepartment[];
  groups: IAdminTag[];
  isAdmin: boolean;
  options: any; // TODO tech debt add interface or type
  periods: IPeriod[];
  courses: ICourse[];
  selectedCourse: ICourse;
  loading: LoadStates;
  pageNumber: number;
  pages: number;
  filter: string;
  pageChanged: (newPage: number) => void;
  periodChanged: (periodId: number) => void;
  filterChanged: (filter: string) => void;
}

interface IArbitraryGroupLayoutState {
  filter: string;
}
class ArbitraryGroupLayout extends SrUiComponent<
  IArbitraryGroupLayoutProps & IConnectedArbitraryGroupLayoutProps,
  IArbitraryGroupLayoutState
> {
  selectGroup(group: { id: number; name: string }) {
    if (this.props.groupType === 'Department') {
      this.updateQuery(QueryUtility.buildQuery({ department: group.id }));
    } else if (this.props.groupType === 'Period') {
      this.updateQuery(QueryUtility.buildQuery({ period: group.id }));
    } else if (this.props.groupType === 'Group') {
      this.updateQuery(QueryUtility.buildQuery({ group: group.id }));
    }
  }

  itemSubtitle(group: { id: number; name: string }) {
    if (this.props.groupType !== 'Period') {
      return null;
    }

    return <p className="sub-title">{this.periodLabel(group as IPeriod)}</p>;
  }

  periodLabel(period: IPeriod) {
    if (!period.start || !period.end) {
      return Localizer.get('Unknown start or end');
    } else {
      return (
        moment(period.start * 1000).format('MMM Do YYYY') +
        ' - ' +
        moment(period.end * 1000).format('MMM Do YYYY')
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

  selectedId(): number {
    const parsed = this.parsedOptions(this.props.options);
    let result: { id: number; name: string } = null;
    if (this.props.groupType === 'Department' && parsed.department) {
      result = this.props.departments.find((d) => d.id === parsed.department);
    } else if (this.props.groupType === 'Period' && parsed.period) {
      result = this.props.periods.find((d) => d.id === parsed.period);
    } else if (this.props.groupType === 'Group' && parsed.group) {
      result = this.props.groups.find((d) => d.id === parsed.group);
    } else if (this.props.groupType === 'All') {
      return -1;
    }

    if (result) {
      return result.id;
    }

    return null;
  }

  selectedPeriodId(): string {
    const parsed = this.parsedOptions(this.props.options);
    let result: { id: number; name: string } = null;
    if (parsed.period) {
      result = this.props.periods.find((d) => d.id === parsed.period);
    }

    if (result) {
      return result.id.toString();
    }

    return 'all';
  }

  filteredGroups(): { id: number; name: string }[] {
    if (this.props.groupType === 'Department') {
      return this.props.departments;
    } else if (this.props.groupType === 'Period') {
      return this.props.periods;
    } else if (this.props.groupType === 'Group') {
      return this.props.groups;
    }

    return [];
  }

  performRender() {
    const {
      isEduVersion,
      isCorpVersion,
      options,
      selectedCourse,
      filterChanged,
      periodChanged,
      pageChanged,
      periods,
      pages,
      pageNumber,
      groupType,
      loading,
      departments,
      isAdmin,
      courses,
      groups,
    } = this.props;

    let groupId = this.selectedId();
    let periodId = this.selectedPeriodId();

    return (
      <div className="arbitrary-group-layout">
        {!!groupId && !!selectedCourse && (
          <GroupCourseDetail
            options={options}
            course={selectedCourse}
            isCorpVersion={isCorpVersion}
          />
        )}
        {!!groupId && !selectedCourse ? (
          <>
            <div className="row">
              <div className="search-filter col-sm-6">
                <SearchFilterInput
                  placeholder={Localizer.getFormatted(
                    ARBITRARY_GROUP_LAYOUT_COMPONENT.SEARCH_COURSES_MEETINGS
                  )}
                  updateCurrentVal={(val) => filterChanged(val)}
                  clearedInput={() => filterChanged('')}
                />
              </div>
              <div className="period col-sm-2">
                {/* //** Edu period select */}
                {isEduVersion && periods.length > 0 && groupType !== 'Period' && (
                  <>
                    <p className="helper-message">
                      {Localizer.get('Academic period')}
                    </p>
                    <select
                      value={periodId}
                      onChange={(e) =>
                        periodChanged(Numbers.parse(e.target.value))
                      }
                    >
                      <option value="all">
                        {Localizer.get('All academic periods')}
                      </option>
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {/* //** Corp other selector **/}
                {isCorpVersion && (
                  <>
                    <p className="helper-message">{Localizer.get('Sort by')}</p>
                    <select>
                      <option value="all">{Localizer.get('Show All')}</option>
                    </select>
                  </>
                )}
              </div>
              <div className="col-sm-4 text-right">
                {pages > 0 ? (
                  <>
                    <Button
                      bsStyle="info"
                      bsSize="small"
                      className="na-btn-reset-width"
                      disabled={!(pageNumber > 1)}
                      onClick={() => pageChanged(pageNumber - 1)}
                    >
                      <FaChevronLeft />
                    </Button>

                    <span>
                      {' '}
                      {Localizer.get('Page')} {pageNumber} {Localizer.get('of')}{' '}
                      {pages}{' '}
                    </span>

                    <Button
                      bsStyle="info"
                      bsSize="small"
                      className="na-btn-reset-width"
                      disabled={!(pageNumber < pages)}
                      onClick={() => pageChanged(pageNumber + 1)}
                    >
                      <FaChevronRight />
                    </Button>
                  </>
                ) : null}
              </div>
              <Clearfix />
              <hr />
            </div>
            <ArbitraryGroupDetail
              groupId={groupId}
              groupType={groupType}
              loading={loading}
              periods={periods}
              departments={departments}
              isAdmin={isAdmin}
              groups={groups}
              courses={courses}
              options={options}
            />
          </>
        ) : null}
        {!groupId && !selectedCourse ? (
          <>
            {this.filteredGroups().map((g) => (
              <div
                key={g.id}
                className="list-menu-item"
                onClick={() => this.selectGroup(g)}
              >
                {/* // TODO tech debt to button */}
                <p className="list-menu-title">{g.name}</p>
                {this.itemSubtitle(g)}
              </div>
            ))}
          </>
        ) : null}
      </div>
    );
  }
}

export default connect<
  IConnectedArbitraryGroupLayoutProps,
  {},
  IArbitraryGroupLayoutProps
>(AppMappers.VersionMapper)(ArbitraryGroupLayout);
