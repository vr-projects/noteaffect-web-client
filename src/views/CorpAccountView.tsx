import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import CorpAccountGuard from '../components/guards/CorpAccountGuard';

interface ICorpAccountViewProps {
  menu: any;
}

interface ICorpAccountViewState {}

export default class CorpAccountView extends AppViewWrapper<
  ICorpAccountViewProps & IAppViewWrapperProps,
  ICorpAccountViewState
> {
  getView() {
    const { menu } = this.props;

    return (
      <div id="corp-account-view" className="corp-account-view section">
        <CorpAccountGuard menu={menu} />
      </div>
    );
  }

  getMenu() {
    return 'account';
  }
}
