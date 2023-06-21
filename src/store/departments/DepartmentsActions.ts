import DepartmentsActionTypes from './DepartmentsActionTypes';
import { LoadStates, ApiHelpers } from 'react-strontium';

export function getDepartments() {
  return async (dispatch, state) => {
    if (state.coursesLoading === LoadStates.Loading) {
      return;
    }

    dispatch({
      type: DepartmentsActionTypes.DepartmentsLoading,
      value: LoadStates.Loading,
    });
    let depTask = ApiHelpers.read('departments');
    let tagsTask = ApiHelpers.read('departments/tags');
    let periodTask = ApiHelpers.read('periods');
    let deptsResp = await depTask;
    let tagsResp = await tagsTask;
    let periodsResp = await periodTask;

    if (!deptsResp.good || !tagsResp.good || !periodsResp.good) {
      dispatch({
        type: DepartmentsActionTypes.DepartmentsLoading,
        value: LoadStates.Failed,
      });
      return;
    }

    dispatch({
      type: DepartmentsActionTypes.UpdateDepartments,
      value: JSON.parse(deptsResp.data),
    });
    dispatch({
      type: DepartmentsActionTypes.UpdateCourseTags,
      value: JSON.parse(tagsResp.data),
    });
    dispatch({
      type: DepartmentsActionTypes.UpdatePeriods,
      value: JSON.parse(periodsResp.data),
    });
    dispatch({
      type: DepartmentsActionTypes.DepartmentsLoading,
      value: LoadStates.Succeeded,
    });
  };
}
