import CoursesActionTypes from './CoursesActionTypes';
import { LoadStates, ApiHelpers } from 'react-strontium';

export function getCourses(instructing: boolean = false) {
  return async (dispatch, state) => {
    if (state.coursesLoading === LoadStates.Loading) {
      return;
    }

    try {
      dispatch({
        type: CoursesActionTypes.ChangeCoursesLoading,
        value: LoadStates.Loading,
      });

      const coursesResp = await (instructing
        ? ApiHelpers.read('series/instructing')
        : ApiHelpers.read('series'));

      if (!coursesResp.good) {
        dispatch({
          type: CoursesActionTypes.ChangeCoursesLoading,
          value: LoadStates.Failed,
        });
        return;
      }

      dispatch({
        type: CoursesActionTypes.ChangeCourses,
        value: JSON.parse(coursesResp.data),
      });

      dispatch({
        type: CoursesActionTypes.ChangeCoursesLoading,
        value: LoadStates.Succeeded,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: CoursesActionTypes.ChangeCoursesLoading,
        value: LoadStates.Failed,
      });
    }
  };
}

export function getCourse(id: number) {
  return (dispatch, state) => {
    const course = state().courses.courses.find((v) => v.get('id') === id);

    dispatch({
      type: CoursesActionTypes.ChangeCourse,
      value: course,
    });
  };
}

export function getUpdatedCourse(id: number, instructing: boolean = false) {
  return async (dispatch, state) => {
    await getCourses(instructing)(dispatch, state);
    getCourse(id)(dispatch, state);
  };
}
