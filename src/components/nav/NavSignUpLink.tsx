import React from 'react';
import Link from '../controls/Link';
import { getSignUpUrl, getDistroSignUpUrl } from '../../services/LinkService';
import Localizer from '../../utilities/Localizer';

interface INavSignUpLinkProps {
  isDistroInvitation?: boolean;
}

const NavSignUpLink = ({ isDistroInvitation = false }: INavSignUpLinkProps) => {
  const signUpUrl = isDistroInvitation
    ? getDistroSignUpUrl()
    : getSignUpUrl('rsvp/registration', true);

  return (
    <div className="nav-sign-up-link nav navbar-nav navbar-right">
      <Link
        href={signUpUrl}
        disabled={false}
        className="nav-menu-item navbar-main-btn btn-link-light"
      >
        <span>{Localizer.get('Sign up')}</span>
      </Link>
    </div>
  );
};

export default NavSignUpLink;
