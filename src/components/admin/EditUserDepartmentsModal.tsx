import * as React from 'react';
import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Tabs,
  Tab,
  Alert,
} from 'react-bootstrap';
import { FaBuilding, FaUserAlt } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  Animated,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import GenericModal from '../controls/GenericModal';
import IAdminUser from '../../models/IAdminUser';
import IAdminUserDepartment from '../../models/IAdminUserDepartment';
import ErrorUtil from '../../utilities/ErrorUtil';

export enum TAB_GROUP_TYPE {
  ADD_DEPARTMENT = 'ADD_DEPARTMENT',
  REMOVE_DEPARTMENT = 'REMOVE_DEPARTMENT',
}

export enum ALERT_STYLE_TYPE {
  SUCCESS = 'success',
  DANGER = 'danger',
}

interface IEditUserDepartmentsModalProps {
  onClosed: () => void;
  show: boolean;
  user: IAdminUser;
  userUpdated: () => void;
}

interface IEditUserDepartmentsModalState {
  availableDepartments: IAdminUserDepartment[];
  loading: LoadStates;
  selectedDepartmentId: string;
  selectedTab: TAB_GROUP_TYPE;
  showAlert: boolean;
  alertStyle: ALERT_STYLE_TYPE;
  alertMsg: string;
}

