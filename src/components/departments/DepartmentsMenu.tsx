import * as React from 'react';
import { connect } from 'react-redux';
import { FaList, FaTag, FaRegClock, FaThLarge } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  QueryUtility,
  Animated,
} from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import IDepartment from '../../models/IDepartment';
import {
  DEPARTMENTS_COMPONENT,
  GENERAL_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import MenuView from '../controls/MenuView';
import MenuNavItem from '../controls/MenuNavItem';
import AsyncComponentLoader from '../AsyncComponentLoader';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IDepartmentsMenuProps {
  isAdmin: boolean;
  departmentsLoading: LoadStates;
  departments: IDepartment[];
  options: any; // TODO tech debt needs interface or shape -- is query params
  groups: IAdminTag[];
  periods: IPeriod[];
}

interface IConnectedDepartmentsMenuProps {
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
  lexicon?: string;
}

interface IDepartmentsMenuState {}

class DepartmentsMenu extends SrUiComponent<
  IDepartmentsMenuProps & IConnectedDepartmentsMenuProps,
  IDepartmentsMenuState
> {
  private _allowedMenus: string[];

  onComponentMounted() {
    this.setupView();
  }

  async setupView() {
    const allowedViews = this.props.isCorpVersion
      ? ['departments', 'courses']
      : ['departments', 'periods', 'groups', 'courses'];
    this._allowedMenus = allowedViews;

    this.forceUpdate();
  }

  handleShowMenuView = (id) => {
    this.updateQuery(QueryUtility.buildQuery({ menu: id }, true));
  };

  allowedMenu() {
    if (
      !this.props.options.menu ||
      !this._allowedMenus ||
      this._allowedMenus.indexOf(this.props.options.menu) === -1
    ) {
      return 'departments';
    }

    return this.props.options.menu;
  }

  performRender() {
    const {
      departments,
      groups,
      periods,
      options,
      isAdmin,
      isEduVersion,
    } = this.props;

    return (
      <div className="departments-menu course-department-management">
        {departments && groups && periods && (
          <>
            <MenuView
              header={Localizer.getFormatted(
                DEPARTMENTS_COMPONENT.COURSES_MEETINGS_DEPTS
              )}
              onNavItemSelected={(id) => this.handleShowMenuView(id)}
              currentSelection={this.allowedMenu()}
            >
              <MenuNavItem
                id="departments"
                content={() => (
                  <div key="departments-tab">
                    <AsyncComponentLoader
                      loader={() => import('./DepartmentsView')}
                      options={options}
                      periods={periods}
                      isAdmin={isAdmin}
                      groups={groups}
                      departments={departments}
                    />
                  </div>
                )}
              >
                <FaThLarge />
                <span>{Localizer.get('Departments')}</span>
              </MenuNavItem>
              {this.props.isEduVersion && (
                <MenuNavItem
                  id="periods"
                  content={() => (
                    <div key="periods-tab">
                      <AsyncComponentLoader
                        loader={() => import('./PeriodsView')}
                        options={options}
                        isAdmin={isAdmin}
                        groups={groups}
                        departments={departments}
                        periods={periods}
                      />
                    </div>
                  )}
                >
                  <FaRegClock />
                  <span>{Localizer.get('Presentation Periods')}</span>
                </MenuNavItem>
              )}
              {isEduVersion && (
                <MenuNavItem
                  id="groups"
                  content={() => (
                    <Animated in key="groups-tab">
                      <AsyncComponentLoader
                        loader={() => import('./GroupsView')}
                        options={options}
                        periods={periods}
                        isAdmin={isAdmin}
                        groups={groups}
                        departments={departments}
                      />
                    </Animated>
                  )}
                >
                  <FaTag />
                  <span>
                    {Localizer.getFormatted(
                      GENERAL_COMPONENT.COURSE_MEETING_GROUPS
                    )}
                  </span>
                </MenuNavItem>
              )}
              {SystemRoleService.hasSomeRoles([
                SystemRoles.ADMIN,
                SystemRoles.CLIENT_ADMIN,
              ]) && (
                <MenuNavItem
                  id="courses"
                  content={() => (
                    <Animated in key="courses-tab">
                      <AsyncComponentLoader
                        loader={() => import('./AllCoursesView')}
                        options={options}
                        periods={periods}
                        departments={departments}
                        isAdmin={isAdmin}
                        groups={groups}
                      />
                    </Animated>
                  )}
                >
                  <FaList />
                  <span>
                    {Localizer.getFormatted(
                      GENERAL_COMPONENT.ALL_COURSES_MEETINGS
                    )}
                  </span>
                </MenuNavItem>
              )}
            </MenuView>
          </>
        )}
      </div>
    );
  }
}

// export default DepartmentsComponent;
export default connect<
  IConnectedDepartmentsMenuProps,
  {},
  IDepartmentsMenuProps
>(AppMappers.VersionMapper)(DepartmentsMenu);
