import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import IAdminProps from '../../interfaces/IAdminProps';
import AdminDetail from '../admin/AdminDetail';
import AdminMappers from '../../mappers/AdminMappers';
import * as AdminActions from '../../store/admin/AdminActions';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IAdminGuardProps {}

interface IAdminGuardState {}

class AdminGuard extends SrUiComponent<
  IAdminGuardProps & IAdminProps,
  IAdminGuardState
> {
  onComponentMounted() {
    this.props.dispatch(AppActions.changeMenu('admin/site'));
    this.checkAllowed(this.props);
    this.props.dispatch(AdminActions.loadData());
  }

  onNewProps(props: IAdminProps) {
    this.checkAllowed(props);
  }

  checkAllowed(props: IAdminProps) {
    if (!props.userPermissions || props.userPermissions.size === 0) {
      return;
    }

    if (!SystemRoleService.hasSomeRoles([SystemRoles.ADMIN])) {
      this.navigate('dashboard');
    }
  }

  performRender() {
    return <AdminDetail {...this.props} />;
  }
}

export default connect<any, void, IAdminProps>(AdminMappers.AdminMapper)(
  AdminGuard
);
