import AdminActionTypes from './AdminActionTypes';
import AdminRecord from './AdminRecord';
import * as Immutable from 'immutable';

const initialState = new AdminRecord();
export default function adminReducer(
  state: AdminRecord = initialState,
  action: any = {}
) {
  switch (action.type as AdminActionTypes) {
    case AdminActionTypes.SetData:
      return state.with({
        series: action.value.series,
        periods: action.value.periods,
        departments: action.value.departments,
      });
    case AdminActionTypes.SetLoading:
      return state.with({ adminLoading: action.value });
    default:
      return state;
  }
}

export function getSeries(state) {
  return state.admin.series;
}

export function getPeriods(state) {
  return state.admin.periods;
}

export function getDepartments(state) {
  return state.admin.departments;
}

export function getLoading(state) {
  return state.admin.adminLoading;
}
