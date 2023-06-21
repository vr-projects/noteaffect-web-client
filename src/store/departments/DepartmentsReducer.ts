import DepartmentsActionTypes from './DepartmentsActionTypes';
import DepartmentsRecord from './DepartmentsRecord';

const initialState = new DepartmentsRecord();

export default function departmentsReducer(
  state: DepartmentsRecord = initialState,
  action: any = {}
) {
  switch (action.type as DepartmentsActionTypes) {
    case DepartmentsActionTypes.DepartmentsLoading:
      return state.with({ departmentsLoading: action.value });
    case DepartmentsActionTypes.UpdateDepartments:
      return state.with({ departments: action.value });
    case DepartmentsActionTypes.UpdateCourseTags:
      return state.with({ tags: action.value });
    case DepartmentsActionTypes.UpdatePeriods:
      return state.with({ periods: action.value });
    default:
      return state;
  }
}

export function getDepartments(state) {
  return state.departments.departments;
}

export function getDepartmentsLoading(state) {
  return state.departments.departmentsLoading;
}

export function getCourseTags(state) {
  return state.departments.tags;
}

export function getPeriods(state) {
  return state.departments.periods;
}
