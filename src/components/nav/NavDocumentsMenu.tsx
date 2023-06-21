import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import Localizer from '../../utilities/Localizer';
import IUserPermissions from '../../interfaces/IUserPermissions';
import NavMenuItem from './NavMenuItem';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface INavDocumentsMenuProps {
  userPermissions: IUserPermissions;
  currentMenu: string;
  className?: string;
}

interface IConnectedDocumentsMenuProps {
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
  lexicon?: string;
}

interface INavDocumentsMenuState {}

class NavDocumentsMenu extends SrUiComponent<
  INavDocumentsMenuProps & IConnectedDocumentsMenuProps,
  INavDocumentsMenuState
> {
  performRender() {
    const { currentMenu, className = '' } = this.props;

    return (
      <>
        <Dropdown id="nav-documents-menu">
          <Dropdown.Toggle
            noCaret
            className={`btn-info ${className} ${
              currentMenu.includes('documents/') ? 'active' : ''
            }`}
          >
            {Localizer.get('Documents')} <FaChevronDown />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <NavMenuItem
              show={SystemRoleService.hasSomeRoles([
                SystemRoles.SALES_PRESENTER,
                SystemRoles.DEPARTMENT_ADMIN,
                SystemRoles.CLIENT_ADMIN,
                SystemRoles.ADMIN,
              ])}
              currentMenu={currentMenu}
              target="documents/my-documents"
            >
              {Localizer.get('My Documents')}
            </NavMenuItem>
            <NavMenuItem
              show={true}
              currentMenu={currentMenu}
              target="documents/signature-requests"
            >
              {Localizer.get('Signature Requests')}
            </NavMenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

export default connect<
  IConnectedDocumentsMenuProps,
  {},
  INavDocumentsMenuProps
>(AppMappers.VersionMapper)(NavDocumentsMenu);
