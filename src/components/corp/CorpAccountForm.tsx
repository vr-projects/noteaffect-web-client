import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { FaPlus, FaPen, FaTimes } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  Animated,
} from 'react-strontium';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Image as ImageComponent,
  Alert,
  Button,
} from 'react-bootstrap';
import AppMappers from '../../mappers/AppMappers';
import IClientData from '../../interfaces/IClientData';
import Localizer from '../../utilities/Localizer';
import EmailDomainUtil from '../../utilities/EmailDomainUtil';
import CorpLogoImageUtil from '../../utilities/CorpLogoImageUtil';
import HelpIconTooltip from '../controls/HelpIconTooltip';
import * as AppActions from '../../store/app/AppActions';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface ICorpAccountFormProps {}

interface IConnectedCorpAccountFormProps extends DispatchProp<any> {
  clientData?: IClientData;
}
interface ICorpAccountFormState {
  isEditing: boolean;
  isSaving: boolean;
  clientData: IClientData | null;
  organization: string;
  logoUrl: any | null;
  emailDomains: string[] | any;
  file: any | null;
  fileName: string | null;
  fileSize: number | null;
  fileWarning: boolean;
  fileWarningMessage: string | null;
  removeLogo: boolean;
  newEmailDomain: string;
  disableAddEmailBtn: boolean;
  loading: LoadStates | null;
  errorMessage: string;
}

class CorpAccountForm extends SrUiComponent<
  ICorpAccountFormProps & IConnectedCorpAccountFormProps,
  ICorpAccountFormState
