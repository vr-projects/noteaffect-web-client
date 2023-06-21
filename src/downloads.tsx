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
import ExternalDownloadsBundleView from './views/ExternalDownloadsBundleView';
import ExternalDownloadsPresentationViewerView from './views/ExternalDownloadsPresentationViewerView';

export default class NoteAffectDownloadsApp {
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
          appTitle="Downloads - NoteAffect"
          basePath="downloads"
          defaultLocation="presentation-viewer"
          rootElement="downloads-content"
        >
          <RouteConfigElement
            route="bundle"
            view={(d) => <ExternalDownloadsBundleView query={d.query} />}
          />
          <RouteConfigElement
            route="presentation-viewer"
            view={(d) => (
              <ExternalDownloadsPresentationViewerView query={d.query} />
            )}
          />
        </UiConfigElement>
      </StrontiumApp>
    );
    ReactDOM.render(app, document.getElementById('downloads-content'));
  }
}

new NoteAffectDownloadsApp().run();
