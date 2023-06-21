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
import ExportNotesView from './views/ExportNotesView';

export default class NoteAffectPrintApp {
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
          appTitle="Export Notes - NoteAffect"
          basePath="print"
          defaultLocation="export"
          rootElement="print-content"
        >
          <RouteConfigElement
            route="export/:seriesId/:lectureId"
            view={(d) => {
              return <ExportNotesView />;
            }}
          />
        </UiConfigElement>
      </StrontiumApp>
    );
    ReactDOM.render(app, document.getElementById('print-content'));
  }
}

new NoteAffectPrintApp().run();
