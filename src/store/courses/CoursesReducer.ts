import CourseActionTypes from './CoursesActionTypes';
import CoursesRecord from './CoursesRecord';

const initialState = new CoursesRecord();
export default function coursesReducer(
  state: CoursesRecord = initialState,
  action: any = {}
) {
  switch (action.type as CourseActionTypes) {
    case CourseActionTypes.ChangeCoursesLoading:
      return state.with({ coursesLoading: action.value });
    case CourseActionTypes.ChangeCourses:
      return state.with({ courses: action.value });
    case CourseActionTypes.ChangeCourse:
      return state.with({ currentCourse: action.value });
    default:
      return state;
  }
}

export function getCourses(state) {
  return state.courses.courses;
}

export function getCoursesLoading(state) {
  return state.courses.coursesLoading;
}

export function getCourse(state) {
  return state.courses.currentCourse;
}
