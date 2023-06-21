import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import ExternalDownloadsBundleGuard from '../components/guards/ExternalDownloadsBundleGuard';

interface IExternalDownloadsBundleViewProps {
  query: any; // Necessary for extended AppViewWrapper, which contains AppHeader
}

interface IExternalDownloadsBundleViewState {}

export default class ExternalDownloadsBundleView extends AppViewWrapper<
  IExternalDownloadsBundleViewProps & IAppViewWrapperProps,
  IExternalDownloadsBundleViewState
> {
  getView() {
    return (
      <div
        id="external-downloads-bundle-view"
        className="external-downloads-bundle-view flex-grow-column-container section"
      >
        <ExternalDownloadsBundleGuard />
      </div>
    );
  }

  getMenu() {
    return 'external-downloads/bundle';
  }
}
