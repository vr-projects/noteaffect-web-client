import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import RsvpDistroRegistrationGuard from '../components/guards/RsvpDistroRegistrationGuard';

interface IRsvpDistroRegistrationViewProps {
  query: any;
}

interface IRsvpDistroRegistrationViewState {}

export default class RsvpDistroRegistrationView extends AppViewWrapper<
  IRsvpDistroRegistrationViewProps & IAppViewWrapperProps,
  IRsvpDistroRegistrationViewState
> {
  getView() {
    const { query } = this.props;

    return (
      <div
        id="rsvp-distro-registration-view"
        className="rsvp-distro-registration-view flex-grow-column-container section"
      >
        <RsvpDistroRegistrationGuard query={query} />
      </div>
    );
  }

  getMenu() {
    return 'rsvp/distro-registration';
  }
}
