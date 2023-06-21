import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import ExternalDownloadsBundle from '../downloads/ExternalDownloadsBundle';

interface IExternalDownloadsBundleGuardProps {}

interface IConnectedExternalDownloadsBundleGuardProps
  extends DispatchProp<any> {}

interface IExternalDownloadsBundleGuardState {}

class ExternalDownloadsBundleGuardGuard extends SrUiComponent<
  IExternalDownloadsBundleGuardProps &
    IConnectedExternalDownloadsBundleGuardProps,
  IExternalDownloadsBundleGuardState
> {
  initialState() {
    return { guardCheckDone: false };
  }

  onComponentMounted() {
    this.props.dispatch(AppActions.changeMenu('external-downloads/bundle'));
  }

  performRender() {
    return <ExternalDownloadsBundle />;
  }
}

export default connect<
  IConnectedExternalDownloadsBundleGuardProps,
  {},
  IExternalDownloadsBundleGuardProps
>(() => {
  return {};
})(ExternalDownloadsBundleGuardGuard);
