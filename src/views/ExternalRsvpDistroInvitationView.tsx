import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import ExternalRsvpDistroInvitationGuard from '../components/guards/ExternalRsvpDistroInvitationGuard';

interface IExternalRsvpDistroInvitationViewProps {
  query: any;
}

interface IExternalRsvpDistroInvitationViewState {}

export default class ExternalRsvpInvitationView extends AppViewWrapper<
  IExternalRsvpDistroInvitationViewProps & IAppViewWrapperProps,
  IExternalRsvpDistroInvitationViewState
> {
  getView() {
    const { query } = this.props;

    return (
      <div
        id="external-rsvp-distro-invitation-view"
        className="external-rsvp-distro-invitation-view flex-grow-column-container section"
      >
        <ExternalRsvpDistroInvitationGuard query={query} />
      </div>
    );
  }

  getMenu() {
    return 'external-rsvp/distro-invitation';
  }
}
