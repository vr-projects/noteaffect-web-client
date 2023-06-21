import * as AdminReducer from '../store/admin/AdminReducer';
import * as AppReducer from '../store/app/AppReducer';

export default class AdminMappers {
  public static AdminMapper = (state) => {
    return {
      adminLoading: AdminReducer.getLoading(state),
      series: AdminReducer.getSeries(state),
      periods: AdminReducer.getPeriods(state),
      departments: AdminReducer.getDepartments(state),
      userPermissions: AppReducer.getUserPermissions(state),
    };
  };

  // TODO tech debt refactor out props, no need for mapper
  public static AddSeriesMapper = (state, props) => {
    return {
      periods: props.periods,
      departments: props.departments,
    };
  };
}
