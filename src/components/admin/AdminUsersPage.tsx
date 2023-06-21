import React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { Button, Alert } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  ApiHelpers,
  Animated,
} from 'react-strontium';
import IAdminUser from '../../models/IAdminUser';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import ErrorUtil from '../../utilities/ErrorUtil';
import Localizer from '../../utilities/Localizer';
import AppMappers from '../../mappers/AppMappers';
import AdminUsersTable from './AdminUsersTable';
import AddUserModalButton from './AddUserModalButton';
import SearchFilterInput from '../controls/SearchFilterInput';
import EditUserDepartmentsModal from './EditUserDepartmentsModal';

interface IConnectedAdminUsersPageProps {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface IAdminUsersPageProps {}

interface IAdminUsersPageState {
  filter: string;
  currentPage: number;
  totalPages: number;
  users: IAdminUser[];
  loading: LoadStates;
  userUpdateError: boolean;
  isEditDepartmentModalOpen: boolean;
  selectedUser: IAdminUser;
}

class AdminUsersPage extends SrUiComponent<
  IConnectedAdminUsersPageProps & IAdminUsersPageProps,
  IAdminUsersPageState
> {
  initialState() {
    return {
      filter: null,
      currentPage: null,
      totalPages: null,
      users: [],
      loading: LoadStates.Unloaded,
      userUpdateError: false,
      isEditDepartmentModalOpen: false,
      selectedUser: null,
    };
  }

  onComponentMounted() {
    const { currentPage, filter } = this.state;
    this.updateUserList(currentPage, filter);
  }

  async updateUserList(currentPage: number, filter = '') {
    const { loading, selectedUser } = this.state;
    if (loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.read(
        `admin/users?page=${currentPage}&filter=${filter || ''}`
      );
      // TODO - tech debt use this ErrorUtil.handleAPIErrors throughout codebase
      ErrorUtil.handleAPIErrors(resp, 'There was an error getting users.');

      const respData = JSON.parse(resp.data);

      if (!isEmpty(selectedUser)) {
        this.setPartial({
          selectedUser: respData.data.filter(
            (user: IAdminUser) => user.id === selectedUser.id
          )[0],
        });
      }

      this.setPartial({
        loading: LoadStates.Succeeded,
        users: respData.data,
        currentPage:
          !isEmpty(filter) && currentPage ? currentPage : respData.page,
        totalPages: respData.pages,
      });
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  pageChanged(newCurrentPage: number) {
    const { filter } = this.state;
    this.updateUserList(newCurrentPage, filter);
  }

  filterChanged(filter: string) {
    const { currentPage } = this.state;
    const clearedFilter = isEmpty(filter);
    const updatedCurrentPage = clearedFilter ? 1 : currentPage;

    this.setPartial({
      filter: filter,
      currentPage: updatedCurrentPage,
    });

    this.deferred(
      () => {
        this.updateUserList(updatedCurrentPage, filter);
      },
      350,
      'filter-update'
    );
  }

  setIsEditDepartmentModalOpen(selectedUser: IAdminUser) {
    this.setPartial({
      isEditDepartmentModalOpen: true,
      selectedUser: selectedUser,
    });
  }

  handleEditUserDepartments() {
    this.setPartial({ isEditDepartmentModalOpen: false, selectedUser: null });
  }

  performRender() {
    const { userInformation } = this.props;
    const {
      loading,
      filter,
      currentPage,
      totalPages,
      users,
      userUpdateError,
      isEditDepartmentModalOpen,
      selectedUser,
    } = this.state;
    const currentUserId = userInformation.toJS().id;

    return (
      <div className="admin-users-page">
        <>
          <h1>{Localizer.get('Manage Users')}</h1>

          <div className="d-flex align-items-center mb-3 rel">
            <div className="search-filter flex-grow">
              <SearchFilterInput
                placeholder={Localizer.get('Search users')}
                updateCurrentVal={(val) => this.filterChanged(val)}
                clearedInput={() => this.filterChanged('')}
              />
            </div>
            <div className="modal-button mx-1">
              <AddUserModalButton />
            </div>
            <div className="users-pager">
              {totalPages > 0 ? (
                <>
                  <Button
                    disabled={!(currentPage > 1)}
                    bsStyle="info"
                    bsSize="small"
                    className="na-btn-reset-width"
                    onClick={() => this.pageChanged(currentPage - 1)}
                  >
                    <FaChevronLeft />
                  </Button>

                  <span className="mx-1">
                    {Localizer.get('Page')} {currentPage} {Localizer.get('of')}{' '}
                    {totalPages}{' '}
                  </span>

                  <Button
                    disabled={currentPage >= totalPages}
                    bsStyle="info"
                    bsSize="small"
                    className="na-btn-reset-width"
                    onClick={() => this.pageChanged(currentPage + 1)}
                  >
                    <FaChevronRight />
                  </Button>
                </>
              ) : null}
            </div>

            <hr />
          </div>
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Loading users...')}
            errorMessage={Localizer.get('There was an error loading users.')}
          />
          {userUpdateError && (
            <Alert bsStyle="danger">
              {Localizer.get(
                'There was an error updating your admin settings.'
              )}
            </Alert>
          )}
          {loading === LoadStates.Succeeded && (
            <Animated in>
              <AdminUsersTable
                currentUserId={currentUserId}
                editUserDepartment={(selectedUser) =>
                  this.setIsEditDepartmentModalOpen(selectedUser)
                }
                users={users}
                userUpdated={() => this.updateUserList(currentPage, filter)}
                userUpdateError={() =>
                  this.setPartial({ userUpdateError: true })
                }
              />
            </Animated>
          )}
          {isEditDepartmentModalOpen && (
            <EditUserDepartmentsModal
              show={isEditDepartmentModalOpen}
              onClosed={() => this.handleEditUserDepartments()}
              user={selectedUser}
              userUpdated={() => {
                this.updateUserList(currentPage, filter);
              }}
            />
          )}
        </>
      </div>
    );
  }
}

export default connect<
  IConnectedAdminUsersPageProps,
  null,
  IAdminUsersPageProps
>(AppMappers.AppMapper)(AdminUsersPage);
