import React from 'react';
import Link from '../controls/Link';
import { getLogInUrl, getDistroLogInUrl } from '../../services/LinkService';
import Localizer from '../../utilities/Localizer';

interface INavLogInLinkProps {
  isDistroInvitation?: boolean;
}

const NavLogInLink = ({ isDistroInvitation = false }: INavLogInLinkProps) => {
  const logInUrl = isDistroInvitation
    ? getDistroLogInUrl()
    : getLogInUrl('', false);

  return (
    <div className="nav-log-in-link nav navbar-nav navbar-right">
      <Link
        href={logInUrl}
        disabled={false}
        className="nav-menu-item navbar-main-btn btn-link-light"
      >
        <span>{Localizer.get('Log In')}</span>
      </Link>
    </div>
  );
};

export default NavLogInLink;
