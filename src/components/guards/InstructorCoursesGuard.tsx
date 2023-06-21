import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent, SrAppMessage, LoadStates } from 'react-strontium';
import CoursesMappers from '../../mappers/CoursesMappers';
import ICourse from '../../models/ICourse';
import * as CoursesActions from '../../store/courses/CoursesActions';
import * as AppActions from '../../store/app/AppActions';
import InstructorCoursesComponent from '../instructor_tools/courses/InstructorCoursesComponent';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';
import * as Immutable from 'immutable';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IImmutableObject from '../../interfaces/IImmutableObject';

interface IConnectedInstructorCoursesGuardProps extends DispatchProp<any> {
  loading?: LoadStates;
  userPermissions?: IImmutableObject<IUserPermissions>;
  courses?: Immutable.List<IImmutableObject<ICourse>>;
}

interface IInstructorCoursesGuardProps {
  params: any;
}

interface IInstructorCoursesGuardState {}

class InstructorCoursesGuard extends SrUiComponent<
  IConnectedInstructorCoursesGuardProps & IInstructorCoursesGuardProps,
  IInstructorCoursesGuardState
> {
  onComponentMounted() {
    const { dispatch } = this.props;
    dispatch(AppActions.changeMenu('instructor/courses'));
    this.checkAllowed(this.props);
    dispatch(CoursesActions.getCourses(true));
  }

  getHandles() {
    return [
      AppBroadcastEvents.MeetingAdded,
      AppBroadcastEvents.MeetingUpdated,
      AppBroadcastEvents.MeetingDeleted,
      AppBroadcastEvents.ParticipantAdded,
      AppBroadcastEvents.ShouldRefreshData,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    switch (msg.action) {
      case AppBroadcastEvents.MeetingAdded:
      case AppBroadcastEvents.MeetingUpdated:
      case AppBroadcastEvents.MeetingDeleted:
      case AppBroadcastEvents.ParticipantAdded:
      case AppBroadcastEvents.ShouldRefreshData:
        return this.props.dispatch(CoursesActions.getCourses(true));
      default:
        return;
    }
  }

  onNewProps(
    props: IConnectedInstructorCoursesGuardProps & IInstructorCoursesGuardProps
  ) {
    this.checkAllowed(props);
  }

  checkAllowed(
    props: IConnectedInstructorCoursesGuardProps & IInstructorCoursesGuardProps
  ) {
    if (!props.userPermissions || props.userPermissions.size === 0) {
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

  performRender() {
    const { courses, loading } = this.props;
    return (
      <InstructorCoursesComponent
        courses={(courses.toJS() as ICourse[]).filter((c) => c.canEdit)}
        coursesLoading={loading}
      />
    );
  }
}

export default connect<
  IConnectedInstructorCoursesGuardProps,
  {},
  IInstructorCoursesGuardProps
>(CoursesMappers.InstructorCoursesMapper)(InstructorCoursesGuard);
