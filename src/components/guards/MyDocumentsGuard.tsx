import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import MyDocuments from '../documents/MyDocuments';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IAppEnvironment from '../../interfaces/IAppEnvironment';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IMyDocumentsGuardProps {
  query: any;
}

interface IConnectedMyDocumentsGuardProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>;
  userPermissions?: IImmutableObject<IUserPermissions>;
  appEnvironment?: IImmutableObject<IAppEnvironment>;
  isCorpVersion?: boolean;
}

interface IMyDocumentsGuardState {}

class MyDocumentsGuard extends SrUiComponent<
  IMyDocumentsGuardProps & IConnectedMyDocumentsGuardProps,
  IMyDocumentsGuardState
> {
  initialState() {
    return {};
  }

  onComponentMounted() {
    this.checkAllowed(this.props);
    this.props.dispatch(AppActions.changeMenu('documents/my-documents'));
  }

  onNewProps(props: IMyDocumentsGuardProps) {
    this.checkAllowed(props);
  }

  readyToCheck(props) {
    return !isUndefined(props);
  }

  checkAllowed(props) {
    if (!this.readyToCheck(props)) {
      return false;
    }

    const registeredRoute = true;

    // TODO refactor to do the proper checks (whatever they may be)
    if (
      !registeredRoute ||
      !SystemRoleService.hasSomeRoles([
        SystemRoles.SALES_PRESENTER,
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
    return <MyDocuments />;
  }
}

export default connect<
  IConnectedMyDocumentsGuardProps,
  {},
  IMyDocumentsGuardProps
>(AppMappers.AppMapper)(MyDocumentsGuard);
