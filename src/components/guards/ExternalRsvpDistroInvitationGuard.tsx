import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import RsvpInvitation from '../rsvp/ExternalRsvpDistroInvitation';
import { getLogInUrl } from '../../services/LinkService';

interface IExternalRsvpDistroInvitationGuardProps {
  query: any;
}

interface IConnectedExternalRsvpDistroInvitationGuardProps
  extends DispatchProp<any> {}

interface IExternalRsvpInvitationGuardState {
  guardCheckDone: boolean;
}

class ExternalRsvpInvitationGuard extends SrUiComponent<
  IExternalRsvpDistroInvitationGuardProps &
    IConnectedExternalRsvpDistroInvitationGuardProps,
  IExternalRsvpInvitationGuardState
> {
  initialState() {
    return { guardCheckDone: false };
  }

  onComponentMounted() {
    this.checkAllowed(this.props);
    this.props.dispatch(
      AppActions.changeMenu('external-rsvp/distro-invitation')
    );
  }

  onNewProps(props: IExternalRsvpDistroInvitationGuardProps) {
    this.checkAllowed(props);
  }

  readyToCheck(props) {
    return !isUndefined(props);
  }

  checkAllowed(props) {
    if (!this.readyToCheck(props)) {
      return false;
    }

    const {
      query: { code, email },
    } = props;

    const onCorrectRoute = !isUndefined(code) && !isUndefined(email);

    if (!onCorrectRoute) {
      const redirectToLoginUrl = getLogInUrl('', false);
      window.location.replace(`${redirectToLoginUrl}`);
      return false;
    }

    this.setPartial({ guardCheckDone: true });

    return true;
  }

  performRender() {
    const {
      query: { email, code },
    } = this.props;
    const { guardCheckDone } = this.state;

    return <RsvpInvitation email={email} code={code} ready={guardCheckDone} />;
  }
}

export default connect<
  IConnectedExternalRsvpDistroInvitationGuardProps,
  {},
  IExternalRsvpDistroInvitationGuardProps
>(() => {
  return {};
})(ExternalRsvpInvitationGuard);
