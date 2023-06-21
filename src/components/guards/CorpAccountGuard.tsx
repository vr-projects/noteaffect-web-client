import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent } from 'react-strontium';

import * as AppActions from '../../store/app/AppActions';
import CorpAccountMenu from '../corp/CorpAccountMenu';
import AppMappers from '../../mappers/AppMappers';
import IUserPermissions from '../../interfaces/IUserPermissions';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface ICorpAccountGuardProps {
  menu: string;
}

interface IConnectedCorpAccountGuardProps extends DispatchProp<any> {
  userPermissions?: IUserPermissions;
}

interface ICorpAccountGuardState {}

class CorpAccountGuard extends SrUiComponent<
  ICorpAccountGuardProps & IConnectedCorpAccountGuardProps,
  ICorpAccountGuardState
> {
  onComponentMounted() {
    this.props.dispatch(AppActions.changeMenu('admin/account'));
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
    return (
      <CorpAccountMenu
        options={this.props.menu}
        isAdmin={SystemRoleService.hasSomeRoles([
          SystemRoles.ADMIN,
          SystemRoles.CLIENT_ADMIN,
        ])}
      />
    );
  }
}

export default connect<
  IConnectedCorpAccountGuardProps,
  {},
  ICorpAccountGuardProps
>(AppMappers.UserMapper)(CorpAccountGuard);
