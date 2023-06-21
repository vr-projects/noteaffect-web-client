import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  ServicesConfigElement,
  ServiceConfigElement,
  StrontiumApp,
  LoggerConfigElement,
  ApiConfigElement,
  UiConfigElement,
  LogLevel,
  RouteConfigElement,
  SrWebApiConnection,
} from 'react-strontium';
import ServiceReduxConnectionServices from './services/ServiceReduxConnectionServices';
import ExternalRsvpDistroInvitationView from './views/ExternalRsvpDistroInvitationView';
import ExternalRsvpRegistrationView from './views/ExternalRsvpRegistrationView';

export default class NoteAffectRsvpApp {
  logLevel(): LogLevel {
    if ((process as any).env.NODE_ENV !== 'production') {
      return LogLevel.None;
    }
    return LogLevel.Warn;
  }

  run() {
    let app = (
      <StrontiumApp>
        <LoggerConfigElement loggingLevel={this.logLevel()} />
        <ApiConfigElement
          key="default"
          name="default"
          connection={new SrWebApiConnection('/api/')}
        />
        <ServicesConfigElement>
          <ServiceConfigElement
            id="serviceReduxConnection"
            service={new ServiceReduxConnectionServices()}
          />
        </ServicesConfigElement>
        <UiConfigElement
          urlNavigationEnabled
          navigateOnQueryChanges
          appTitle="RSVP - NoteAffect"
          basePath="rsvp"
          defaultLocation="distro-invitation"
          rootElement="rsvp-content"
        >
          <RouteConfigElement
            route="distro-invitation"
            view={(d) => <ExternalRsvpDistroInvitationView query={d.query} />}
          />
          <RouteConfigElement
            route="registration"
            view={(d) => <ExternalRsvpRegistrationView query={d.query} />}
          />
        </UiConfigElement>
      </StrontiumApp>
    );
    ReactDOM.render(app, document.getElementById('rsvp-content'));
  }
}

new NoteAffectRsvpApp().run();
