import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import ExternalDownloadsPresentationViewerGuard from '../components/guards/ExternalDownloadsPresentationViewerGuard';

interface IExternalDownloadsPresentationViewerViewProps {
  query: any; // Necessary for extended AppViewWrapper, which contains AppHeader
}

interface IExternalDownloadsPresentationViewerViewState {}

export default class ExternalDownloadsPresentationViewerView extends AppViewWrapper<
  IExternalDownloadsPresentationViewerViewProps & IAppViewWrapperProps,
  IExternalDownloadsPresentationViewerViewState
> {
  getView() {
    return (
      <div
        id="external-downloads-presentation-viewer-view"
        className="external-downloads-presentation-viewer-view flex-grow-column-container section"
      >
        <ExternalDownloadsPresentationViewerGuard />
      </div>
    );
  }

  getMenu() {
    return 'external-downloads/presentation-viewer';
  }
}
