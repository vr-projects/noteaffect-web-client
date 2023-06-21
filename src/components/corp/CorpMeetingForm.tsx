import * as React from 'react';
import { connect } from 'react-redux';
import Datetime from 'react-datetime';
import moment, { Moment } from 'moment';
import isNull from 'lodash/isNull';
import 'moment-timezone';
import { FaLock, FaTimes, FaSave } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  MenuItem,
  ButtonToolbar,
  Dropdown,
  Button,
} from 'react-bootstrap';
import {
  SharePermissionMap,
  getSharePermission,
  getSharePermissionStyle,
} from '../../services/SharePermissionService';
import SharePermissionBadge from './SharePermissionBadge';
import HelpIconTooltip from '../controls/HelpIconTooltip';
import InputClearButton from '../controls/InputClearButton';
import Localizer from '../../utilities/Localizer';
import DateFormatUtil from '../../utilities/DateFormatUtil';
import ICourse from '../../models/ICourse';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import AppMappers from '../../mappers/AppMappers';

interface IConnectedCorpMeetingFormProps {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface ICorpMeetingFormProps {
  type: 'add' | 'edit';
  departmentId: number;
  onSubmit: (payload, meetingId?) => void;
  onClose: () => void;
  meeting?: ICourse | null;
  disable: boolean;
}

interface ICorpMeetingFormState {
  name: string;
  sharePermission: number | null;
  dateTimeStart: any;
  dateTimeEnd: any;
  availableUntil: any;
  location: string | null;
  description: string | null;
  // ** touched validation
  nameTouched: boolean;
  sharePermissionTouched: boolean;
  dateTimeStartTouched: boolean;
  dateTimeEndTouched: boolean;
  availableUntilTouched: boolean;
  locationTouched: boolean;
  descriptionTouched: boolean;
  // ** lockdown
  lockdownEditing: boolean;
  lockdownEditingFields: string[] | null;
}

class CorpMeetingForm extends SrUiComponent<
  IConnectedCorpMeetingFormProps & ICorpMeetingFormProps,
  ICorpMeetingFormState
> {
  initialState() {
    const { type } = this.props;

    const initialStateObject = {
      // ** form values
      name: '',
      sharePermission: null,
      dateTimeStart: DateFormatUtil.getDefaultMeetingStart(),
      dateTimeEnd: DateFormatUtil.getDefaultMeetingEnd(),
      availableUntil: null,
      location: '',
      description: '',
      // ** form state
      nameTouched: false,
      sharePermissionTouched: false,
      dateTimeStartTouched: false,
      dateTimeEndTouched: false,
      availableUntilTouched: false,
      locationTouched: false,
      descriptionTouched: false,
      // ** form lockdown
      lockdownEditing: false,
      lockdownEditingFields: null,
    };

    if (type === 'edit') {
      const {
        meeting: {
          name,
          sharePermission,
          location,
          description,
          courseStart: dateTimeStart,
          courseEnd: dateTimeEnd,
          availableUntil,
        },
      } = this.props;

      const isEditingLockedDown = DateFormatUtil.getUnixToUserTimezoneIsBefore(
        dateTimeEnd
      );

      return {
        ...initialStateObject,
        name,
        sharePermission,
        dateTimeStart: isNull(dateTimeStart)
          ? null
          : moment.unix(dateTimeStart),
        dateTimeEnd: isNull(dateTimeEnd) ? null : moment.unix(dateTimeEnd),
        availableUntil: isNull(availableUntil)
          ? null
          : moment.unix(availableUntil),
        location: isNull(location) ? '' : location,
        description: isNull(description) ? '' : description,
        lockdownEditing: isEditingLockedDown,
        lockdownEditingFields: isEditingLockedDown
          ? ['dateTimeStart', 'dateTimeEnd', 'location', 'description']
          : [],
      };
    }

    return { ...initialStateObject };
  }

  onComponentMounted(): void {
    const { type, meeting } = this.props;
    if (type === 'add') {
      return;
    }
    if (type === 'edit' && meeting !== null) {
      const { sharePermission } = meeting;
      this.handleSharePermissionSelect(sharePermission);
      return;
    }
  }

  handleNameChange(e) {
    this.setPartial({ name: e.target.value, nameTouched: true });
  }

  handleSharePermissionSelect = (value) => {
    this.setPartial({
      sharePermission: value,
      sharePermissionTouched: true,
    });
  };

  handleLocationChange(e) {
    this.setPartial({
      location: e.target.value,
      locationTouched: true,
    });
  }

  handleDescriptionChange(e) {
    this.setPartial({
      description: e.target.value,
      descriptionTouched: true,
    });
  }

  validateName(): 'error' | null {
    const { name, nameTouched } = this.state;
    if (nameTouched && name.length === 0) {
      return 'error';
    }
    return null;
  }

  handleDateTimeStartChange(d: Moment | string) {
    this.setPartial({
      dateTimeStart: moment(d),
      dateTimeStartTouched: true,
      dateTimeEnd: moment(d).add(1, 'hour'),
    });
  }
  handleDateTimeEndChange(d: Moment | string) {
    this.setPartial({
      dateTimeEnd: moment(d),
      dateTimeEndTouched: true,
    });
  }
  handleAvailableUntilChange(d: Moment | string) {
    if (d === '') {
      this.setPartial({ availableUntil: null, availableUntilTouched: false });
      return;
    }
    this.setPartial({
      availableUntil: moment(d),
      availableUntilTouched: true,
    });
  }

  // bootstrap validation styling
  validationStateStart(): 'error' | null {
    const isValid = this.startDateFormGroupIsValid();
    if (!isValid) {
      return 'error';
    }
    return null;
  }
  // bootstrap validation styling
  validationStateEnd(): 'error' | null {
    const { dateTimeEnd } = this.state;
    const isValid = this.endDateFormGroupIsValid();
    if (isValid === undefined || dateTimeEnd === null) {
      return null;
    }
    if (!isValid) {
      return 'error';
    }
    return null;
  }
  // bootstrap validation styling
  validationStateAvailableUntil(): 'error' | null {
    const { availableUntil } = this.state;
    const isValid = this.availableUntilFormGroupIsValid();
    if (isValid === undefined || availableUntil === null) {
      return null;
    }
    if (!isValid) {
      return 'error';
    }
    return null;
  }

  // Helper for FormGroup and Save enabling
  startDateFormGroupIsValid = () => {
    const { dateTimeStart, dateTimeStartTouched } = this.state;
    if (!dateTimeStartTouched) {
      return true;
    }
    return moment(dateTimeStart).isAfter(moment());
  };

  // Datepicker validation
  isValidDateStart = (d) => {
    return moment(d).add(24, 'hours').isAfter(moment());
  };

  // Helper for FormGroup and Save enabling
  endDateFormGroupIsValid = () => {
    const { dateTimeStart, dateTimeEnd } = this.state;
    if (dateTimeStart) {
      return moment(dateTimeEnd).isAfter(dateTimeStart);
    }
    return moment(dateTimeEnd).isAfter(moment());
  };

  // Datepicker validation
  isValidDateEnd = (d) => {
    const { dateTimeStart } = this.state;
    if (dateTimeStart) {
      return moment(d).add(24, 'hours').isAfter(dateTimeStart);
    }
    return moment(d).add(24, 'hours').isAfter(moment());
  };

  // Helper for FormGroup and Save enabling
  availableUntilFormGroupIsValid = () => {
    const { dateTimeStart, dateTimeEnd, availableUntil } = this.state;

    if (dateTimeEnd) {
      return moment(availableUntil).isAfter(dateTimeEnd);
    }
    if (dateTimeStart) {
      return moment(availableUntil).isAfter(dateTimeStart);
    }
    return moment(availableUntil).isAfter(moment());
  };

  isValidDateAvailableUntil = (d) => {
    const { dateTimeStart, dateTimeEnd } = this.state;
    if (dateTimeEnd) {
      return moment(d).isAfter(dateTimeEnd);
    }
    if (dateTimeStart) {
      return moment(d).isAfter(dateTimeStart);
    }
    return moment(d).isAfter(moment());
  };

  calcDisableSaveBtn = () => {
    const {
      name,
      sharePermission,
      dateTimeStart,
      dateTimeEnd,
      availableUntilTouched,
    } = this.state;

    const selectedDatesCorrect =
      this.startDateFormGroupIsValid() &&
      this.endDateFormGroupIsValid() &&
      (availableUntilTouched ? this.availableUntilFormGroupIsValid() : true);

    const enableSaveBtn =
      name.length > 0 &&
      sharePermission !== null &&
      dateTimeStart &&
      dateTimeEnd &&
      selectedDatesCorrect;

    return !enableSaveBtn;
  };

  onClose() {}

  onFormSubmit(e) {
    e.preventDefault();
    const {
      name: Name,
      sharePermission: SharePermission,
      location: Location,
      description: Description,
      dateTimeStart,
      dateTimeEnd,
      availableUntil,
    } = this.state;

    let meetingId;

    const { departmentId, meeting, type } = this.props;

    if (type === 'edit') {
      meetingId = meeting.id;
    }

    const payload = {
      Name,
      SharePermission,
      Location: Location.length > 0 ? Location : null,
      Description,
      Start: moment(dateTimeStart).unix(),
      End: moment(dateTimeEnd).unix(),
      AvailableUntil: moment(availableUntil).unix(),
      Open: true,
      PeriodId: 1,
      DepartmentId: departmentId,
    };

    this.props.onSubmit(payload, meetingId);
  }

  performRender() {
    const { disable } = this.props;
    const {
      name,
      sharePermission,
      dateTimeStart,
      dateTimeEnd,
      availableUntil,
      description,
      location,
      lockdownEditing,
      lockdownEditingFields,
    } = this.state;

    return (
      <div className="corp-meeting-form">
        <form noValidate onSubmit={(e) => this.onFormSubmit(e)}>
          <div className="d-flex">
            {/* Meeting Name */}
            <FormGroup
              className="mr-3 flex-grow"
              controlId="formMeetingName"
              validationState={this.validateName()}
            >
              <ControlLabel>
                <span>{Localizer.get('* Meeting Name:')}</span>
              </ControlLabel>
              <FormControl
                type="text"
                required
                value={name}
                disabled={disable}
                placeholder={Localizer.get('Meeting Name')}
                onChange={(e) => this.handleNameChange(e)}
              />
            </FormGroup>
            {/* Meeting Permission */}
            <FormGroup
              controlId="formMeetingSharePermission"
              className="ml-auto"
            >
              <ControlLabel>
                <span>{Localizer.get('* Sharing Permission:')}</span>
              </ControlLabel>
              <HelpIconTooltip
                tooltipText={Localizer.get(
                  'Meeting permissions control how much of your meeting content can be shared by participants. *Open* settings allow sharing with anyone. *Colleagues* restricts sharing to members of your organization. *Participants* limits sharing to only other meeting participants. *Closed* restricts all content sharing.'
                )}
              />
              <ButtonToolbar className="d-flex">
                <Dropdown
                  id="meeting-share-permission-dropdown"
                  onSelect={this.handleSharePermissionSelect}
                  className="flex-grow d-flex"
                  disabled={disable}
                >
                  <Dropdown.Toggle
                    onSelect={this.handleSharePermissionSelect}
                    bsStyle={getSharePermissionStyle(sharePermission)}
                    className="flex-grow"
                  >
                    {getSharePermission(sharePermission, 'Choose Permission')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(SharePermissionMap)
                      .filter((spKey) => spKey !== 'None')
                      .map((spKey) => (
                        <MenuItem
                          key={spKey}
                          eventKey={SharePermissionMap[spKey]}
                        >
                          <span>{spKey}</span>{' '}
                          <SharePermissionBadge
                            permissionCode={SharePermissionMap[spKey]}
                          />
                        </MenuItem>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonToolbar>
            </FormGroup>
          </div>
          {/* Meeting Times */}
          <div className="d-flex justify-content-between">
            {/* Meeting Start Time */}
            <FormGroup
              controlId="dateTimeStart"
              validationState={this.validationStateStart()}
            >
              <ControlLabel>
                <span>
                  {Localizer.get(
                    `* Start Time (${DateFormatUtil.getDateToUserTimezoneAbbr(
                      dateTimeStart
                    )}):`
                  )}
                </span>
                {lockdownEditing &&
                  lockdownEditingFields.includes('dateTimeStart') && (
                    <span className="lock-icon">
                      <FaLock />
                    </span>
                  )}
              </ControlLabel>
              <HelpIconTooltip
                tooltipText={Localizer.get(
                  `Meetings times are in ${DateFormatUtil.getUserTimezoneDisplay()}.`
                )}
              />
              <Datetime
                locale={'en'}
                closeOnSelect={false}
                input={true}
                inputProps={{
                  readOnly: true,
                  required: true,
                  placeholder: Localizer.get('Select date & time'),
                  disabled:
                    disable ||
                    (lockdownEditing &&
                      lockdownEditingFields.includes('dateTimeStart')),
                }}
                isValidDate={this.isValidDateStart}
                value={dateTimeStart}
                displayTimeZone={`${DateFormatUtil.getUserTimezone()}`}
                timeConstraints={{ minutes: { min: 0, max: 59, step: 15 } }}
                dateFormat={true}
                timeFormat={true}
                onChange={(d) => this.handleDateTimeStartChange(d)}
              />
            </FormGroup>
            {/* Meeting End Time */}
            <FormGroup
              controlId="formMeetingEnd"
              validationState={this.validationStateEnd()}
            >
              <ControlLabel>
                <span>
                  {Localizer.get(
                    `* End Time (${DateFormatUtil.getDateToUserTimezoneAbbr(
                      dateTimeEnd
                    )}):`
                  )}
                </span>
                {lockdownEditing &&
                  lockdownEditingFields.includes('dateTimeEnd') && (
                    <span className="lock-icon">
                      <FaLock />
                    </span>
                  )}
              </ControlLabel>
              <HelpIconTooltip
                tooltipText={Localizer.get(
                  `Meetings times are in ${DateFormatUtil.getUserTimezoneDisplay()}.`
                )}
              />
              <Datetime
                closeOnSelect={false}
                inputProps={{
                  readOnly: true,
                  required: true,
                  placeholder: Localizer.get('Select date & time'),
                  disabled:
                    disable ||
                    (lockdownEditing &&
                      lockdownEditingFields.includes('dateTimeEnd')),
                }}
                value={dateTimeEnd}
                isValidDate={this.isValidDateEnd}
                displayTimeZone={`${DateFormatUtil.getUserTimezone()}`}
                timeConstraints={{ minutes: { min: 0, max: 59, step: 15 } }}
                input
                dateFormat={true}
                timeFormat={true}
                onChange={(d) => this.handleDateTimeEndChange(d)}
              />
            </FormGroup>
            {/* Meeting Available Until */}
            <FormGroup
              controlId="formMeetingEnd"
              validationState={this.validationStateAvailableUntil()}
              className="available-until"
            >
              <ControlLabel>
                {Localizer.get(
                  `Available Until (${DateFormatUtil.getDateToUserTimezoneAbbr(
                    availableUntil
                  )}):`
                )}
              </ControlLabel>
              <HelpIconTooltip
                tooltipText={Localizer.get(
                  `Meetings times are in ${DateFormatUtil.getUserTimezoneDisplay()}.`
                )}
              />
              <Datetime
                closeOnSelect={true}
                inputProps={{
                  readOnly: true,
                  required: false,
                  placeholder: Localizer.get('Select date'),
                  disabled: disable,
                }}
                utc
                input
                value={availableUntil}
                dateFormat={true}
                timeFormat={false}
                displayTimeZone={`${DateFormatUtil.getUserTimezone()}`}
                onChange={(d) => this.handleAvailableUntilChange(d)}
                isValidDate={this.isValidDateAvailableUntil}
              />
              {!isNull(availableUntil) && (
                <InputClearButton
                  className="input-clear-button"
                  handleClick={() => this.handleAvailableUntilChange('')}
                />
              )}
            </FormGroup>
          </div>
          {/* Meeting Location */}
          <FormGroup controlId="formMeetingLocation">
            <ControlLabel>
              <span>{Localizer.get('Meeting Location:')}</span>
              {lockdownEditing && lockdownEditingFields.includes('location') && (
                <span className="lock-icon">
                  <FaLock />
                </span>
              )}
            </ControlLabel>

            <FormControl
              type="text"
              value={location}
              placeholder={Localizer.get('Meeting Location')}
              onChange={(e) => this.handleLocationChange(e)}
              disabled={
                disable ||
                (lockdownEditing && lockdownEditingFields.includes('location'))
              }
            />
          </FormGroup>
          {/* Meeting Description */}
          <FormGroup controlId="formMeetingDescription">
            <ControlLabel>
              <span>{Localizer.get('Meeting Description:')}</span>
              {lockdownEditing &&
                lockdownEditingFields.includes('description') && (
                  <span className="lock-icon">
                    <FaLock />
                  </span>
                )}
            </ControlLabel>
            <FormControl
              componentClass="textarea"
              className="resize-vertical"
              value={description}
              placeholder={Localizer.get(
                'Include conferencing information for participants.'
              )}
              onChange={(e) => this.handleDescriptionChange(e)}
              disabled={
                disable ||
                (lockdownEditing &&
                  lockdownEditingFields.includes('description'))
              }
            />
          </FormGroup>
          <div className="corp-meeting-form-actions d-flex">
            <Button
              bsStyle="default"
              className="ml-auto"
              disabled={disable}
              onClick={() => this.props.onClose()}
            >
              <FaTimes />
              <span className="ml-1">{Localizer.get('Cancel')}</span>
            </Button>{' '}
            <Button
              type="submit"
              bsStyle="info"
              className="ml-1"
              disabled={disable || this.calcDisableSaveBtn()}
            >
              <FaSave />
              <span className="ml-1">{Localizer.get('Save')}</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export default connect<
  IConnectedCorpMeetingFormProps,
  {},
  ICorpMeetingFormProps
>(AppMappers.AppMapper)(CorpMeetingForm);