class EditUserDepartmentsModal extends SrUiComponent<
  IEditUserDepartmentsModalProps,
  IEditUserDepartmentsModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      availableDepartments: [],
      selectedDepartmentId: '',
      selectedTab: TAB_GROUP_TYPE.ADD_DEPARTMENT,
      showAlert: false,
      alertStyle: null,
      alertMsg: '',
    };
  }

  async onComponentMounted() {
    this.getAvailableDepartments();
  }

  async getAvailableDepartments() {
    const { loading } = this.state;

    if (loading === LoadStates.Loading) {
      return;
    }
    this.setPartial({ loading: LoadStates.Loading });

    try {
      let resp = await ApiHelpers.read(`departments`);

      if (!resp.good) {
        throw new Error('could not get the department list');
      }

      let respData = JSON.parse(resp.data);

      this.setPartial({
        loading: LoadStates.Succeeded,
        availableDepartments: respData,
      });
    } catch (error) {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  getFilteredDepartments() {
    // returns availableDepartments without any matching userDepartments
    const filteredDepartments = this.state.availableDepartments.filter((ad) => {
      return this.props.user.departments.every((ud) => ud.id !== ad.id);
    });
    return orderBy(filteredDepartments, ['name'], ['asc']);
  }

  async handleAddDepartment() {
    const { selectedDepartmentId, loading } = this.state;
    const { user, userUpdated } = this.props;

    if (loading === LoadStates.Loading || isEmpty(selectedDepartmentId)) {
      return;
    }
    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.create(
        `departments/${selectedDepartmentId}/users`,
        { UserId: user.id }
      );
      if (!resp.good) {
        throw new Error('Error adding users department.');
      }
      this.setPartial({
        loading: LoadStates.Succeeded,
        selectedDepartmentId: '',
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.SUCCESS,
        alertMsg: Localizer.get('Successfully added department.'),
      });
      userUpdated();
    } catch (error) {
      console.error(error);
      this.setPartial({
        loading: LoadStates.Failed,
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.DANGER,
        alertMsg: Localizer.get('Error adding department. Please try again.'),
      });
    }
    // auto-close the alert
    setTimeout(() => {
      this.setPartial({ showAlert: false, alertMsg: '' });
    }, 2000);
  }

  async handleRemoveDepartment() {
    const { selectedDepartmentId, loading } = this.state;
    const { user, userUpdated } = this.props;

    if (loading === LoadStates.Loading || isEmpty(selectedDepartmentId)) {
      return;
    }
    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.delete(
        `departments/${selectedDepartmentId}/users`,
        { UserId: user.id }
      );

      if (!isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      } else if (!resp.good) {
        throw new Error('Error removing department. Please try again.');
      }

      this.setPartial({
        loading: LoadStates.Succeeded,
        selectedDepartmentId: '',
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.SUCCESS,
        alertMsg: Localizer.get('Successfully removed department.'),
      });
      userUpdated();
    } catch (error) {
      console.error(error);
      this.setPartial({
        loading: LoadStates.Failed,
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.DANGER,
        alertMsg: Localizer.get(error.message),
      });
    }
    // auto-close the alert
    setTimeout(() => {
      this.setPartial({ showAlert: false, alertMsg: '' });
    }, 2000);
  }

  handleTabSelect(selectedTab: TAB_GROUP_TYPE) {
    this.setPartial({
      selectedTab,
      selectedDepartmentId: '',
    });
  }

  handleClose() {
    this.props.onClosed();
  }

  performRender() {
    const {
      loading,
      selectedTab,
      selectedDepartmentId,
      showAlert,
      alertStyle,
      alertMsg,
    } = this.state;
    const { show, user } = this.props;
    const filteredDepartments = this.getFilteredDepartments();

    return (
      <GenericModal
        show={show}
        modalTitle={Localizer.get('Edit User Departments')}
        onCloseClicked={() => this.handleClose()}
        hasCloseButton={true}
        closeButtonType="close"
        closeButtonDisable={loading === LoadStates.Loading}
        bodyClassName="edit-user-departments-modal"
      >
        <form noValidate>
          <p className="name">
            <FaUserAlt className="icon" />
            {user.firstName} {user.lastName}
          </p>
          <p className="department">
            <FaBuilding className="icon" />
            {user.departments.map((dept, index) =>
              index + 1 === user.departments.length
                ? dept.name
                : dept.name + ', '
            )}
          </p>
          <Tabs
            id="department-group-type"
            activeKey={selectedTab}
            onSelect={(tab) => this.handleTabSelect(tab)}
          >
            <Tab
              eventKey={TAB_GROUP_TYPE.ADD_DEPARTMENT}
              title={Localizer.get('Add Department')}
            >
              <div className="d-flex align-items-center mt-2">
                <FormGroup controlId="allDepartments" className="w-100">
                  <ControlLabel>
                    {Localizer.get('Choose a department to add')}
                  </ControlLabel>
                  <FormControl
                    value={selectedDepartmentId}
                    componentClass="select"
                    onChange={(e: any) =>
                      this.setPartial({ selectedDepartmentId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      – –
                    </option>
                    {filteredDepartments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
                <Button
                  bsStyle="success"
                  className="mt-1 ml-1"
                  onClick={() => this.handleAddDepartment()}
                  disabled={isEmpty(selectedDepartmentId)}
                >
                  Add
                </Button>
              </div>
            </Tab>
            <Tab
              eventKey={TAB_GROUP_TYPE.REMOVE_DEPARTMENT}
              title={Localizer.get('Remove Department')}
            >
              <div className="d-flex align-items-center mt-2">
                <FormGroup controlId="usersDepartments" className="w-100">
                  <ControlLabel>
                    {Localizer.get('Choose a department to remove')}
                  </ControlLabel>
                  <FormControl
                    value={selectedDepartmentId}
                    componentClass="select"
                    onChange={(e: any) =>
                      this.setPartial({ selectedDepartmentId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      – –
                    </option>
                    {user.departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                        defaultChecked={false}
                      >
                        {department.name}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
                <Button
                  bsStyle="danger"
                  className="mt-1 ml-1"
                  onClick={() => this.handleRemoveDepartment()}
                  disabled={isEmpty(selectedDepartmentId)}
                >
                  Remove
                </Button>
              </div>
            </Tab>
          </Tabs>
          {showAlert && (
            <Animated in>
              <Alert
                onDismiss={() => {
                  this.setPartial({ showAlert: false, alertMsg: '' });
                }}
                bsStyle={alertStyle}
              >
                {Localizer.get(alertMsg)}
              </Alert>
            </Animated>
          )}
        </form>
      </GenericModal>
    );
  }
}

export default EditUserDepartmentsModal;
