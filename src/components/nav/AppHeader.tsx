import * as React from 'react';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import { SrUiComponent, LoadStates } from 'react-strontium';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import { Navbar, Nav, Image } from 'react-bootstrap';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import NavMenuItem from './NavMenuItem';
import NavAdminMenu from './NavAdminMenu';
import NavUserItem from './NavUserItem';
import NavInstructorMenu from './NavInstructorMenu';
import NavDocumentsMenu from './NavDocumentsMenu';
import NavLogInLink from './NavLogInLink';
import NavSignUpLink from './NavSignUpLink';
import CorpUserProfileModal from 'components/corp/CorpUserProfileModal';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IAppHeaderProps {
  route: string;
  query: string;
  menu: string;
  userInformation?: IUserInformation;
  userPermissions?: IUserPermissions;
  isCorpVersion: boolean;
  logoUrl: string | null;
  storeLoading: LoadStates;
}

interface IAppHeaderState {
  logoSrc: string | null;
  imageLoading: boolean;
  isUserProfileModalOpen: boolean;
}

class AppHeader extends SrUiComponent<IAppHeaderProps, IAppHeaderState> {
  initialState() {
    return {
      logoSrc: null,
      imageLoading: true,
      hideNavMenuButtons: false,
      isUserProfileModalOpen: false,
    };
  }

  imageLoaded = () => {
    this.setPartial({
      imageLoading: false,
    });
  };

  /**
   * Method hides main app buttons for rsvp route, unregistered users
   * @param route
   * @param query
   */
  getShowNavMenuButtons(route, query) {
    if (isUndefined(route) || isUndefined(query)) {
      return true;
    }

    // handle external routes not logged in for RSVP and Downloads routes
    const onExternalRoute = route.includes('external');

    return !onExternalRoute;
  }

  /**
   * Method checks if is on external-rsvp/distro-invitation
   * for distribution list email RSVP
   * @param route
   */
  getIsExternalRsvpDistroInvitation(route) {
    if (isUndefined(route)) {
      return false;
    }

    const isExternalRsvpDistroInvitation =
      route.includes('external') && route.includes('distro-invitation');
    return isExternalRsvpDistroInvitation;
  }

  /**
   * Method checks if is on external downloads route and hides Log In and Sign up buttons
   * @param route
   */
  getIsExternalDownloads(route) {
    if (isUndefined(route)) {
      return false;
    }
    return route.includes('external-downloads');
  }

  toggleUserProfileModalOpen() {
    this.setPartial({
      isUserProfileModalOpen: !this.state.isUserProfileModalOpen,
    });
  }

  performRender() {
    const {
      menu,
      route,
      query,
      logoUrl,
      isCorpVersion,
      userPermissions,
      userInformation,
    } = this.props;
    const { isUserProfileModalOpen } = this.state;
    const hasClientLogo = isCorpVersion && logoUrl;
    const showNavMenuButtons = this.getShowNavMenuButtons(route, query);
    const isDistroInvitation = this.getIsExternalRsvpDistroInvitation(route);
    const isExternalDownloads = this.getIsExternalDownloads(route);

    return (
      <>
        <Navbar
          className={`app-header ${hasClientLogo ? 'has-logo' : ''}`}
          collapseOnSelect
          fixedTop
        >
          <Navbar.Header>
            {hasClientLogo ? (
              <Image
                alt="Client logo"
                className="client-logo nav-button left image"
                src={logoUrl}
                responsive
                onLoad={this.imageLoaded}
                onClick={() => {
                  this.navigate(
                    SystemRoleService.hasSomeRoles([
                      SystemRoles.ADMIN,
                      SystemRoles.CLIENT_ADMIN,
                      SystemRoles.DEPARTMENT_ADMIN,
                      SystemRoles.PRESENTER,
                      SystemRoles.SALES_PRESENTER,
                    ])
                      ? 'instructor/courses'
                      : 'dashboard'
                  );
                }}
              />
            ) : (
              <Navbar.Brand>
                <Image
                  alt="NoteAffect logo"
                  className="navbar-brand nav-button left image"
                  src={'/images/na-logo-light.svg?version=final'}
                  onClick={() => {
                    this.navigate(
                      SystemRoleService.hasSomeRoles([
                        SystemRoles.ADMIN,
                        SystemRoles.CLIENT_ADMIN,
                        SystemRoles.DEPARTMENT_ADMIN,
                        SystemRoles.PRESENTER,
                        SystemRoles.SALES_PRESENTER,
                      ])
                        ? 'instructor/courses'
                        : 'dashboard'
                    );
                  }}
                />
              </Navbar.Brand>
            )}
            <Navbar.Toggle className="navbar-toggle" aria-controls="nav-menu" />
          </Navbar.Header>

          {/* Internal App Controls */}
          <Navbar.Collapse id="nav-menu-instructor-admin">
            {showNavMenuButtons && (
              <>
                <Nav>
                  <NavInstructorMenu
                    userPermissions={userPermissions}
                    currentMenu={menu}
                    className="navbar-main-btn"
                  />
                  <NavMenuItem
                    type="button"
                    className="navbar-main-btn"
                    menu="courses"
                    target="dashboard"
                    show
                    currentMenu={menu}
                  >
                    {Localizer.getFormatted(
                      GENERAL_COMPONENT.STUDENT_COURSES_PARTICIPANT_MEETINGS
                    )}
                  </NavMenuItem>
                  <NavAdminMenu
                    userPermissions={userPermissions}
                    currentMenu={menu}
                    className="navbar-main-btn"
                  />
                  <NavDocumentsMenu
                    userPermissions={userPermissions}
                    currentMenu={menu}
                    className="navbar-main-btn"
                  />
                </Nav>

                <Nav className="nav navbar-nav navbar-right">
                  <NavUserItem
                    userInformation={userInformation}
                    currentMenu={menu}
                    className="navbar-main-btn"
                    onClicked={() => this.toggleUserProfileModalOpen()}
                  />
                </Nav>

                {!isEmpty(userInformation) && (
                  <CorpUserProfileModal
                    show={isUserProfileModalOpen}
                    onClosed={() => this.toggleUserProfileModalOpen()}
                  />
                )}
              </>
            )}
            {/* External Routes - RSVP and Downloads */}
            {!showNavMenuButtons && !isExternalDownloads && (
              <>
                <NavSignUpLink isDistroInvitation={isDistroInvitation} />
                <NavLogInLink isDistroInvitation={isDistroInvitation} />
              </>
            )}
          </Navbar.Collapse>
        </Navbar>
      </>
    );
  }
}

export default AppHeader;