> {
  private fileRef = null;

  initialState() {
    return {
      isEditing: false,
      isSaving: false,
      clientData: null,
      organization: '',
      logoUrl: null,
      emailDomains: [],
      file: null,
      fileName: null,
      fileSize: null,
      fileWarning: false,
      fileWarningMessage: null,
      removeLogo: false,
      newEmailDomain: '',
      disableAddEmailBtn: true,
      loading: LoadStates.Unloaded,
      errorMessage: '',
    };
  }

  async loadApiData() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const resp = await ApiHelpers.read('client');

    if (resp.good) {
      const apiData = JSON.parse(resp.data);
      const { name: organization, logoUrl } = apiData;

      const emailDomains = apiData.clientDomains.map(
        (domainObject) => domainObject.host
      );

      this.setState({
        clientData: apiData,
        organization,
        logoUrl,
        emailDomains,
      });
    } else {
      this.setState({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get('There was an error getting your data.'),
      });
    }
  }

  getUpdatedClientData() {
    this.props.dispatch(AppActions.loadClientData());
  }

  onComponentMounted() {
    this.loadApiData();
  }

  // Form Methods
  toggleEditMode() {
    this.setPartial({
      isEditing: !this.state.isEditing,
      loading: null,
    });
  }

  handleOrganizationChange(e: any) {
    this.setPartial({ organization: e.target.value });
  }

  handleFileChange = () => {
    const self = this;
    const file = this.fileRef.files[0];
    const { name: fileName, size: fileSize } = file;
    let fileWarningMessage: string;
    const exceededMaxSize = CorpLogoImageUtil.exceededFileSizeKb(
      file.size,
      200
    );

    // File Size Check
    if (exceededMaxSize) {
      fileWarningMessage = Localizer.get(
        'File exceeded 200 KB. Choose another image to upload.'
      );

      return this.setPartial({
        fileWarning: true,
        file: null,
        logoUrl: null,
        fileWarningMessage,
        fileName,
        fileSize,
      });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    let img: any;
    let _URL = window.URL;
    let objectUrl: string;

    // reset view for checks
    this.setPartial({
      fileWarning: false,
      fileWarningMessage: null,
      fileName: null,
      fileSize: null,
    });

    reader.onload = function (e) {
      img = new Image();
      objectUrl = _URL.createObjectURL(file);

      img.onerror = function (err) {
        console.error(err);
        fileWarningMessage = Localizer.get(
          'There was an error with that image. Try again or another image.'
        );
        return self.setPartialAsync({
          logoUrl: null,
          file: null,
          fileWarningMessage,
          fileWarning: true,
          fileName,
          fileSize,
        });
      };

      img.onload = function () {
        const thisImg = this;
        // Aspect Ratio Check
        const allowedHeight = 50;
        const maxAllowedWidth = 425;
        const exceededAllowedAspectRatio = CorpLogoImageUtil.exceededAspectRatio(
          thisImg,
          allowedHeight,
          maxAllowedWidth
        );

        if (exceededAllowedAspectRatio) {
          fileWarningMessage =
            'Image exceeds maximum aspect ratio of 425x50 (8.5). Choose another image to upload.';

          return self.setPartialAsync({
            logoUrl: null,
            file: null,
            fileWarningMessage,
            fileWarning: true,
            fileName,
            fileSize,
          });
        }

        self.setPartialAsync({
          logoUrl: reader.result,
          file,
          fileWarningMessage: null,
          fileWarning: false,
          fileName,
          fileSize,
        });

        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    };
  };

  removeImage = () => {
    this.setPartial({
      logoUrl: null,
      file: null,
      fileName: null,
      fileSize: null,
      fileWarningMessage: null,
      fileWarning: false,
    });
  };

  // handle email trimming, email domain setting to state, add button enabling
  handleNewEmailDomainChange(e) {
    const enteredInputEmail = e.target.value.trim();
    const { emailDomains } = this.state;
    const isDup = emailDomains.some((item) => item === e.target.value);

    const isValidEmailDomain = EmailDomainUtil.isValid(enteredInputEmail);
    const isForbidden = EmailDomainUtil.isForbiddenEmailDomain(
      enteredInputEmail
    );
    const enableAddEmailBtn = !isDup && isValidEmailDomain && !isForbidden;

    this.setPartial({
      newEmailDomain: enteredInputEmail,
      disableAddEmailBtn: !enableAddEmailBtn,
    });
  }

  getEmailDomainValidationState(): null | 'error' {
    const { newEmailDomain } = this.state;
    const notAllowed = EmailDomainUtil.isForbiddenEmailDomain(newEmailDomain);

    if (notAllowed) {
      return 'error';
    }

    return null;
  }

  addEmailDomain() {
    const { newEmailDomain, emailDomains } = this.state;

    this.setPartial({
      emailDomains: emailDomains.concat(newEmailDomain),
      newEmailDomain: '',
      disableAddEmailBtn: true,
    });
  }

  removeEmailDomain(domainName) {
    const { emailDomains } = this.state;
    const filteredEmailDomains = emailDomains.filter(
      (domain) => domain !== domainName
    );

    this.setPartialAsync({
      emailDomains: filteredEmailDomains,
    });
  }

  calcDisableSaveBtn() {
    const { organization, emailDomains } = this.state;
    return organization === '' || emailDomains.length === 0;
  }

  cancelEdit() {
    const {
      clientData: { name: organization, clientDomains, logoUrl },
    } = this.state;
    const emailDomains = clientDomains.map((domainObject) => domainObject.host);

    this.setPartial({
      isEditing: false,
      file: null,
      fileName: null,
      fileSize: null,
      fileWarning: false,
      fileWarningMessage: '',
      organization,
      emailDomains,
      logoUrl,
      loading: LoadStates.Unloaded,
    });
  }

  async onFormSubmit(e) {
    e.preventDefault();
    const {
      organization,
      emailDomains,
      logoUrl,
      file,
      clientData: { name: originalOrganization, clientDomains, id: clientId },
    } = this.state;
    let promises = [];

    // Promise Call 1 = /api/client/${clientId}
    const updateOrganization = organization !== originalOrganization;
    const removeLogo = logoUrl === null;
    // Promise Calls 2 = /api/client/${clientId}/domain/${domainObject.id}
    const domainsToDelete = clientDomains.reduce((acc, clientDomainObject) => {
      let shouldDeleteDomain = !emailDomains.includes(clientDomainObject.host);
      if (shouldDeleteDomain) {
        acc.push(clientDomainObject);
      }
      return acc;
    }, []);
    // Promise Calls 3 = client/${clientId}/domain
    const domainsToAdd = emailDomains.reduce((acc, emailDomain) => {
      const isNew =
        clientDomains.find(
          (domainObject) => domainObject.host === emailDomain
        ) === undefined;

      if (isNew) {
        acc.push(emailDomain);
      }
      return acc;
    }, []);

    if (
      !updateOrganization &&
      !removeLogo &&
      domainsToDelete.length === 0 &&
      domainsToAdd.length === 0 &&
      file === null
    ) {
      return;
    }

    if (updateOrganization || removeLogo) {
      promises.push(
        ApiHelpers.update(`client/${clientId}`, {
          Name: updateOrganization ? organization : originalOrganization,
          RemoveLogo: removeLogo,
        })
      );
    }

    if (domainsToAdd.length > 0) {
      domainsToAdd.forEach((domain) => {
        promises.push(
          ApiHelpers.create(`client/${clientId}/domain`, {
            ClientId: clientId,
            Host: domain,
          })
        );
      });
    }

    if (domainsToDelete.length > 0) {
      domainsToDelete.forEach((domainObject) => {
        promises.push(
          ApiHelpers.delete(`client/${clientId}/domain/${domainObject.id}`)
        );
      });
    }

    if (file !== null) {
      const formData: any = new FormData();
      formData.append('LogoFile', file);

      promises.push(
        ApiHelpers.create(`client/${clientId}/logo`, formData, {
          contentType: false,
        })
      );
    }

    this.setPartialAsync({
      isEditing: false,
      isSaving: true,
      loading: LoadStates.Loading,
    });

    Promise.all(promises)
      .then((responses) => {
        const allGood = responses.every((res) => res.good);

        if (allGood) {
          this.setPartialAsync({
            isSaving: false,
            loading: LoadStates.Succeeded,
          });
          // Trigger /client API call to Redux
          this.getUpdatedClientData();
        } else {
          throw new Error('had response error');
        }
      })
      .catch((error) => {
        console.error(error);
        this.setPartialAsync({
          isSaving: false,
          loading: LoadStates.Failed,
          errorMessage: Localizer.get('There was an error saving your data.'),
        });
      });
  }

  performRender() {
    const {
      organization,
      isEditing,
      fileName,
      fileSize,
      fileWarning,
      fileWarningMessage,
      logoUrl,
      newEmailDomain,
      emailDomains,
      disableAddEmailBtn,
      isSaving,
      loading,
      errorMessage,
    } = this.state;
    return (
      <div className="corp-account-form">
        <h1 className="corp-account-form-title">
          <span>{Localizer.get('Account Management')}</span>

          {SystemRoleService.hasSomeRoles([
            SystemRoles.CLIENT_ADMIN,
            SystemRoles.ADMIN,
          ]) && (
            <Button
              id="edit-btn"
              className="btn btn-link btn-lg na-btn-reset-width"
              onClick={() => this.toggleEditMode()}
              disabled={isSaving || isEditing}
            >
              <FaPen />
              <span area-hidden="true" className="sr-only">
                {Localizer.get('toggle edit mode')}
              </span>
            </Button>
          )}
        </h1>

        <div className="corp-account-form-wrapper">
          <form
            noValidate
            className="corp-account-form-element"
            onSubmit={(e) => this.onFormSubmit(e)}
          >
            <div className="corp-account-form-group-1">
              {/* Client / Organization */}
              <FormGroup
                controlId="formControlOrganization"
                className="corp-account-form-group-organization"
              >
                <div className="corp-account-form-title">
                  <ControlLabel>{Localizer.get('Organization:')}</ControlLabel>
                </div>
                <div className="form-set">
                  {isEditing ? (
                    <FormControl
                      type="text"
                      value={organization}
                      placeholder={organization}
                      disabled={!isEditing}
                      onChange={(e) => this.handleOrganizationChange(e)}
                    />
                  ) : (
                    <div className="btn na-display-form-control">
                      {organization}
                    </div>
                  )}
                </div>
              </FormGroup>

              {/* Email Domains */}
              <div className="corp-account-form-group-email">
                <FormGroup
                  className=""
                  controlId="formEmailDomains"
                  validationState={this.getEmailDomainValidationState()}
                >
                  <div className="corp-account-form-title">
                    <ControlLabel>
                      {Localizer.get('Designated Company Email Domains:')}
                    </ControlLabel>
                    <HelpIconTooltip
                      tooltipText={Localizer.get(
                        'Enter an email domain or domains for users.'
                      )}
                    />
                  </div>

                  <div className="list-adder">
                    <div className={`form-set list-adder-input`}>
                      <InputGroup>
                        <InputGroup.Addon>@</InputGroup.Addon>
                        <FormControl
                          type="text"
                          className="list-adder-input"
                          value={newEmailDomain}
                          placeholder={Localizer.get(
                            'Enter email domain (yourcompany.com)'
                          )}
                          disabled={!isEditing}
                          onChange={(e) => this.handleNewEmailDomainChange(e)}
                        />
                        <FormControl.Feedback />
                      </InputGroup>

                      {isEditing && (
                        <button
                          className={`btn btn-success na-btn-reset-width`}
                          onClick={() => this.addEmailDomain()}
                          disabled={disableAddEmailBtn || !isEditing}
                        >
                          <FaPlus />
                          <span className="sr-only">Add new email domain</span>
                        </button>
                      )}
                    </div>

                    {this.getEmailDomainValidationState() === 'error' && (
                      <Animated in>
                        <Alert bsStyle="danger">
                          <p>
                            {Localizer.get(
                              'The following email domains are not allowed: gmail, yahoo, hotmail, outlook, comcast, aol, icloud, yandex, live, sina, qq.'
                            )}
                          </p>
                        </Alert>
                      </Animated>
                    )}
                  </div>
                </FormGroup>

                {emailDomains.length > 0 && (
                  <ListGroup className="list-adder-items">
                    {emailDomains.map((domain, idx) => (
                      <ListGroupItem
                        className="form-set list-adder-item"
                        key={`added-email-domain-${idx}`}
                      >
                        <div className="na-display-form-control">
                          <span>
                            <strong>@</strong>
                            &nbsp;{domain}
                          </span>
                          {isEditing && (
                            <Button
                              bsStyle="danger"
                              className={`na-btn-reset-width h-100`}
                              onClick={() => this.removeEmailDomain(domain)}
                            >
                              <FaTimes />
                            </Button>
                          )}
                        </div>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                )}
              </div>
            </div>

            {/* Logo Image  */}
            <div className="corp-account-form-group-2">
              <FormGroup className="corp-account-form-group-logo">
                <div className="form-set-wrap justify-content-between">
                  <ControlLabel htmlFor="file-upload">
                    {Localizer.get('Organization Logo:')}
                  </ControlLabel>

                  <label
                    className={`btn btn-default logo-file-upload ${
                      !isEditing ? 'na-invisible' : 'na-opaque'
                    }`}
                    htmlFor="file-upload"
                  >
                    {Localizer.get('Choose Image')}
                    <FormControl
                      id="file-upload"
                      inputRef={(ref) => {
                        this.fileRef = ref;
                      }}
                      disabled={!isEditing}
                      type="file"
                      required
                      multiple={false}
                      accept=".png,.jpg,.jpeg"
                      placeholder="Upload Company Logo"
                      onChange={this.handleFileChange}
                    />
                  </label>
                </div>
                <FormControl.Feedback />
                {/* Logo display area */}
                <div className="image-container">
                  {logoUrl === null && (
                    <div className="image-placeholder">
                      <span>{Localizer.get('Choose optional logo image')}</span>
                    </div>
                  )}
                  {fileWarning && (
                    <Animated in>
                      <div className="image-file-warning">
                        <span>{fileWarningMessage}</span>
                      </div>
                    </Animated>
                  )}
                  {logoUrl !== null && (
                    <Animated in>
                      <ImageComponent
                        responsive
                        src={logoUrl}
                        thumbnail
                        className="image-logo"
                      />
                    </Animated>
                  )}
                  {logoUrl && isEditing && (
                    <Button
                      bsStyle="danger"
                      className="remove-image-btn na-btn-reset-width"
                      onClick={this.removeImage}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>

                {fileName !== null && fileSize !== null && (
                  <div className="image-metadata">
                    <span>
                      <strong>{Localizer.get('File Name:')}</strong>{' '}
                      {fileName !== null ? fileName : '--'}
                    </span>
                    <br />
                    <span
                      className={`${
                        CorpLogoImageUtil.exceededFileSizeKb(fileSize, 200)
                          ? 'text-danger'
                          : ''
                      }`}
                    >
                      <strong>{Localizer.get('File Size:')}</strong>{' '}
                      {fileSize !== null
                        ? `${Math.round(fileSize / 1024)} KB`
                        : '--'}
                    </span>
                  </div>
                )}
              </FormGroup>
            </div>

            {/* Form Actions */}
            <div className="corp-account-form-group-3 form-actions">
              {SystemRoleService.hasSomeRoles([
                SystemRoles.CLIENT_ADMIN,
                SystemRoles.ADMIN,
              ]) &&
                !isEditing &&
                !isSaving && (
                  <Button
                    bsStyle="default"
                    onClick={() => this.toggleEditMode()}
                  >
                    {Localizer.get('Edit')}
                  </Button>
                )}
              {isEditing && !isSaving && (
                <>
                  <Button
                    bsStyle="default"
                    disabled={!isEditing}
                    onClick={() => this.cancelEdit()}
                  >
                    {Localizer.get('Cancel')}
                  </Button>
                  <Button
                    bsStyle="info"
                    className="save-btn"
                    disabled={this.calcDisableSaveBtn()}
                    type="submit"
                  >
                    {Localizer.get('Save')}
                  </Button>
                </>
              )}
            </div>
          </form>

          <div className="corp-account-form-group-4">
            {loading === LoadStates.Succeeded && (
              <Animated in>
                <Alert bsStyle="success">
                  {Localizer.get('Successfully saved your data.')}
                </Alert>
              </Animated>
            )}
            {loading === LoadStates.Failed && (
              <Animated in>
                <Alert bsStyle="danger">{errorMessage}</Alert>
              </Animated>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// export default CorpAccountForm;
export default connect<
  IConnectedCorpAccountFormProps,
  {},
  ICorpAccountFormProps
>(AppMappers.ClientDataMapper)(CorpAccountForm);
