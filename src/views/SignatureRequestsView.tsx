import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import SignatureRequestsGuard from 'components/guards/SignatureRequestsGuard';

interface ISignatureRequestsViewProps {
  query: any;
}

interface ISignatureRequestsViewState {}

export default class SignatureRequestsView extends AppViewWrapper<
  ISignatureRequestsViewProps & IAppViewWrapperProps,
  ISignatureRequestsViewState
> {
  getView() {
    const { query } = this.props;

    return (
      <div
        id="signature-requests-view"
        className="signature-requests-view flex-grow-column-container section"
      >
        <SignatureRequestsGuard query={query} />
      </div>
    );
  }

  getMenu() {
    return 'documents/signature-requests';
  }
}
