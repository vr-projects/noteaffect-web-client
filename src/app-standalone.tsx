import * as React from 'react';
import {
  ServiceConfigElement,
  LogLevel,
  IApiConnection,
} from 'react-strontium';
import StandaloneConnection from './api/StandaloneConnection';
import StandaloneApiHelperService from './services/StandaloneApiHelperService';
import StandaloneApiHelperComponent from './components/standalone/StandaloneApiHelperComponent';
import NoteAffectApp from './app';
import IUserInformation from './interfaces/IUserInformation';
import IUserPermissions from './interfaces/IUserPermissions';

class StandaloneNoteAffectApp extends NoteAffectApp {
  private _apiService = new StandaloneApiHelperService(1000, true);

  connections(): { name: string; connection: IApiConnection }[] {
    return [
      {
        name: 'default',
        connection: new StandaloneConnection(this._apiService),
      },
    ];
  }

  services() {
    return <ServiceConfigElement id="apiService" service={this._apiService} />;
  }

  logLevel() {
    return LogLevel.Trace;
  }

  viewPlugins() {
    return <StandaloneApiHelperComponent />;
  }
}

window.onload = (_) => {
  var ui: IUserInformation = {
    firstName: 'Josh',
    lastName: 'Coulter',
    email: 'j.coulter82@gmail.com',
    id: 1,
    imageUrl: null,
    timezone: 'America/New_York',
    language: 'en',
    organizationName: 'Test Organization',
    departments: [{ id: 1, name: 'Uncategorized', default: true }],
  };

  var up: IUserPermissions = {
    canBuildQuestions: true,
    canViewDepartments: true,
    instructorOnly: false,
    isAdmin: true,
    isDepartmentAdmin: true,
    isClientAdmin: false,
    isPresenter: false,
    isSalesPresenter: false,
  };

  window.userInformation = ui;
  window.userPermissions = up;

  new StandaloneNoteAffectApp().run();
};
