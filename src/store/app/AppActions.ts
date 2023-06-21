import { ApiHelpers, LoadStates } from 'react-strontium';
import AppActionTypes from './AppActionTypes';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IAppEnvironment from '../../interfaces/IAppEnvironment';
import IClientData from '../../interfaces/IClientData';

export function changeMenu(name: string) {
  return async (dispatch, state) => {
    dispatch({ type: AppActionTypes.ChangeMenu, value: name });
  };
}

export function setUserInformation(userInfo: IUserInformation) {
  return async (dispatch, state) => {
    dispatch({ type: AppActionTypes.SetUserInfo, value: userInfo });
  };
}

export function setUserPermissions(userPermissions: IUserPermissions) {
  return async (dispatch, state) => {
    dispatch({
      type: AppActionTypes.SetUserPermissions,
      value: userPermissions,
    });
  };
}

export function setAppEnvironment(appEnvironment: IAppEnvironment) {
  return async (dispatch, state) => {
    dispatch({ type: AppActionTypes.SetAppEnvironment, value: appEnvironment });
  };
}

export function setAppLogoUrl(logoUrl: string) {
  return async (dispatch, state) => {
    dispatch({ type: AppActionTypes.SetAppLogoUrl, value: logoUrl });
  };
}

export function setClientData(clientData: IClientData) {
  return async (dispatch, state) => {
    dispatch({ type: AppActionTypes.SetClientData, value: clientData });
  };
}

export function setStoreLoading(storeLoading: LoadStates) {
  return async (dispatch, state) => {
    dispatch({ type: AppActionTypes.SetStoreLoading, value: storeLoading });
  };
}

export function toggleIsPresentationFullscreen(
  isPresentationFullscreen: boolean
) {
  return async (dispatch, state) => {
    dispatch({
      type: AppActionTypes.SetIsPresentationFullscreen,
      value: isPresentationFullscreen,
    });
  };
}

export function setUserProfile(userProfile: {
  firstName: string;
  lastName: string;
  timezone: string;
}) {
  return async (dispatch, state) => {
    dispatch({
      type: AppActionTypes.SetUserProfileFirstName,
      value: userProfile.firstName,
    });
    dispatch({
      type: AppActionTypes.SetUserProfileLastName,
      value: userProfile.lastName,
    });
    dispatch({
      type: AppActionTypes.SetUserProfileTimezone,
      value: userProfile.timezone,
    });
  };
}

export function loadClientData() {
  return async (dispatch, state) => {
    if (state.adminLoading === LoadStates.Loading) {
      return;
    }

    dispatch({
      type: AppActionTypes.SetStoreLoading,
      value: LoadStates.Loading,
    });
    let clientDataResp = await ApiHelpers.read('client');

    if (!clientDataResp.good) {
      dispatch({
        type: AppActionTypes.SetStoreLoading,
        value: LoadStates.Failed,
      });
      return;
    }

    const parsedClientData = JSON.parse(clientDataResp.data);
    const { logoUrl } = parsedClientData;
    dispatch({
      type: AppActionTypes.SetClientData,
      value: parsedClientData,
    });

    dispatch({
      type: AppActionTypes.SetAppLogoUrl,
      value: logoUrl,
    });

    dispatch({
      type: AppActionTypes.SetStoreLoading,
      value: LoadStates.Succeeded,
    });
  };
}
