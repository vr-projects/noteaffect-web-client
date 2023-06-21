import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import MyDocumentsGuard from 'components/guards/MyDocumentsGuard';

interface IMyDocumentsViewProps {
  query: any;
}

interface IMyDocumentsViewState {}

export default class MyDocumentsView extends AppViewWrapper<
  IMyDocumentsViewProps & IAppViewWrapperProps,
  IMyDocumentsViewState
> {
  getView() {
    const { query } = this.props;

    return (
      <div
        id="my-documents-view"
        className="my-documents-view flex-grow-column-container section"
      >
        <MyDocumentsGuard query={query} />
      </div>
    );
  }

  getMenu() {
    return 'documents/my-documents';
  }
}
