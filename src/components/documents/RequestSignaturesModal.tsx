import * as React from 'react';
import Datetime from 'react-datetime';
import {
  SrUiComponent,
  LoadStates,
  Animated,
  ApiHelpers,
} from 'react-strontium';
import { Alert, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import moment, { Moment } from 'moment';
import throttle from 'lodash/throttle';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import IDocument from '../../models/IDocument';
import DateFormatUtil, {
  longDateTimeFormat,
} from '../../utilities/DateFormatUtil';
import EmailDomainUtil from '../../utilities/EmailDomainUtil';
import Localizer from '../../utilities/Localizer';
import GenericModal from '../controls/GenericModal';
import AddEmailsFormGroup from '../controls/AddEmailsFormGroup';
import InputClearButton from '..//controls/InputClearButton';
import JSONutil from '../../utilities/JSONutil';
import ErrorUtil from '../../utilities/ErrorUtil';
import SignatureRequestStatus from './SignatureRequestStatus';
import HelpIconTooltip from '../controls/HelpIconTooltip';

export enum TAB_GROUP_TYPE {
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum ALERT_STYLE_TYPE {
  SUCCESS = 'success',
  DANGER = 'danger',
  WARNING = 'warning',
}

interface IRequestSignaturesModalProps {
  onClosed: () => void;
  onSignaturesRequested: () => void;
  show: boolean;
  document: IDocument;
  showRequestForm?: boolean;
  userTimezone: string;
}

interface IRequestSignaturesModalState {
  loading: LoadStates;
  signByDate: any;
  signByDateTouched: boolean;
  signerEmails: string;
  signerEmailsTouched: boolean;
  signerEmailsValidationError: boolean;
  noteToSigners: string;
  showAlert: boolean;
  alertStyle: ALERT_STYLE_TYPE;
  alertMsg: string;
  showRequestForm: boolean;
}

class RequestSignaturesModal extends SrUiComponent<
  IRequestSignaturesModalProps,
  IRequestSignaturesModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      signByDate: null,
      signByDateTouched: false,
      signerEmails: '',
      signerEmailsTouched: false,
      signerEmailsValidationError: false,
      noteToSigners: '',
      showAlert: false,
      alertStyle: null,
      alertMsg: '',
      showRequestForm: this.props.showRequestForm || false,
    };
  }

  handleClose() {
    this.props.onClosed();
  }

  validateSignerEmailsState(): 'error' | null {
    const { signerEmails, signerEmailsTouched } = this.state;
    if (signerEmailsTouched && signerEmails.length === 0) {
      return 'error';
    }
    return null;
  }

  handleSignerEmailsChange(e) {
    this.setPartial({
      signerEmails: e.target.value,
      signerEmailsTouched: true,
    });

    this.throttledValidateSignerEmails();
  }

  validateSignerEmails() {
    const { signerEmails } = this.state;
    const validEmails = EmailDomainUtil.isEmailStrings(signerEmails);

    this.setPartial({
      signerEmailsValidationError: !validEmails,
    });
  }

  private throttledValidateSignerEmails = throttle(
    () => {
      this.validateSignerEmails();
    },
    750,
    { leading: false }
  );

  calcConfirmButtonDisable = () => {
    const {
      signerEmails,
      signerEmailsTouched,
      signerEmailsValidationError,
      loading,
    } = this.state;

    const enableConfirmBtn =
      signerEmails.length > 0 &&
      signerEmailsTouched &&
      !signerEmailsValidationError &&
      loading !== LoadStates.Loading;
    return !enableConfirmBtn;
  };

  handleNoteToSignersChange(e) {
    e.preventDefault();
    this.setPartial({ noteToSigners: e.target.value });
  }

  validationStateSignByDate(): 'error' | null {
    const { signByDate } = this.state;
    const isValid = this.signByDateFormGroupIsValid();
    if (isValid === undefined || signByDate === null) {
      return null;
    }
    if (!isValid) {
      return 'error';
    }
    return null;
  }

  signByDateFormGroupIsValid = () => {
    const { signByDate } = this.state;
    return moment(signByDate).isAfter(moment());
  };

  handleSignByDateChange(d: Moment | string) {
    if (d === '') {
      this.setPartial({ signByDate: null, signByDateTouched: false });
      return;
    }

    this.setPartial({
      signByDate: moment(d),
      signByDateTouched: true,
    });
  }

  isValidDateSignByDate = (d) => {
    return moment(d).isAfter(moment());
  };

  async handleOnConfirmClicked() {
    const { document, onSignaturesRequested, onClosed } = this.props;
    const { noteToSigners, signByDate, signerEmails } = this.state;

    const payload = {
      UserFileId: document.id,
      SignatureNote: noteToSigners ? noteToSigners : null,
      SignatureDueDate: signByDate ? DateFormatUtil.unix(signByDate) : null,
      Email: signerEmails,
    };

    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });
      const resp = await ApiHelpers.create(
        `userfiles/${document.id}/signature`,
        payload
      );

      if (!resp.good || !JSONutil.isValid(resp.data) || !isEmpty(resp.errors)) {
        throw ErrorUtil.getError(resp.errors);
      }

      this.setPartial({
        loading: LoadStates.Succeeded,
      });

      onSignaturesRequested();
      onClosed();
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
        showAlert: true,
        alertStyle: err.getAlertStyleType({ showWarningAsSuccess: true }),
        alertMsg: err.getErrorMessage(),
      });
      console.error(err);
    }
  }

  performRender() {
    const {
      loading,
      signByDate,
      signerEmails,
      signerEmailsValidationError,
      showAlert,
      alertStyle,
      alertMsg,
      showRequestForm,
    } = this.state;
    const { show, document, userTimezone } = this.props;

    return (
      <GenericModal
        show={show}
        modalTitle={
          showRequestForm
            ? Localizer.get('Request Signatures')
            : Localizer.get('Signatures Requested')
        }
        onCloseClicked={() => this.handleClose()}
        hasCloseButton={true}
        closeButtonType={showRequestForm ? 'cancel' : 'close'}
        hasConfirmButton={true}
        onConfirmClicked={
          showRequestForm
            ? () => this.handleOnConfirmClicked()
            : () => this.setPartial({ showRequestForm: true })
        }
        confirmButtonText={
          showRequestForm
            ? Localizer.get('Send Request')
            : Localizer.get('Request Signatures')
        }
        confirmButtonType={showRequestForm ? 'send' : 'edit'}
        confirmButtonStyle={showRequestForm ? 'success' : 'info'}
        confirmButtonDisable={
          showRequestForm ? this.calcConfirmButtonDisable() : false
        }
        closeButtonDisable={loading === LoadStates.Loading}
        bodyClassName="request-signatures-modal"
      >
        <>
          {document.totalSignatureRequestCount > 0 && (
            <SignatureRequestStatus
              selectedDocument={document}
              userTimezone={userTimezone}
            />
          )}
          {showRequestForm && (
            <form noValidate>
              <FormGroup controlId="noteToSigners">
                <ControlLabel>
                  {Localizer.get('Optional note to signers:')}
                </ControlLabel>
                <FormControl
                  componentClass="textarea"
                  placeholder={Localizer.get('Note to signers...')}
                  onChange={(e) => this.handleNoteToSignersChange(e)}
                />
              </FormGroup>
              <FormGroup
                controlId="signByDate"
                validationState={this.validationStateSignByDate()}
                className="sign-by-date mb-0"
              >
                <ControlLabel>
                  <span>{Localizer.get(`Optional sign by date:`)}</span>
                  <HelpIconTooltip
                    tooltipText={'Dates are set to 12:00am GMT of date chosen.'}
                    className="py-o pl-1"
                  />
                  <span>
                    {!!signByDate
                      ? `${DateFormatUtil.getToGivenTimezone(
                          signByDate,
                          userTimezone,
                          longDateTimeFormat
                        )} (${DateFormatUtil.getGivenTimezoneAbbr(
                          userTimezone
                        )})`
                      : null}
                  </span>
                </ControlLabel>
                <Datetime
                  closeOnSelect={true}
                  inputProps={{
                    readOnly: true,
                    required: false,
                    placeholder: Localizer.get('Select date'),
                  }}
                  utc
                  input
                  value={signByDate}
                  dateFormat={true}
                  timeFormat={false}
                  displayTimeZone={userTimezone}
                  onChange={(d) => this.handleSignByDateChange(d)}
                  isValidDate={this.isValidDateSignByDate}
                />
                {!isNull(signByDate) && (
                  <InputClearButton
                    className="input-clear-button"
                    handleClick={() => this.handleSignByDateChange('')}
                  />
                )}
              </FormGroup>
              <AddEmailsFormGroup
                controlId="formSignerEmails"
                validator={this.validateSignerEmailsState()}
                label={Localizer.get('Add signers by email:')}
                emails={signerEmails}
                hideAddBtn={true}
                disabled={this.state.loading === LoadStates.Loading}
                onChange={(e) => this.handleSignerEmailsChange(e)}
                validationError={signerEmailsValidationError}
                errorMessage={Localizer.get(
                  'Please enter comma-separated email addresses of signers (i.e. signer1@email.com, signer2@email.com).'
                )}
                groupType={TAB_GROUP_TYPE.INDIVIDUAL}
              />
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
          )}
        </>
      </GenericModal>
    );
  }
}

export default RequestSignaturesModal;
