import * as React from 'react';
import { connect } from 'react-redux';
import 'moment-timezone';
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isEmpty';
import {
  Button,
  Alert,
  FormGroup,
  ControlLabel,
  FormControl,
  Modal,
} from 'react-bootstrap';
import { FaTimes, FaShare } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
  Animated,
} from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IAppEnvironment from '../../interfaces/IAppEnvironment';
import SharePermission from '../../enums/SharePermission';
import ISeries from '../../models/ICourse';
import Localizer from '../../utilities/Localizer';
import AddEmailsFormGroup from '../controls/AddEmailsFormGroup';
import EmailDomainUtil from '../../utilities/EmailDomainUtil';
import MultiRadioToggler, { IOption } from '../controls/MultiRadioToggler';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedSharePresentationsByEmailModalProps {
  userInformation?: IImmutableObject<IUserInformation>;
  appEnvironment?: IImmutableObject<IAppEnvironment>;
}
interface ISharePresentationsByEmailModalProps {
  show: boolean;
  onClose: (number?) => void;
  permissionCode: SharePermission;
  series: ISeries;
}

interface ISharePresentationsByEmailModalState {
  loading: LoadStates;
  // form values
  includeNotes: boolean;
  includeNotesTouched: boolean;
  description: string;
  descriptionTouched: boolean;
  emails: string;
  emailsTouched: boolean;
  emailsValid: boolean;
  emailsValidationError: boolean;
  emailsClientDomainError: boolean;
  disableShareButton: boolean;
}

const includeOptions: IOption[] = [
  { label: 'Yes', value: 'yes', style: 'success' },
  { label: 'No', value: 'no', style: 'danger' },
];

