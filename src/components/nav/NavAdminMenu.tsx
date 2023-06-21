import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import { NAV_ADMIN_MENU_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IUserPermissions from '../../interfaces/IUserPermissions';
import NavMenuItem from './NavMenuItem';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface INavAdminMenuProps {
  userPermissions: IUserPermissions;
  currentMenu: string;
  className?: string;
}

interface IConnectedNavAdminMenuProps {
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
  lexicon?: string;
}

interface INavAdminMenuState {}

class NavAdminMenu extends SrUiComponent<
  INavAdminMenuProps & IConnectedNavAdminMenuProps,
  INavAdminMenuState
> {
  performRender() {
    const { isCorpVersion, currentMenu, className = '' } = this.props;

    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.DEPARTMENT_ADMIN,
        SystemRoles.CLIENT_ADMIN,
        SystemRoles.ADMIN,
      ])
    ) {
      return null;
    }

    return (
      <>
        <Dropdown id="nav-admin-menu">
          <Dropdown.Toggle
            noCaret
            className={`btn-info ${
              currentMenu.includes('admin/') ? 'active' : ''
            } ${className}`}
          >
            {Localizer.get('Admin Tools')} <FaChevronDown />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {isCorpVersion && (
              <NavMenuItem
                show={SystemRoleService.hasSomeRoles([
                  SystemRoles.CLIENT_ADMIN,
                  SystemRoles.ADMIN,
                ])}
                currentMenu={currentMenu}
                target="admin/account"
              >
                {Localizer.get('Account Management')}
              </NavMenuItem>
            )}
            <NavMenuItem
              show={SystemRoleService.hasSomeRoles([
                SystemRoles.DEPARTMENT_ADMIN,
                SystemRoles.CLIENT_ADMIN,
                SystemRoles.ADMIN,
              ])}
              currentMenu={currentMenu}
              target="admin/departments"
            >
              {Localizer.getFormatted(
                NAV_ADMIN_MENU_COMPONENT.COURSE_MEETING_DEPT_MANAGEMENT
              )}
            </NavMenuItem>
            <NavMenuItem
              show={SystemRoleService.hasSomeRoles([SystemRoles.ADMIN])}
              currentMenu={currentMenu}
              target="admin/site"
              className="btn-info"
            >
              {Localizer.get('Site Admin')}
            </NavMenuItem>
            <NavMenuItem
              show={SystemRoleService.hasSomeRoles([
                SystemRoles.CLIENT_ADMIN,
                SystemRoles.ADMIN,
              ])}
              currentMenu={currentMenu}
              target="admin/users"
              className="btn-info"
            >
              {Localizer.get('Manage Users')}
            </NavMenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

export default connect<IConnectedNavAdminMenuProps, {}, INavAdminMenuProps>(
  AppMappers.VersionMapper
)(NavAdminMenu);
