import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import { NAV_INSTRUCTOR_MENU_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IUserPermissions from '../../interfaces/IUserPermissions';
import NavMenuItem from './NavMenuItem';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface INavInstructorMenuProps {
  userPermissions: IUserPermissions;
  currentMenu: string;
  className?: string;
}

interface INavInstructorMenuState {}

export default class NavInstructorMenu extends SrUiComponent<
  INavInstructorMenuProps,
  INavInstructorMenuState
> {
  activeClass() {
    const { currentMenu } = this.props;
    return currentMenu.includes('instructor') ? 'active' : '';
  }

  performRender() {
    const { currentMenu, className = '' } = this.props;
    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.PRESENTER,
        SystemRoles.SALES_PRESENTER,
        SystemRoles.DEPARTMENT_ADMIN,
        SystemRoles.CLIENT_ADMIN,
        SystemRoles.ADMIN,
      ])
    ) {
      return null;
    }

    return (
      <>
        <Dropdown id="nav-instructor-menu">
          <Dropdown.Toggle
            noCaret
            className={`btn-info ${
              this.activeClass() ? 'active' : ''
            } ${className}`}
          >
            {Localizer.getFormatted(
              NAV_INSTRUCTOR_MENU_COMPONENT.INSTRUCTOR_PRESENTER_TOOLS
            )}{' '}
            <FaChevronDown />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavMenuItem
              target="instructor/courses"
              show={SystemRoleService.hasSomeRoles([
                SystemRoles.PRESENTER,
                SystemRoles.SALES_PRESENTER,
                SystemRoles.DEPARTMENT_ADMIN,
                SystemRoles.CLIENT_ADMIN,
                SystemRoles.ADMIN,
              ])}
              currentMenu={currentMenu}
            >
              {Localizer.getFormatted(
                NAV_INSTRUCTOR_MENU_COMPONENT.COURSE_MEETING_MANAGEMENT
              )}
            </NavMenuItem>
            <NavMenuItem
              target="instructor/questions"
              show={SystemRoleService.hasSomeRoles([
                SystemRoles.PRESENTER,
                SystemRoles.SALES_PRESENTER,
                SystemRoles.DEPARTMENT_ADMIN,
                SystemRoles.CLIENT_ADMIN,
                SystemRoles.ADMIN,
              ])}
              currentMenu={currentMenu}
            >
              {Localizer.get('Poll Builder')}
            </NavMenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}
