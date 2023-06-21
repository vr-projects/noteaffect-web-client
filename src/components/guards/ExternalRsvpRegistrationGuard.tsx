import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import RsvpRegistration from '../rsvp/RsvpRegistration';
import { getLogInUrl } from '../../services/LinkService';

interface IExternalRsvpRegistrationGuardProps {
  query: any;
}

interface IConnectedExternalRsvpRegistrationGuardProps
  extends DispatchProp<any> {}

interface IExternalRsvpRegistrationGuardState {
  guardCheckDone: boolean;
}

class ExternalRsvpRegistrationGuard extends SrUiComponent<
  IExternalRsvpRegistrationGuardProps &
    IConnectedExternalRsvpRegistrationGuardProps,
  IExternalRsvpRegistrationGuardState
> {
  initialState() {
    return {
      guardCheckDone: false,
    };
  }
  onComponentMounted() {
    this.checkAllowed(this.props);
    // This is for AppHeader to display Log In, Sign Up, and not internal controls
    this.props.dispatch(AppActions.changeMenu('external-rsvp/registration'));
  }

  onNewProps(props: IExternalRsvpRegistrationGuardProps) {
    this.checkAllowed(props);
  }

  readyToCheck(props) {
    return !isUndefined(props);
  }

  checkAllowed(props) {
    if (!this.readyToCheck(props)) {
      return false;
    }

    // Note - user_id on registered users url, not unregistered
    const {
      query: { series_id, rsvp, code },
    } = props;

    // Determine Unregistered Route or Registered Route
    const correctRoute =
      !isUndefined(series_id) && !isUndefined(rsvp) && !isUndefined(code);

    // Redirect to login if not correct query params initially
    if (!correctRoute) {
      const redirectToLoginUrl = getLogInUrl('', false);
      window.location.replace(`${redirectToLoginUrl}`);
      return false;
    }

    this.setPartial({ guardCheckDone: true });

    return true;
  }

  performRender() {
    const {
      query: { series_id: seriesId, user_id: userId, rsvp, code },
    } = this.props;
    const { guardCheckDone } = this.state;

    return (
      <RsvpRegistration
        isDistro={false}
        seriesId={seriesId}
        userId={userId}
        rsvp={rsvp}
        code={code}
        ready={guardCheckDone}
      />
    );
  }
}

export default connect<
  IConnectedExternalRsvpRegistrationGuardProps,
  {},
  IExternalRsvpRegistrationGuardProps
>(() => {
  return {};
})(ExternalRsvpRegistrationGuard);
