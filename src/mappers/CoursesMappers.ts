import * as CoursesReducer from '../store/courses/CoursesReducer';
import * as AppReducer from '../store/app/AppReducer';

export default class CoursesMappers {
  public static CoursesMapper = (state, props) => {
    return {
      coursesLoading: CoursesReducer.getCoursesLoading(state),
      courses: CoursesReducer.getCourses(state),
    };
  };

  public static InstructorCoursesMapper = (state, props) => {
    return {
      loading: CoursesReducer.getCoursesLoading(state),
      courses: CoursesReducer.getCourses(state),
      userPermissions: AppReducer.getUserPermissions(state),
    };
  };

  public static SingleCourseMapper = (state, props) => {
    return {
      coursesLoading: CoursesReducer.getCoursesLoading(state),
      course: CoursesReducer.getCourse(state),
      userPermissions: AppReducer.getUserPermissions(state),
    };
  };
}
