import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import RsvpRegistration from '../rsvp/RsvpRegistration';

interface IRsvpDistroRegistrationGuardProps {
  query: any;
}

interface IConnectedRsvpDistroRegistrationGuardProps
  extends DispatchProp<any> {}

interface IRsvpDistroRegistrationGuardState {
  guardCheckDone: boolean;
}

class RsvpDistroRegistrationGuard extends SrUiComponent<
  IRsvpDistroRegistrationGuardProps &
    IConnectedRsvpDistroRegistrationGuardProps,
  IRsvpDistroRegistrationGuardState
> {
  initialState() {
    return {
      guardCheckDone: false,
    };
  }

  onComponentMounted() {
    this.checkAllowed(this.props);
    this.props.dispatch(AppActions.changeMenu('rsvp/distro-registration'));
  }

  onNewProps(props: IRsvpDistroRegistrationGuardProps) {
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
      query: { series_id, code, series_user_id },
    } = props;

    const registeredRoute =
      !isUndefined(series_id) &&
      !isUndefined(code) &&
      !isUndefined(series_user_id);

    if (!registeredRoute) {
      this.navigate('dashboard');
      return false;
    }

    this.setPartial({ guardCheckDone: true });

    return true;
  }

  performRender() {
    const {
      query: { series_id: seriesId, code, series_user_id: seriesUserId },
    } = this.props;
    const { guardCheckDone } = this.state;

    return (
      <RsvpRegistration
        isDistro={true}
        seriesId={seriesId}
        code={code}
        ready={guardCheckDone}
        seriesUserId={seriesUserId}
      />
    );
  }
}

export default connect<
  IConnectedRsvpDistroRegistrationGuardProps,
  {},
  IRsvpDistroRegistrationGuardProps
>(() => {
  return {};
})(RsvpDistroRegistrationGuard);
