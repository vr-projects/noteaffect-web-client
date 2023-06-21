import AdminActionTypes from './AdminActionTypes';
import { LoadStates, ApiHelpers } from 'react-strontium';
import * as Immutable from 'immutable';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IAdminData from '../../interfaces/IAdminData';

export function loadData() {
  return async (dispatch, state) => {
    if (state.adminLoading === LoadStates.Loading) {
      return;
    }

    dispatch({ type: AdminActionTypes.SetLoading, value: LoadStates.Loading });
    let adminDataResp = await ApiHelpers.read('admin');

    if (!adminDataResp.good) {
      dispatch({ type: AdminActionTypes.SetLoading, value: LoadStates.Failed });
      return;
    }
    dispatch({
      type: AdminActionTypes.SetData,
      value: JSON.parse(adminDataResp.data),
    });
    dispatch({
      type: AdminActionTypes.SetLoading,
      value: LoadStates.Succeeded,
    });
  };
}

export function setAdminData(data: IAdminData) {
  return async (dispatch, state) => {
    dispatch({ type: AdminActionTypes.SetData, value: data });
  };
}

export function setAdminLoading(loading: LoadStates) {
  return async (dispatch, state) => {
    dispatch({ type: AdminActionTypes.SetLoading, value: loading });
  };
}
