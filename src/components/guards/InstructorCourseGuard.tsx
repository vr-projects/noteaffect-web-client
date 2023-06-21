import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent, SrAppMessage, LoadStates } from 'react-strontium';
import CoursesMappers from '../../mappers/CoursesMappers';
import ICourse from '../../models/ICourse';
import * as CoursesActions from '../../store/courses/CoursesActions';
import Courses from '../../utilities/Courses';
import * as AppActions from '../../store/app/AppActions';
import Numbers from '../../utilities/Numbers';
import InstructorCourseDetail from '../instructor_tools/courses/InstructorCourseDetail';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserPermissions from '../../interfaces/IUserPermissions';

interface IConnectedInstructorCourseGuardProps extends DispatchProp<any> {
  userPermissions?: IImmutableObject<IUserPermissions>;
  course?: IImmutableObject<ICourse>;
  coursesLoading?: LoadStates;
}

interface IInstructorCourseGuardProps {
  id: number;
  menu: string;
  lectureId: string;
  documentId: string;
  user?: string;
  query?: any;
}

interface IInstructorCourseGuardState {}

class InstructorCourseGuard extends SrUiComponent<
  IConnectedInstructorCourseGuardProps & IInstructorCourseGuardProps,
  IInstructorCourseGuardState
> {
  onComponentMounted() {
    const { dispatch, course } = this.props;
    dispatch(AppActions.changeMenu('instructor/courses'));
    this.checkAllowed();

    if (course.isEmpty()) {
      dispatch(CoursesActions.getCourses(true));
      return;
    }
    if (!course.get('canEdit') || !Courses.accessAllowed(course.get('state'))) {
      this.navigate('dashboard');
      return;
    }
  }

  getHandles() {
    return [
      AppBroadcastEvents.ParticipantAdded,
      AppBroadcastEvents.ParticipantPromotionUpdated,
      AppBroadcastEvents.ParticipantDeleted,
      AppBroadcastEvents.UnregisteredDeleted,
      AppBroadcastEvents.DistributionListDeleted,
      AppBroadcastEvents.ShouldRefreshData,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    const { id, dispatch } = this.props;
    switch (msg.action) {
      case AppBroadcastEvents.ParticipantAdded:
      case AppBroadcastEvents.ParticipantPromotionUpdated:
      case AppBroadcastEvents.ParticipantDeleted:
      case AppBroadcastEvents.UnregisteredDeleted:
      case AppBroadcastEvents.DistributionListDeleted:
      case AppBroadcastEvents.ShouldRefreshData:
        dispatch(CoursesActions.getUpdatedCourse(id, true));
        return;
      default:
        return;
    }
  }

  checkAllowed() {
    const { userPermissions } = this.props;
    if (!userPermissions || userPermissions.size === 0) {
      return;
    }

    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.PRESENTER,
        SystemRoles.SALES_PRESENTER,
        SystemRoles.DEPARTMENT_ADMIN,
        SystemRoles.CLIENT_ADMIN,
        SystemRoles.ADMIN,
      ])
    ) {
      this.navigate('dashboard');
    }
  }

  onNewProps(
    props: IConnectedInstructorCourseGuardProps & IInstructorCourseGuardProps
  ) {
    const { course: currCourse, coursesLoading: currCoursesLoading } = props;
    const { course: prevCourse, id, dispatch } = this.props;

    if (
      prevCourse.isEmpty() &&
      currCourse.isEmpty() &&
      currCoursesLoading !== LoadStates.Loading
    ) {
      dispatch(CoursesActions.getCourse(id));
      return;
    }
    if (
      !props.course.isEmpty() &&
      !Courses.accessAllowed(props.course.get('state'))
    ) {
      this.navigate('dashboard');
      return;
    }
  }

  performRender() {
    const {
      course,
      coursesLoading,
      menu,
      user,
      query,
      lectureId,
      documentId,
    } = this.props;

    return (
      <InstructorCourseDetail
        course={course.isEmpty() ? null : (course.toJS() as ICourse)}
        courseLoading={coursesLoading}
        menu={menu}
        userId={Numbers.parse(user)}
        query={query}
        lectureId={Numbers.parse(lectureId)}
        documentId={Numbers.parse(documentId)}
      />
    );
  }
}

export default connect<
  IConnectedInstructorCourseGuardProps,
  void,
  IInstructorCourseGuardProps
>(CoursesMappers.SingleCourseMapper)(InstructorCourseGuard);
