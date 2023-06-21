import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent, LoadStates } from 'react-strontium';
import * as DepartmentsActions from '../../store/departments/DepartmentsActions';
import * as AppActions from '../../store/app/AppActions';
import IDepartment from '../../models/IDepartment';
import DepartmentsMenu from '../departments/DepartmentsMenu';
import DepartmentsMappers from '../../mappers/DepartmentsMappers';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';
import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserPermissions from '../../interfaces/IUserPermissions';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IConnectedDepartmentsGuardProps extends DispatchProp<any> {
  departments?: Immutable.List<IImmutableObject<IDepartment>>;
  departmentsLoading?: LoadStates;
  userPermissions?: IImmutableObject<IUserPermissions>;
  tags?: Immutable.List<IImmutableObject<IAdminTag>>;
  periods?: Immutable.List<IImmutableObject<IPeriod>>;
}

interface IDepartmentsGuardProps {
  menu: any;
}

interface IDepartmentsGuardState {}

class DepartmentsGuard extends SrUiComponent<
  IConnectedDepartmentsGuardProps & IDepartmentsGuardProps,
  IDepartmentsGuardState
> {
  onComponentMounted() {
    this.props.dispatch(AppActions.changeMenu('admin/departments'));
    if (this.checkAllowed(this.props)) {
      this.props.dispatch(DepartmentsActions.getDepartments());
    }
  }

  onNewProps(props: IConnectedDepartmentsGuardProps & IDepartmentsGuardProps) {
    if (this.checkAllowed(props) && this.props.departments.isEmpty()) {
      this.props.dispatch(DepartmentsActions.getDepartments());
    }
  }

  readyToCheck(
    props: IConnectedDepartmentsGuardProps & IDepartmentsGuardProps
  ) {
    return props.userPermissions && !props.userPermissions.isEmpty();
  }

  checkAllowed(
    props: IConnectedDepartmentsGuardProps & IDepartmentsGuardProps
  ) {
    if (!this.readyToCheck(props)) {
      return false;
    }

    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.DEPARTMENT_ADMIN,
        SystemRoles.CLIENT_ADMIN,
        SystemRoles.ADMIN,
      ])
    ) {
      this.navigate('dashboard');
      return false;
    }

    return true;
  }

  performRender() {
    const { departments, tags, departmentsLoading, menu, periods } = this.props;

    return (
      // TODO Tech debt options prop is from nenu, which is query params
      <DepartmentsMenu
        departments={(departments.toJS() as IDepartment[]).sort((a, b) =>
          a.name.localeCompare(b.name)
        )}
        groups={(tags.toJS() as IAdminTag[]).sort((a, b) =>
          a.name.localeCompare(b.name)
        )}
        departmentsLoading={departmentsLoading}
        options={menu}
        periods={periods.toJS() as IPeriod[]}
        isAdmin={SystemRoleService.hasSomeRoles([
          SystemRoles.DEPARTMENT_ADMIN,
          SystemRoles.CLIENT_ADMIN,
          SystemRoles.ADMIN,
        ])}
      />
    );
  }
}

export default connect<
  IConnectedDepartmentsGuardProps,
  void,
  IDepartmentsGuardProps
>(DepartmentsMappers.DepartmentsMapper)(DepartmentsGuard);
