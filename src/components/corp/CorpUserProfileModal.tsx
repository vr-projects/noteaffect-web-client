import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import { FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  Animated,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import GenericModal from '../controls/GenericModal';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import AppMappers from '../../mappers/AppMappers';
import * as AppActions from '../../store/app/AppActions';
import IDepartment from '../../models/IDepartment';

interface IConnectedCorpUserProfileModalProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ICorpUserProfileModalProps {
  show: boolean;
  onClosed: (number?) => void;
}

interface ICorpUserProfileModalState {
  loading: LoadStates;
  isEditMode: boolean;
  firstName: string;
  firstNameTouched: boolean;
  lastName: string;
  lastNameTouched: boolean;
  email: string;
  organizationName: string;
  timezone: string; // userInformation timezone is in form 'America/New York', but this component uses 'ET'
  availableTimezones: any[];
  language: string;
  userProfileUpdated: boolean;
  departments: IDepartment[];
}

// used as a cache for resetting touched fields

class CorpUserProfileModal extends SrUiComponent<
  IConnectedCorpUserProfileModalProps & ICorpUserProfileModalProps,
  ICorpUserProfileModalState
> {
  private timezoneRef: HTMLInputElement;

  initialState() {
    const {
      firstName,
      lastName,
      email,
      organizationName,
      departments,
    } = this.props.userInformation.toJS();

    return {
      loading: LoadStates.Unloaded,
      isEditMode: false,
      firstName,
      firstNameTouched: false,
      lastName,
      lastNameTouched: false,
      email,
      organizationName,
      timezone: '',
      availableTimezones: [],
      language: '',
      userProfileUpdated: false,
      departments,
    };
  }

  async onComponentMounted() {
    await this.getTimezones();
  }

  async getTimezones() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }
    const { timezone: userProfileTimezone } = this.props.userInformation.toJS();

    this.setPartial({ loading: LoadStates.Loading });

    try {
      let resp = await ApiHelpers.read(`account/timezones`);

      if (!resp.good) {
        throw new Error('could not get timezones');
      }

      let respData = JSON.parse(resp.data);

      this.setPartial({
        loading: LoadStates.Succeeded,
        availableTimezones: respData,
        timezone: userProfileTimezone,
      });
    } catch (error) {
      this.setPartial({ loading: LoadStates.Failed, timezone: 'ET' });
    }
  }

  allFieldsValidated() {
    // validate the touched data
    if (!isNull(this.validateFirstName())) {
      return false;
    }
    if (!isNull(this.validateLastName())) {
      return false;
    }
    return true;
  }

  handleOnConfirmClicked() {
    const { isEditMode } = this.state;
    // turn on edit mode
    if (!isEditMode) {
      this.setPartial({ isEditMode: true });
      return;
    }

    // validate then submit
    if (this.allFieldsValidated()) {
      this.onFormSubmit();
      return;
    }
  }

  handleClose() {
    this.resetModalValues();
    this.props.onClosed();
  }

  resetModalValues() {
    const {
      firstName,
      lastName,
      email,
      organizationName,
      timezone,
      language,
    } = this.props.userInformation.toJS();

    // this.timezoneRef.value = this.state.timezone;
    this.setPartialAsync({
      loading: LoadStates.Unloaded,
      isEditMode: false,
      firstName,
      firstNameTouched: false,
      lastName,
      lastNameTouched: false,
      email,
      organizationName,
      timezone,
      language,
      userProfileUpdated: false,
    });
  }

  async updateUserProfile() {
    const { firstName, lastName, timezone } = this.state;

    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    try {
      this.setPartial({ loading: LoadStates.Loading });
      const convertedAbbrTz = this.state.availableTimezones.find(
        (tz) => tz.tzdataId === timezone
      ).abbreviation;

      let resp = await ApiHelpers.update(`account/profile`, {
        FirstName: firstName,
        LastName: lastName,
        Timezone: convertedAbbrTz,
      });

      if (!resp.good) {
        throw new Error(Localizer.get('Error updating your user profile'));
      }

      this.setPartial({
        userProfileUpdated: true,
        loading: LoadStates.Succeeded,
      });

      this.props.dispatch(
        AppActions.setUserProfile({
          firstName,
          lastName,
          timezone,
        })
      );

      setTimeout(() => {
        this.handleClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      // TODO need to trigger error condition
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  async onFormSubmit() {
    // save the updated profile
    await this.updateUserProfile();
  }

  handleFieldChange(e, formField: string) {
    switch (formField) {
      case 'firstName':
        this.setPartial({ firstName: e.target.value, firstNameTouched: true });
        break;
      case 'lastName':
        this.setPartial({ lastName: e.target.value, lastNameTouched: true });
        break;
      // case 'email':
      //   this.setPartial({ email: e.target.value });
      //   break;
      // case 'organizationName':
      //   this.setPartial({ organizationName: e.target.value });
      //   break;
      // case 'departmentName':
      //   this.setPartial({ departmentName: e.target.value });
      //   break;
      case 'timezone':
        this.setPartial({ timezone: e.target.value });
        break;
      // case 'language':
      //   this.setPartial({ language: e.target.value });
      //   break;
      default:
        return;
    }
  }

  validateFirstName(): 'error' | null {
    const { firstName, firstNameTouched } = this.state;
    if (firstNameTouched && isEmpty(firstName)) {
      return 'error';
    }
    return null;
  }

  validateLastName(): 'error' | null {
    const { lastName, lastNameTouched } = this.state;
    if (lastNameTouched && isEmpty(lastName)) {
      return 'error';
    }
    return null;
  }

  performRender() {
    const {
      isEditMode,
      firstName,
      lastName,
      email,
      organizationName,
      timezone,
      availableTimezones,
      userProfileUpdated,
      departments,
    } = this.state;
    const { show } = this.props;

    return (
      <GenericModal
        show={show}
        modalTitle={
          !isEditMode ? Localizer.get('Profile') : Localizer.get('Edit Profile')
        }
        onCloseClicked={() => this.handleClose()}
        hasCloseButton={true}
        closeButtonType={isEditMode ? 'cancel' : 'close'}
        closeButtonDisable={userProfileUpdated === true}
        hasConfirmButton={true}
        confirmButtonType={!isEditMode ? 'edit' : 'save'}
        confirmButtonDisable={
          this.allFieldsValidated() === false || userProfileUpdated === true
        }
        confirmButtonStyle={!isEditMode ? 'info' : 'success'}
        onConfirmClicked={() => this.handleOnConfirmClicked()}
      >
        {userProfileUpdated && (
          <Animated in>
            <Alert bsStyle="success">
              {Localizer.get('Successfully saved your data.')}
            </Alert>
          </Animated>
        )}
        <div className="corp-user-profile-form">
          <form noValidate>
            <div className="d-flex">
              <FormGroup
                className="mr-2 flex-grow w-50"
                controlId="userProfileFirstName"
                validationState={this.validateFirstName()}
              >
                <ControlLabel>
                  <span>{Localizer.get('First Name:')}</span>
                </ControlLabel>
                <FormControl
                  type="text"
                  required
                  value={firstName}
                  disabled={!isEditMode}
                  onChange={(e) => this.handleFieldChange(e, 'firstName')}
                />
              </FormGroup>
              <FormGroup
                className="flex-grow w-50"
                controlId="userProfileLastName"
                validationState={this.validateLastName()}
              >
                <ControlLabel>
                  <span>{Localizer.get('Last Name:')}</span>
                </ControlLabel>
                <FormControl
                  type="text"
                  required
                  value={lastName}
                  disabled={!isEditMode}
                  onChange={(e) => this.handleFieldChange(e, 'lastName')}
                />
              </FormGroup>
            </div>
            <div className="d-flex">
              <FormGroup className="flex-grow" controlId="userProfileEmail">
                <ControlLabel>
                  <span>{Localizer.get('Email:')}</span>
                </ControlLabel>
                <FormControl
                  type="email"
                  // required
                  value={email}
                  disabled={true}
                  // onChange={(e) => this.handleFieldChange(e, 'email')}
                />
              </FormGroup>
            </div>
            <div className="d-flex">
              <FormGroup
                className="mr-2 flex-grow w-50"
                controlId="userProfileOrganizationName"
              >
                <ControlLabel>
                  <span>{Localizer.get('Organization Name:')}</span>
                </ControlLabel>
                <FormControl
                  type="text"
                  // required
                  value={organizationName}
                  disabled={true}
                  // onChange={(e) =>
                  //   this.handleFieldChange(e, 'organizationName')
                  // }
                />
              </FormGroup>
              <FormGroup
                className="flex-grow w-50"
                controlId="userProfileDepartmentName"
              >
                <ControlLabel>
                  <span>{Localizer.get('Department Name:')}</span>
                </ControlLabel>
                <FormControl
                  type="text"
                  // required
                  value={
                    !isEmpty(departments)
                      ? departments
                          .map((dept) => dept.name)
                          .join(', ')
                          .toString()
                      : '– –'
                  }
                  disabled={true}
                  // onChange={(e) => this.handleFieldChange(e, 'departmentName')}
                />
              </FormGroup>
            </div>
            <div className="d-flex">
              <FormGroup
                className="mr-2 w-50 flex-grow"
                controlId="userProfileTimezone"
              >
                <ControlLabel>Timezone:</ControlLabel>
                <FormControl
                  required
                  componentClass="select"
                  disabled={!isEditMode}
                  onChange={(e) => this.handleFieldChange(e, 'timezone')}
                  value={timezone}
                  inputRef={(ref) => (this.timezoneRef = ref)}
                >
                  {/* //TODO use React-Bootstrap dropdown if possible */}
                  {availableTimezones.map((zone, index) => (
                    <option key={index} value={zone.tzdataId}>
                      {zone.name}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup
                className="flex-grow w-50"
                controlId="userProfileLanguage"
              >
                <ControlLabel>Language:</ControlLabel>
                <FormControl
                  componentClass="select"
                  disabled={true}
                  // onChange={(e) => this.handleFieldChange(e, 'language')}
                >
                  <option value="English">English</option>
                </FormControl>
              </FormGroup>
            </div>
          </form>
        </div>
      </GenericModal>
    );
  }
}

export default connect<
  IConnectedCorpUserProfileModalProps,
  void,
  ICorpUserProfileModalProps
>(AppMappers.AppMapper)(CorpUserProfileModal);
