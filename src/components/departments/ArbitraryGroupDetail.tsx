import * as React from 'react';
import {
  SrUiComponent,
  TabbedViewer,
  Animated,
  LoadStates,
  QueryUtility,
} from 'react-strontium';
import IDepartment from '../../models/IDepartment';
import { ARBITRARY_GROUP_DETAIL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import GroupEngagement from './GroupEngagement';
import ICourse from '../../models/ICourse';
import GroupAnalytics from './GroupAnalytics';
import ArbitraryGroupCourses from './ArbitraryGroupCourses';
import Numbers from '../../utilities/Numbers';

interface IArbitraryGroupDetailProps {
  groupId: number;
  groupType: string;
  isAdmin: boolean;
  departments: IDepartment[];
  groups: IAdminTag[];
  periods: IPeriod[];
  courses: ICourse[];
  options: any;
  loading: LoadStates;
}

interface IArbitraryGroupDetailState {}

export default class ArbitraryGroupDetail extends SrUiComponent<
  IArbitraryGroupDetailProps,
  IArbitraryGroupDetailState
> {
  initialState(): IArbitraryGroupDetailState {
    return {};
  }

  allowedMenu() {
    const { groupMenu } = this.props.options;
    if (
      !groupMenu ||
      ['courses', 'engagement', 'analytics'].indexOf(groupMenu) === -1
    ) {
      return 'courses';
    }

    return groupMenu;
  }

  tabs() {
    const {
      courses,
      periods,
      departments,
      isAdmin,
      groupId,
      groupType,
      groups,
      loading,
      options,
    } = this.props;
    const tabs = [
      {
        title: Localizer.getFormatted(
          ARBITRARY_GROUP_DETAIL_COMPONENT.COURSES_MEETINGS_TAB
        ),
        id: 'courses',
        content: (
          <Animated in key="lectures-tab">
            <ArbitraryGroupCourses
              courses={courses}
              periods={periods}
              departments={departments}
              departmentAdmin={isAdmin}
              groupId={groupId}
              groupType={groupType}
              groups={groups}
              loading={loading}
            />
          </Animated>
        ),
      },
      {
        title: Localizer.get('Engagement'),
        id: 'engagement',
        content: (
          <Animated in key="engagement-tab">
            <GroupEngagement
              groupType={groupType}
              groupId={groupId}
              courses={courses}
              periodId={Numbers.parse(options.period)}
            />
          </Animated>
        ),
      },
      {
        title: Localizer.get('Analytics'),
        id: 'analytics',
        content: (
          <Animated in key="analytics-tab">
            <GroupAnalytics
              groupType={groupType}
              groupId={groupId}
              courses={courses}
              periodId={Numbers.parse(options.period)}
            />
          </Animated>
        ),
      },
    ];
    return tabs;
  }

  performRender() {
    const {
      courses,
      periods,
      departments,
      isAdmin,
      groupId,
      groupType,
      groups,
      loading,
    } = this.props;
    if (loading !== LoadStates.Succeeded && !courses && !periods && !groups) {
      return null;
    }

    return (
      <div>
        {groupType === 'All' ? (
          <ArbitraryGroupCourses
            courses={courses}
            periods={periods}
            departmentAdmin={isAdmin}
            groupId={groupId}
            groupType={groupType}
            departments={departments}
            groups={groups}
            loading={loading}
          />
        ) : (
          <TabbedViewer
            tabSelected={(id) =>
              this.updateQuery(QueryUtility.buildQuery({ groupMenu: id }))
            }
            tabs={this.tabs()}
            currentSelection={this.allowedMenu()}
          ></TabbedViewer>
        )}
      </div>
    );
  }
}
