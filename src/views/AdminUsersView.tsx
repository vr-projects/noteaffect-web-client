import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import AdminUsersGuard from '../components/guards/AdminUsersGuard';

interface IAdminUsersViewProps {
  menu: string;
}

interface IAdminUsersViewState {}

export default class AdminUsersView extends AppViewWrapper<
  IAdminUsersViewProps & IAppViewWrapperProps,
  IAdminUsersViewState
> {
  getView() {
    return (
      <div id="admin-users-view" className="section">
        <AdminUsersGuard />
      </div>
    );
  }

  getMenu() {
    return 'admin';
  }
}
