import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent, LoadStates } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserPermissions from '../../interfaces/IUserPermissions';
import ICourse from '../../models/ICourse';
import IPeriod from '../../models/IPeriod';
import IDepartment from '../../models/IDepartment';
import AdminMappers from '../../mappers/AdminMappers';
import * as AdminActions from '../../store/admin/AdminActions';
import AdminUsersPage from '../admin/AdminUsersPage';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IConnectedAdminUsersGuardProps extends DispatchProp<any> {
  userPermissions?: IImmutableObject<IUserPermissions>;
}

interface IAdminUsersGuardProps {}
interface IAdminUsersGuardState {}
class AdminUsersGuard extends SrUiComponent<
  IAdminUsersGuardProps & IConnectedAdminUsersGuardProps,
  IAdminUsersGuardState
> {
  onComponentMounted() {
    const { dispatch } = this.props;
    dispatch(AppActions.changeMenu('admin/users'));
    this.checkAllowed(this.props);
    dispatch(AdminActions.loadData());
  }

  onNewProps(props: IAdminUsersGuardProps & IConnectedAdminUsersGuardProps) {
    this.checkAllowed(props);
  }

  checkAllowed(props: IAdminUsersGuardProps & IConnectedAdminUsersGuardProps) {
    const { userPermissions } = props;
    if (!userPermissions || userPermissions.size === 0) {
      return;
    }

    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.ADMIN,
        SystemRoles.CLIENT_ADMIN,
      ])
    ) {
      this.navigate('dashboard');
    }
  }

  performRender() {
    return <AdminUsersPage />;
  }
}

export default connect<
  IConnectedAdminUsersGuardProps,
  void,
  IAdminUsersGuardProps
>(AdminMappers.AdminMapper)(AdminUsersGuard);