class SharePresentationsByEmailModal extends SrUiComponent<
  ISharePresentationsByEmailModalProps &
    IConnectedSharePresentationsByEmailModalProps,
  ISharePresentationsByEmailModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      // form values
      includeNotes: true,
      description: '',
      emails: '',
      // form state
      includeNotesTouched: false,
      descriptionTouched: false,
      emailsValid: false,
      emailsTouched: false,
      emailsValidationError: false,
      emailsClientDomainError: false,
      disableShareButton: true,
    };
  }

  componentWillUnmount() {
    this.throttledValidateEmails.cancel();
  }

  handleIncludeNotes(option) {
    this.setState({
      includeNotes: option === 'yes',
      includeNotesTouched: true,
    });
  }

  handleDescriptionChange(e) {
    const description = e.target.value;

    this.setPartial({
      description,
      descriptionTouched: true,
    });

    this.calcDisableShareBtn(description, undefined);
  }

  validateDescription(): 'error' | null {
    const { description, descriptionTouched } = this.state;
    if (descriptionTouched && description.length === 0) {
      return 'error';
    }
    return null;
  }

  /** email validation logic */
  validateObserverEmailState(): 'error' | null {
    const { emails, emailsTouched } = this.state;
    if (emailsTouched && emails.length === 0) {
      return 'error';
    }
    return null;
  }

  handleEmailsChange(e) {
    this.setPartial({
      emails: e.target.value,
      emailsTouched: true,
      emailsValidationError: false,
      emailsClientDomainError: false,
      disableShareButton: true,
    });

    this.throttledValidateEmails.cancel();
    this.throttledValidateEmails();
  }

  private throttledValidateEmails = throttle(
    () => {
      this.validateEmails();
    },
    750,
    { leading: false }
  );

  validateEmails() {
    const { permissionCode } = this.props;
    const { emails, description } = this.state;
    const splitEmails = emails.split(',');
    const validEmails = splitEmails.every((email) =>
      EmailDomainUtil.isEmailStrings(email.trim())
    );
    let areAllowedDomains = true;

    // Colleagues status needs to ensure emails are in clientDomains list
    if (validEmails && permissionCode === SharePermission.Colleagues) {
      // now check if email is client domain
      let splitEmailsArray = emails.split(','); //  ['me@databerry.co]
      const allowedDomainsArray = this.props.appEnvironment.toJS().client
        .domains;

      let allowedDomainsRe = new RegExp(
        `(${allowedDomainsArray.join('|')}$)`,
        'i'
      );

      areAllowedDomains = splitEmailsArray.every((email) => {
        let trimmedEmail = email.trim();

        const test = allowedDomainsRe.test(trimmedEmail);
        return test;
      });

      this.setPartial({
        emailsClientDomainError: !areAllowedDomains,
        emailsValid: areAllowedDomains,
      });
    }

    const disableShareButton = this.calcDisableShareBtn(
      description,
      validEmails && areAllowedDomains
    );

    this.setPartialAsync({
      emailsValidationError: !validEmails,
      emailsValid: validEmails,
      disableShareButton,
    });
  }

  calcDisableShareBtn = (description, emailsValid) => {
    const {
      descriptionTouched,
      emails,
      emailsTouched,
      emailsValidationError,
      emailsClientDomainError,
      loading,
    } = this.state;

    const enableShareButton =
      description.length > 0 &&
      descriptionTouched &&
      emails.length > 0 &&
      emailsTouched &&
      emailsValid &&
      !emailsValidationError &&
      !emailsClientDomainError &&
      loading !== LoadStates.Loading;

    return !enableShareButton;
  };

  async handleFormSubmit(e) {
    e.preventDefault();

    const {
      series: { id: seriesId },
    } = this.props;
    const { includeNotes, description, emails } = this.state;

    const payload = {
      ShareRemarks: includeNotes,
      Description: description,
      Email: emails,
    };

    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });

      const createObserversResp = await ApiHelpers.create(
        `series/${seriesId}/users/observer`,
        payload
      );

      if (!createObserversResp.good) {
        throw new Error('Error adding observers to meeting');
      }

      this.setPartial({
        description: '',
        descriptionTouched: false,
        includeNotesTouched: false,
        emails: '',
        emailsTouched: false,
        loading: LoadStates.Succeeded,
      });
      this.broadcast(AppBroadcastEvents.SharedByEmail);

      // success alert fade out
      setTimeout(() => {
        this.setPartialAsync({
          loading: LoadStates.Unloaded,
        });
      }, 3000);
    } catch (error) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
    }
  }

  handleClose() {
    this.setState({ ...this.initialState() });
    this.props.onClose();
  }

  performRender() {
    const { series, show } = this.props;
    const allowedDomainsArray = this.props.appEnvironment.toJS().client.domains;

    const {
      loading,
      description,
      emails,
      emailsValidationError,
      emailsClientDomainError,
      disableShareButton,
    } = this.state;

    return (
      <Modal
        show={show}
        keyboard
        backdrop={'static'}
        onHide={() => this.handleClose()}
      >
        <Modal.Header>
          <Modal.Title>
            {Localizer.get('Share Presentations With Others')} - {series.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Updating ...')}
            errorMessage={Localizer.get(
              'Something went wrong.  Please try again later.'
            )}
          />
          <Alert bsStyle="info">
            {Localizer.get(
              'All presentations associated with the selected meeting will be shared with the individuals added below.'
            )}
          </Alert>
          <form noValidate>
            <div className="d-flex flex-column">
              {/* Include Notes */}
              <FormGroup className="d-flex justify-content-between">
                <ControlLabel htmlFor="include-notes-toggler">
                  {Localizer.get('Include notes and Annotations?')}
                </ControlLabel>

                <MultiRadioToggler
                  include-notes-toggler
                  label="Include:"
                  options={includeOptions}
                  defaultOptionIndex={0}
                  disable={loading === LoadStates.Loading}
                  onToggled={(option) => this.handleIncludeNotes(option)}
                />
              </FormGroup>
              {/* Description */}
              <FormGroup
                className="flex-grow mb-0"
                controlId="formDescription"
                validationState={this.validateDescription()}
              >
                <ControlLabel>
                  <span>{Localizer.get('* Description:')}</span>
                </ControlLabel>
                <FormControl
                  disabled={false}
                  required
                  value={description}
                  componentClass="textarea"
                  className="resize-vertical"
                  placeholder={Localizer.get(
                    'Enter Description for Sharing Email'
                  )}
                  onChange={(e) => this.handleDescriptionChange(e)}
                />
              </FormGroup>
              {/* Emails */}
              <AddEmailsFormGroup
                controlId="formShareeEmails"
                validator={this.validateObserverEmailState()}
                label={Localizer.get(
                  'Add by email (unregistered users will be sent an invitation to join NoteAffect):'
                )}
                emails={emails}
                disabled={false}
                onChange={(e) => this.handleEmailsChange(e)}
                validationError={emailsValidationError}
                errorMessage={Localizer.get(
                  'Please enter comma-separated email addresses of participants (i.e. participant1@email.com, participant2@email.com).'
                )}
                hideAddBtn={true}
                className="mt-2"
              />
              {emailsClientDomainError && (
                <Animated in>
                  <Alert bsStyle="warning">
                    {Localizer.get(
                      'Your users must have email addresses with the following domains:'
                    )}
                    <ul>
                      {allowedDomainsArray.map((domain, idx) => (
                        <li key={`domain-${idx}`}>{domain}</li>
                      ))}
                    </ul>
                  </Alert>
                </Animated>
              )}
            </div>
          </form>
          {loading === LoadStates.Succeeded && (
            <Alert bsStyle="success">
              {Localizer.get(
                'Successfully shared with email addresses entered.'
              )}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="default" onClick={() => this.handleClose()}>
            <FaTimes />
            <span className="ml-1">{Localizer.get('Close')}</span>
          </Button>{' '}
          <Button
            type="submit"
            bsStyle="info"
            className="ml-1"
            onClick={(e) => this.handleFormSubmit(e)}
            disabled={disableShareButton}
          >
            <FaShare />
            <span className="ml-1">{Localizer.get('Share')}</span>
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect<
  IConnectedSharePresentationsByEmailModalProps,
  {},
  ISharePresentationsByEmailModalProps
>(AppMappers.AppMapper)(SharePresentationsByEmailModal);
