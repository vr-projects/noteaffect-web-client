import React from 'react';
import { Image } from 'react-bootstrap';
import { SrUiComponent, Animated } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import {
  getDistroSignUpUrl,
  getDistroLogInUrl,
} from '../../services/LinkService';
import Link from '../controls/Link';
import InvitationSVG from '../../svgs/invitation.svg';

interface IExternalRsvpDistroInvitationProps {
  email: string;
  code: string; // encoded user email
  ready: boolean;
}

interface IExternalRsvpDistroInvitationState {}

class ExternalRsvpDistroInvitation extends SrUiComponent<
  IExternalRsvpDistroInvitationProps,
  IExternalRsvpDistroInvitationState
> {
  performRender() {
    const { ready, email, code } = this.props;
    if (!ready) return null;
    const signUpUrl = getDistroSignUpUrl(email, code);
    const logInUrl = getDistroLogInUrl(email, code);

    return (
      // NOTE - Shared CSS classes for rsvp-invitation and rsvp-registration
      <div className="external-rsvp-distro-invitation rsvp-page">
        <Animated in>
          <div className="rsvp-grid">
            <div className="rsvp-title-container rsvp-grid-item">
              <h1 className="rsvp-title">
                {Localizer.get('You have been invited to a meeting!')}
              </h1>
            </div>
            <div className="rsvp-card-container rsvp-grid-item align-self-center">
              <div className="rsvp-card">
                <div className="unregistered-actions-container">
                  <p>
                    <strong>
                      {Localizer.get(
                        'If you would like to attend this meeting, you must register using the link below'
                      )}
                    </strong>
                  </p>
                  <hr className="breaker" />
                  <div className="unregistered-actions">
                    <Link
                      href={logInUrl}
                      disabled={false}
                      className="btn btn-success na-btn-reset-width"
                    >
                      {Localizer.get('Log in')}
                    </Link>
                    <small className="not-a-member">
                      {Localizer.get('Not a NoteAffect Member?')}
                    </small>
                    <Link
                      href={signUpUrl}
                      disabled={false}
                      className="btn-link-success"
                    >
                      {Localizer.get('Sign up for free')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="rsvp-image-container rsvp-grid-item">
              <Image
                src={InvitationSVG.toString()}
                className="invitation-image"
              />
            </div>
          </div>
        </Animated>
      </div>
    );
  }
}

export default ExternalRsvpDistroInvitation;
