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
import LivePollingView from './views/LivePollingView';

export default class NoteAffectApp {
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
        <ApiConfigElement
          key="local"
          name="local"
          connection={new SrWebApiConnection('http://localhost:56453/')}
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
          appTitle="Live Polling - NoteAffect"
          basePath="polling"
          defaultLocation="live"
          rootElement="polling-content"
        >
          <RouteConfigElement
            route="live"
            view={(d) => (
              <LivePollingView
                seriesId={d.query.seriesId}
                application={d.query.application}
                context={d.query.context}
                lectureId={d.query.lectureId}
              />
            )}
          />
        </UiConfigElement>
      </StrontiumApp>
    );
    ReactDOM.render(app, document.getElementById('polling-content'));
  }
}

new NoteAffectApp().run();
