import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent, LoadStates, SrAppMessage } from 'react-strontium';
import CoursesMappers from '../../mappers/CoursesMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserPermissions from '../../interfaces/IUserPermissions';
import ICourse from '../../models/ICourse';
import CourseComponent from '../course/CourseComponent';
import Courses from '../../utilities/Courses';
import Numbers from '../../utilities/Numbers';
import * as CoursesActions from '../../store/courses/CoursesActions';
import * as AppActions from '../../store/app/AppActions';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedCourseGuardProps extends DispatchProp<any> {
  userPermissions?: IImmutableObject<IUserPermissions>;
  course?: IImmutableObject<ICourse>;
  coursesLoading?: LoadStates;
}

interface ICourseGuardProps {
  id: number;
  menu: string;
  query?: any;
  lectureId: string;
  engagementId?: string;
}

interface ICourseGuardState {}

class CourseGuard extends SrUiComponent<
  ICourseGuardProps & IConnectedCourseGuardProps,
  ICourseGuardState
> {
  onComponentMounted() {
    const { dispatch, course } = this.props;

    dispatch(AppActions.changeMenu('courses'));

    if (course.isEmpty()) {
      this.props.dispatch(CoursesActions.getCourses());
      return;
    }
    if (!Courses.accessAllowed(course.get('state'))) {
      this.navigate('dashboard');
      return;
    }
  }

  onNewProps(props: ICourseGuardProps & IConnectedCourseGuardProps) {
    const {
      course: currentCourse,
      coursesLoading: currentCoursesLoading,
    } = props;
    const { id, course: prevCourse, dispatch } = this.props;

    if (
      prevCourse.isEmpty() &&
      currentCourse.isEmpty() &&
      currentCoursesLoading !== LoadStates.Loading
    ) {
      dispatch(CoursesActions.getCourse(id));
    }
    if (
      !currentCourse.isEmpty() &&
      !Courses.accessAllowed(currentCourse.get('state'))
    ) {
      this.navigate('dashboard');
    }
  }

  getHandles() {
    return [
      AppBroadcastEvents.SharedByEmail,
      AppBroadcastEvents.SharedByParticipants,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    switch (msg.action) {
      case AppBroadcastEvents.SharedByEmail:
      case AppBroadcastEvents.SharedByParticipants:
        return this.props.dispatch(
          CoursesActions.getUpdatedCourse(this.props.id)
        );
      default:
        return;
    }
  }

  performRender() {
    const { coursesLoading, course, lectureId, menu, query } = this.props;

    if (!course) return null;

    return (
      <CourseComponent
        menu={menu}
        query={query}
        course={course.isEmpty() ? null : (course.toJS() as ICourse)}
        courseLoading={coursesLoading}
        lectureId={Numbers.parse(lectureId)}
      />
    );
  }
}

export default connect<IConnectedCourseGuardProps, void, ICourseGuardProps>(
  CoursesMappers.SingleCourseMapper
)(CourseGuard);
