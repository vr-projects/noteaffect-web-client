import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import AdminGuard from '../components/guards/AdminGuard';

interface IAdminViewProps {
  menu: string;
}

interface IAdminViewState {}

export default class AdminView extends AppViewWrapper<
  IAdminViewProps & IAppViewWrapperProps,
  IAdminViewState
> {
  getView() {
    return (
      <div id="admin-view" className="admin-view section">
        <AdminGuard />
      </div>
    );
  }

  getMenu() {
    return 'admin';
  }
}
