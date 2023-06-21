import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import ExternalRsvpRegistrationGuard from '../components/guards/ExternalRsvpRegistrationGuard';

interface IExternalRsvpRegistrationViewProps {
  query: any;
}

interface IExternalRsvpRegistrationViewState {}

export default class ExternalRsvpRegistrationView extends AppViewWrapper<
  IExternalRsvpRegistrationViewProps & IAppViewWrapperProps,
  IExternalRsvpRegistrationViewState
> {
  getView() {
    const { query } = this.props;

    return (
      <div
        id="external-rsvp-registration-view"
        className="flex-grow-column-container section"
      >
        <ExternalRsvpRegistrationGuard query={query} />
      </div>
    );
  }

  getMenu() {
    return 'external-rsvp/registration';
  }
}
