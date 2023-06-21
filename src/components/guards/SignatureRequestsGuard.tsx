import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import SignatureRequests from '../documents/SignatureRequests';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IAppEnvironment from '../../interfaces/IAppEnvironment';

interface ISignatureRequestsGuardProps {
  query: any;
}

interface IConnectedSignatureRequestsGuardProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>;
  userPermissions?: IImmutableObject<IUserPermissions>;
  appEnvironment?: IImmutableObject<IAppEnvironment>;
  isCorpVersion?: boolean;
}

interface ISignatureRequestsGuardState {}

class SignatureRequestsGuard extends SrUiComponent<
  ISignatureRequestsGuardProps & IConnectedSignatureRequestsGuardProps,
  ISignatureRequestsGuardState
> {
  initialState() {
    return {};
  }

  onComponentMounted() {
    this.checkAllowed(this.props);
    this.props.dispatch(AppActions.changeMenu('documents/signature-requests'));
  }

  onNewProps(props: ISignatureRequestsGuardProps) {
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

    if (!registeredRoute) {
      this.navigate('dashboard');
      return false;
    }

    return true;
  }

  performRender() {
    return <SignatureRequests />;
  }
}

export default connect<
  IConnectedSignatureRequestsGuardProps,
  {},
  ISignatureRequestsGuardProps
>(AppMappers.AppMapper)(SignatureRequestsGuard);
