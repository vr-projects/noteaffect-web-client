import * as React from 'react';
import { SrUiComponent, LoadStates, ApiHelpers } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IAdminUser from '../../models/IAdminUser';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';
import { FaBuilding, FaEnvelope } from 'react-icons/fa';

interface IAdminUserItemProps {
  user: IAdminUser;
  currentUserId: number;
  onAdminTypeUpdated: () => void;
  onAdminUpdateError: () => void;
  editUserDepartment: (selectedUser: IAdminUser) => void;
}

interface IAdminUserItemState {
  loading: LoadStates;
}

export default class AdminUserItem extends SrUiComponent<
  IAdminUserItemProps,
  IAdminUserItemState
> {
  async changeAdmin(adminType, isAdmin: boolean) {
    const {
      user: {
        id: userId,
        presenter,
        salesPresenter,
        departmentAdmin,
        clientAdmin,
        admin,
      },
      onAdminTypeUpdated,
      onAdminUpdateError,
    } = this.props;

    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setState({ loading: LoadStates.Loading });

    try {
      const payload = {
        presenter,
        salesPresenter,
        departmentAdmin,
        clientAdmin,
        admin,
      };
      // adjust payload according to what was clicked
      payload[adminType] = isAdmin;

      const resp = await ApiHelpers.update(`admin/users/${userId}`, payload);

      if (!resp.good) {
        throw new Error('Error updating admin permissions');
      }

      await this.setPartialAsync({ loading: LoadStates.Unloaded });
      onAdminTypeUpdated();
    } catch (error) {
      console.error(error);
      this.setState({ loading: LoadStates.Failed });
      onAdminUpdateError();
    }
  }

  handleEditDepartment(
    e: React.MouseEvent<HTMLAnchorElement>,
    user: IAdminUser
  ): void {
    e.preventDefault();
    this.props.editUserDepartment(user);
  }

  performRender() {
    const {
      currentUserId,
      user: {
        firstName,
        lastName,
        email,
        id: userId,
        presenter,
        salesPresenter,
        departmentAdmin,
        clientAdmin,
        admin,
        departments,
      },
    } = this.props;
    const { loading } = this.state;
    const canEdit = currentUserId !== userId;
    const checkboxMap = {
      presenter,
      salesPresenter,
      departmentAdmin,
      clientAdmin,
      admin,
    };
    return (
      <>
        <tr className="admin-user-item">
          <td className="item-cell user-cell">
            <p className="name">
              {[firstName, lastName]
                .filter((n) => (n || '').trim().length > 0)
                .join(' ')}
              <span className="label-item">
                {currentUserId === userId ? Localizer.get(' (You)') : ''}
              </span>
            </p>
            <p className="email">
              <FaEnvelope className="icon" />
              {email}
            </p>
            <p className="department">
              <FaBuilding className="icon" />
              {departments.map((dept, index) =>
                index + 1 === departments.length ? dept.name : dept.name + ', '
              )}
              {canEdit && (
                <span className="edit">
                  &nbsp;–{' '}
                  <a
                    href=" "
                    onClick={(e) =>
                      this.handleEditDepartment(e, this.props.user)
                    }
                  >
                    Edit
                  </a>
                </span>
              )}
            </p>
          </td>
          {/* Dynamically build out all checkboxes */}
          {Object.keys(checkboxMap).map((adminType) =>
            (adminType === 'clientAdmin' || adminType === 'admin') &&
            !SystemRoleService.hasSomeRoles([SystemRoles.ADMIN]) ? null : (
              <td
                key={`item-cell-${adminType}-${userId}`}
                className="item-cell checkbox-cell text-center"
              >
                {canEdit && (
                  <input
                    type="checkbox"
                    checked={this.props.user[adminType]}
                    disabled={loading === LoadStates.Loading}
                    onChange={(e) =>
                      this.changeAdmin(adminType, e.target.checked)
                    }
                  />
                )}
              </td>
            )
          )}
        </tr>
      </>
    );
  }
}
