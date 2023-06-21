import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import ExternalDownloadsPresentationViewer from '../downloads/ExternalDownloadsPresentationViewer';

interface IExternalDownloadsPresentationViewerGuardProps {}

interface IConnectedExternalDownloadsPresentationViewerGuardProps
  extends DispatchProp<any> {}

interface IExternalDownloadsPresentationViewerGuardState {}

class ExternalDownloadsPresentationViewerGuard extends SrUiComponent<
  IExternalDownloadsPresentationViewerGuardProps &
    IConnectedExternalDownloadsPresentationViewerGuardProps,
  IExternalDownloadsPresentationViewerGuardState
> {
  onComponentMounted() {
    this.props.dispatch(
      AppActions.changeMenu('external-downloads/presentation-viewer')
    );
  }

  performRender() {
    return <ExternalDownloadsPresentationViewer />;
  }
}

export default connect<
  IConnectedExternalDownloadsPresentationViewerGuardProps,
  {},
  IExternalDownloadsPresentationViewerGuardProps
>(() => {
  return {};
})(ExternalDownloadsPresentationViewerGuard);
