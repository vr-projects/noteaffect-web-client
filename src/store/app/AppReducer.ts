import AppActionTypes from './AppActionTypes';
import AppRecord from './AppRecord';
import has from 'lodash/has';
import * as Immutable from 'immutable';

const initialState = new AppRecord();
export default function appReducer(
  state: AppRecord = initialState,
  action: any = {}
) {
  switch (action.type as AppActionTypes) {
    // Existing App actions
    case AppActionTypes.ChangeMenu:
      return state.with({ menu: action.value });
    case AppActionTypes.SetUserInfo:
      return state.with({ userInformation: action.value });
    case AppActionTypes.SetUserPermissions:
      return state.with({ userPermissions: action.value });
    case AppActionTypes.SetAppEnvironment:
      return state.with({ appEnvironment: action.value });
    case AppActionTypes.SetClientData:
      return state.with({ clientData: action.value });
    case AppActionTypes.SetAppLogoUrl:
      return state.with({ logoUrl: action.value });
    case AppActionTypes.SetStoreLoading:
      return state.with({ storeLoading: action.value });
    case AppActionTypes.SetIsPresentationFullscreen:
      return state.with({ isPresentationFullscreen: action.value });
    case AppActionTypes.SetUserProfileFirstName:
      const prevUserInformationWithFirstName = state
        .get('userInformation')
        .toJS();
      const newUserInformationWithFirstName = {
        ...prevUserInformationWithFirstName,
        firstName: action.value,
      };
      const updatedUserInformationWithFirstName = Immutable.Map({
        ...newUserInformationWithFirstName,
      });
      return state.with({
        userInformation: updatedUserInformationWithFirstName,
      });
    case AppActionTypes.SetUserProfileLastName:
      const prevUserInformationWithLastName = state
        .get('userInformation')
        .toJS();
      const newUserInformationWithLastName = {
        ...prevUserInformationWithLastName,
        lastName: action.value,
      };
      const updatedUserInformationWithLastName = Immutable.Map({
        ...newUserInformationWithLastName,
      });
      return state.with({
        userInformation: updatedUserInformationWithLastName,
      });
    case AppActionTypes.SetUserProfileTimezone:
      const prevUserInformationWithTz = state.get('userInformation').toJS();
      const newUserInformationWithTz = {
        ...prevUserInformationWithTz,
        timezone: action.value,
      };
      const updatedUserInformationWithTz = Immutable.Map({
        ...newUserInformationWithTz,
      });
      return state.with({
        userInformation: updatedUserInformationWithTz,
      });
    default:
      return state;
  }
}

export function getMenu(state) {
  return state.app.menu !== null ? state.app.menu : '';
}

export function getUserInformation(state) {
  return state.app.userInformation;
}

export function getUserPermissions(state) {
  return state.app.userPermissions;
}

export function getAppEnvironment(state) {
  return state.app.appEnvironment;
}

export function getAppEnvironmentLexicon(state) {
  return state.app.appEnvironment.toJS().lexicon;
}

export function getIsCorpVersion(state) {
  const appEnvironment = state.app.appEnvironment.toJS();

  if (has(appEnvironment, 'client') && has(appEnvironment.client, 'lexicon')) {
    return appEnvironment.client.lexicon === 'corp';
  }
}

export function getIsEduVersion(state) {
  const appEnvironment = state.app.appEnvironment.toJS();

  if (has(appEnvironment, 'client') && has(appEnvironment.client, 'lexicon')) {
    return appEnvironment.client.lexicon === 'edu';
  }
}

export function getAppLogoUrl(state) {
  const appEnvironment = state.app.appEnvironment.toJS();
  if (has(appEnvironment, 'client') && has(appEnvironment, 'logoUrl')) {
    return appEnvironment.client.logoUrl;
  }

  return state.app.logoUrl;
}

export function getUserPermissionsJS(state) {
  return state.app.userPermissions.toJS();
}

export function getClientData(state) {
  return state.app.clientData.toJS();
}

export function getIsPresentationFullscreen(state) {
  return state.app.isPresentationFullscreen;
}

export function getIsStoreLoading(state) {
  return state.app.storeLoading;
}
