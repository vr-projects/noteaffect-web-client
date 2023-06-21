import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Dropdown, Button } from 'react-bootstrap';
import { FaChevronDown, FaPen } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IUserInformation from '../../interfaces/IUserInformation';
import NavMenuItem from './NavMenuItem';
import * as SecurityActions from '../../store/security/SecurityActions';

interface IConnectedNavUserProps extends DispatchProp<any> {}

interface INavUserProps {
  userInformation: IUserInformation;
  currentMenu: string;
  className?: string;
  onClicked?: () => void;
}

interface INavUserState {
  isOpen?: boolean;
  toggleOpen?: () => void;
}

class NavUserItem extends SrUiComponent<
  IConnectedNavUserProps & INavUserProps,
  INavUserState
> {
  initialState() {
    return { isOpen: false };
  }

  getUserName() {
    const {
      userInformation: { firstName, lastName },
    } = this.props;
    let parts = [];

    if (firstName) {
      parts.push(firstName);
    }
    if (lastName) {
      parts.push(lastName);
    }
    if (parts) {
      return parts.join(' ');
    }

    return null;
  }

  toggleOpen() {
    this.setPartial({ isOpen: !this.state.isOpen });
  }

  handleShutdownSecurityApp() {
    const { dispatch } = this.props;
    dispatch(SecurityActions.shutDownSecurityApp(true));
  }

  performRender() {
    const {
      currentMenu,
      onClicked,
      userInformation,
      className = '',
    } = this.props;
    const { isOpen } = this.state;
    const username = this.getUserName();

    return (
      <>
        <Dropdown
          id="nav-user-menu"
          className="nav-user-item"
          open={isOpen}
          onToggle={() => this.toggleOpen()}
          onClick={() => this.toggleOpen()}
        >
          <Dropdown.Toggle noCaret className={`btn-info ${className}`}>
            <span>{Localizer.get('Profile')}&nbsp;&nbsp;</span>
            <FaChevronDown />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavMenuItem
              target={null}
              show={true}
              currentMenu={currentMenu}
              onClicked={() => onClicked()}
            >
              <div className="d-flex align-items-center">
                <span className="nav-text bold mr-1">
                  {username ? (
                    <>
                      <strong>{username}</strong>
                      <br />
                    </>
                  ) : (
                    Localizer.get('Unknown User')
                  )}
                  <span>{userInformation.email}</span>
                </span>
                <FaPen className="edit-icon" />
              </div>
            </NavMenuItem>
            <form action="/account/logout" method="post">
              <Button
                type="submit"
                className="nav-link w-100"
                bsStyle="info"
                onClick={() => this.handleShutdownSecurityApp()}
              >
                {Localizer.get('Log out')}
              </Button>
            </form>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

export default connect<IConnectedNavUserProps, void, INavUserProps>(() => {
  return {};
})(NavUserItem);
