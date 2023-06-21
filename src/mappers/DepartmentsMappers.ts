import * as DepartmentsReducer from '../store/departments/DepartmentsReducer';
import * as AppReducer from '../store/app/AppReducer';

export default class DepartmentsMappers {
  public static DepartmentsMapper = (state) => {
    return {
      departments: DepartmentsReducer.getDepartments(state),
      departmentsLoading: DepartmentsReducer.getDepartmentsLoading(state),
      userPermissions: AppReducer.getUserPermissions(state),
      tags: DepartmentsReducer.getCourseTags(state),
      periods: DepartmentsReducer.getPeriods(state),
    };
  };
}
