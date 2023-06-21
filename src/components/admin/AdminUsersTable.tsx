import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import { Alert } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IAdminUser from '../../models/IAdminUser';
import AdminUserItem from './AdminUserItem';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IAdminUsersTableProps {
  users: IAdminUser[];
  currentUserId: number;
  userUpdated: () => void;
  userUpdateError: () => void;
  editUserDepartment: (selectedUser: IAdminUser) => void;
}

interface IAdminUsersTableState {}

export default class AdminUsersTable extends SrUiComponent<
  IAdminUsersTableProps,
  IAdminUsersTableState
> {
  performRender() {
    const {
      users,
      currentUserId,
      userUpdated,
      userUpdateError,
      editUserDepartment,
    } = this.props;

    return (
      <div className="admin-users-table">
        <table>
          <thead>
            <tr>
              <th>{Localizer.get('User')}</th>
              <th className="text-center">{Localizer.get('Presenter?')}</th>
              <th className="text-center">
                {Localizer.get('Sales Presenter?')}
              </th>
              <th className="text-center">
                {Localizer.get('Department Admin?')}
              </th>
              {SystemRoleService.hasSomeRoles([SystemRoles.ADMIN]) && (
                <>
                  <th className="text-center">
                    {Localizer.get('Client Admin?')}
                  </th>
                  <th className="text-center">
                    {Localizer.get('Full Site Admin?')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {!isEmpty(users) ? (
              users.map((u) => (
                <AdminUserItem
                  currentUserId={currentUserId}
                  user={u}
                  key={u.id}
                  onAdminTypeUpdated={() => userUpdated()}
                  onAdminUpdateError={() => userUpdateError()}
                  editUserDepartment={(selectedUser) =>
                    editUserDepartment(selectedUser)
                  }
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-1 pt-1 pb-0">
                  <Alert bsStyle="warning">
                    {Localizer.get(
                      'No results found. Try refining your search.'
                    )}
                  </Alert>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
