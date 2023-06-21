import React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import {
  Alert,
  Checkbox,
  Dropdown,
  FormControl,
  MenuItem,
  Table,
} from 'react-bootstrap';
import { FaAngleDown } from 'react-icons/fa';
import {
  SrUiComponent,
  Animated,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';
import Localizer from '../../utilities/Localizer';
import SearchFilterInput from '../controls/SearchFilterInput';
import DateFormatUtil, {
  longDateFormat,
  longDateTimeFormat,
} from '../../utilities/DateFormatUtil';
import GenericModal from '../controls/GenericModal';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import AppMappers from '../../mappers/AppMappers';
import PdfViewer from './PdfViewer';
import DocumentsTableContainer from './DocumentsTableContainer';
import ISignatureRequest from '../../models/ISignatureRequest';
import JSONutil from '../../utilities/JSONutil';
import ErrorUtil from '../../utilities/ErrorUtil';

interface IConnectedSignatureRequestsProps {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface ISignatureRequestsProps {}

interface ISignatureRequestsState {
  loading: LoadStates;
  documents: ISignatureRequest[];
  searchFilterInputValue: string;
  showFileAlert: boolean;
  fileAlertMessage: string | null;
  wasFileActionSuccessful: boolean | null;
  selectedSignatureRequest: ISignatureRequest;
  isPreviewDocumentModalOpen: boolean;
  userSignature: string;
  userAcknowledgement: boolean;
  showSignatureForm: boolean;
}

class SignatureRequests extends SrUiComponent<
  IConnectedSignatureRequestsProps & ISignatureRequestsProps,
  ISignatureRequestsState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      documents: [],
      searchFilterInputValue: '',
      showFileAlert: false,
      fileAlertMessage: null,
      wasFileActionSuccessful: null,
      selectedSignatureRequest: null,
      isPreviewDocumentModalOpen: false,
      userSignature: '',
      userAcknowledgement: false,
      showSignatureForm: false,
    };
  }

  async getSignatureRequests() {
    const { loading, selectedSignatureRequest } = this.state;
    if (loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({
      loading: LoadStates.Loading,
    });

    try {
      const resp = await ApiHelpers.read(`userfiles/signature`);

      ErrorUtil.handleAPIErrors(resp, 'Error getting signature requests.');

      if (!isEmpty(selectedSignatureRequest)) {
        this.setPartial({
          selectedSignatureRequest: JSON.parse(resp.data).filter(
            (document) => document.id === selectedSignatureRequest.id
          )[0],
        });
      }

      this.setPartial({
        loading: LoadStates.Succeeded,
        documents: JSON.parse(resp.data),
      });
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
      console.error(err);
    }
  }

  onComponentMounted() {
    this.getSignatureRequests();
  }

  handleSearchInputFilter(searchFilterInputValue) {
    this.setPartial({ searchFilterInputValue: searchFilterInputValue });
  }

  handleClearedInput() {
    this.setPartial({
      searchFilterInputValue: '',
    });
  }

  handleDocumentPreview(
    e: any,
    document: ISignatureRequest,
    showForm?: boolean
  ): void {
    e.preventDefault();
    this.setPartial({
      isPreviewDocumentModalOpen: true,
      selectedSignatureRequest: document,
      showSignatureForm: showForm ? showForm : false,
    });
  }

  getPendingSignatureRequests() {
    const { documents, searchFilterInputValue } = this.state;
    const pendingDocs = documents.filter((doc) => isNull(doc.dateSigned));

    // TODO -- remove if past today
    return pendingDocs
      .filter((document) => {
        // return all results when no text in search input
        if (searchFilterInputValue.length === 0) return true;
        return document.userFileName
          .toLowerCase()
          .includes(searchFilterInputValue);
      })
      .sort((a: any, b: any) => {
        return a.userFileName.localeCompare(b.userFileName);
      });
  }

  getSignedSignatureRequests() {
    const { documents, searchFilterInputValue } = this.state;
    const signedDocs = documents.filter((doc) => !isNull(doc.dateSigned));

    return signedDocs
      .filter((document) => {
        // return all results when no text in search input
        if (searchFilterInputValue.length === 0) return true;
        return document.userFileName
          .toLowerCase()
          .includes(searchFilterInputValue);
      })
      .sort((a: any, b: any) => {
        return a.userFileName.localeCompare(b.userFileName);
      });
  }

  getHandles() {
    return [AppBroadcastEvents.DocumentSigned];
  }

  onAppMessage(msg: SrAppMessage) {
    switch (msg.action) {
      case AppBroadcastEvents.DocumentSigned:
        return this.getSignatureRequests();
      default:
        return;
    }
  }

  handleShowAlert(status, fileAlertMessage) {
    if (status === LoadStates.Succeeded) {
      this.setPartial({
        showFileAlert: true,
        fileAlertMessage,
        wasFileActionSuccessful: true,
      });
    }
    if (status === LoadStates.Failed) {
      this.setPartial({
        showFileAlert: true,
        fileAlertMessage,
        wasFileActionSuccessful: false,
      });
    }
    setTimeout(() => {
      this.handleAlertDismiss();
    }, 3000);
  }

  handleAlertDismiss() {
    this.setPartial({
      showFileAlert: false,
      fileAlertMessage: null,
      wasFileActionSuccessful: null,
    });
  }

  handleCloseClicked(): void {
    this.setPartial({
      selectedSignatureRequest: null,
      isPreviewDocumentModalOpen: false,
      userSignature: '',
      userAcknowledgement: false,
      showSignatureForm: false,
    });
  }

  handleUserSignatureChange(e) {
    this.setPartial({ userSignature: e.target.value });
  }

  handleUserAcknowledgementChange() {
    this.setPartial({ userAcknowledgement: !this.state.userAcknowledgement });
  }

  async handleSignSignatureRequest() {
    const { selectedSignatureRequest, userSignature } = this.state;
    const payload = {
      NameSigned: userSignature,
      DateSigned: DateFormatUtil.unix(),
    };
    if (isNull(selectedSignatureRequest)) return;

    try {
      this.setPartial({ loading: LoadStates.Loading });

      const resp = await ApiHelpers.update(
        `userfiles/${selectedSignatureRequest.userFileId}/signature`,
        payload
      );
      if (!resp.good || !JSONutil.isValid(resp.data) || !isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      }
      this.setPartial({ loading: LoadStates.Succeeded });
      this.getSignatureRequests();
      this.handleCloseClicked();
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
        showFileAlert: true,
        wasFileActionSuccessful: false,
        fileAlertMessage: err.message,
      });
      console.error(err);
    }
  }

  performRender() {
    const { userInformation } = this.props;
    const {
      documents,
      showFileAlert,
      fileAlertMessage,
      wasFileActionSuccessful,
      isPreviewDocumentModalOpen,
      selectedSignatureRequest,
      userSignature,
      userAcknowledgement,
      showSignatureForm,
    } = this.state;
    const pendingSignatureRequests = this.getPendingSignatureRequests();
    const signedSignatureRequests = this.getSignedSignatureRequests();
    const userFirstName = userInformation.toJS().firstName;
    const userLastName = userInformation.toJS().lastName;
    const userTimezone = userInformation.toJS().timezone;
    const currentUserId = userInformation.toJS().id;

    return (
      <div className="signature-requests flex-grow-column-container">
        <Animated in>
          <>
            {isEmpty(documents) && (
              <Alert bsStyle="info" className="mt-2">
                {Localizer.get('No documents to sign.')}
              </Alert>
            )}

            {!isEmpty(documents) && (
              <div className="instructor-courses-component is-corp">
                <div className="instructor-courses-content">
                  <div className="header-controls">
                    <h1>{Localizer.get('Signature Requests')}</h1>
                    {/* Controls */}
                    <div className={`instructor-courses-controls`}>
                      {/* Search - name */}
                      <SearchFilterInput
                        className="instructor-courses-controls--search flex-grow mr-2"
                        placeholder={Localizer.get('Search by document name')}
                        updateCurrentVal={(val) =>
                          this.handleSearchInputFilter(val)
                        }
                        clearedInput={() => this.handleClearedInput()}
                      />
                    </div>
                    {showFileAlert && (
                      <Animated in>
                        <Alert
                          bsStyle={`${
                            wasFileActionSuccessful ? 'success' : 'danger'
                          }`}
                          onDismiss={() => this.handleAlertDismiss()}
                          className="mt-3"
                          style={{ marginBottom: '-8px' }}
                        >
                          {fileAlertMessage}
                        </Alert>
                      </Animated>
                    )}

                    {!isEmpty(pendingSignatureRequests) && (
                      <>
                        <h2>{Localizer.get('Awaiting My Signature')}</h2>
                        <DocumentsTableContainer className="documents-list">
                          <Table>
                            <thead>
                              <tr>
                                <th>{Localizer.get('Name')}</th>
                                <th>{Localizer.get('Requestor')}</th>
                                <th>{Localizer.get('Request Date')}</th>
                                <th>{Localizer.get('Sign By Date')}</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingSignatureRequests.map(
                                (document, index) => (
                                  <tr key={index}>
                                    <td className="document-name">
                                      <a
                                        href=" "
                                        onClick={(e) =>
                                          this.handleDocumentPreview(
                                            e,
                                            document,
                                            true
                                          )
                                        }
                                      >
                                        {document.userFileName}
                                      </a>
                                    </td>
                                    <td>{document.requestorUsername}</td>
                                    <td>
                                      {document.requestDate
                                        ? DateFormatUtil.getUnixToGivenTimezone(
                                            document.requestDate,
                                            userTimezone,
                                            longDateFormat
                                          )
                                        : '– –'}
                                    </td>
                                    <td>
                                      {document.signatureDue
                                        ? `${DateFormatUtil.getUnixToGivenTimezone(
                                            document.signatureDue,
                                            userTimezone,
                                            longDateTimeFormat
                                          )} (${DateFormatUtil.getGivenTimezoneAbbr(
                                            userTimezone
                                          )})`
                                        : '– –'}
                                    </td>
                                    <td className="context-menu-container">
                                      <Dropdown
                                        id={`context-menu-${index}`}
                                        pullRight
                                        className="data-group context-menu"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) =>
                                          AccessibilityUtil.handleEnterKey(
                                            e,
                                            () => e.stopPropagation()
                                          )
                                        }
                                      >
                                        <Dropdown.Toggle
                                          className="data-context-menu"
                                          noCaret
                                        >
                                          <FaAngleDown className="icon" />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                          <MenuItem
                                            eventKey="1"
                                            onClick={(e) =>
                                              this.handleDocumentPreview(
                                                e,
                                                document,
                                                true
                                              )
                                            }
                                            onKeyDown={(e) =>
                                              AccessibilityUtil.handleEnterKey(
                                                e,
                                                (e) =>
                                                  this.handleDocumentPreview(
                                                    e,
                                                    document,
                                                    true
                                                  )
                                              )
                                            }
                                          >
                                            {Localizer.get('Sign')}
                                          </MenuItem>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </Table>
                        </DocumentsTableContainer>
                      </>
                    )}

                    {!isEmpty(signedSignatureRequests) && (
                      <>
                        <h2>{Localizer.get(`My Signed Documents`)}</h2>
                        <DocumentsTableContainer className="documents-list">
                          <Table>
                            <thead>
                              <tr>
                                <th>{Localizer.get('Name')}</th>
                                <th>{Localizer.get('Requestor')}</th>
                                <th>{Localizer.get('Request Date')}</th>
                                <th>{Localizer.get('Signed Date')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {signedSignatureRequests.map(
                                (document, index) => (
                                  <tr key={index}>
                                    <td className="document-name">
                                      <a
                                        href=" "
                                        onClick={(e) =>
                                          this.handleDocumentPreview(
                                            e,
                                            document
                                          )
                                        }
                                      >
                                        {document.userFileName}
                                      </a>
                                    </td>
                                    <td>{document.requestorUsername}</td>
                                    <td>
                                      {document.requestDate
                                        ? DateFormatUtil.getUnixToGivenTimezone(
                                            document.requestDate,
                                            userTimezone,
                                            longDateFormat
                                          )
                                        : '– –'}
                                    </td>
                                    <td>
                                      {document.dateSigned
                                        ? DateFormatUtil.getUnixToGivenTimezone(
                                            document.dateSigned,
                                            userTimezone,
                                            longDateFormat
                                          )
                                        : '– –'}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </Table>
                        </DocumentsTableContainer>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        </Animated>
        {!isNull(selectedSignatureRequest) && isPreviewDocumentModalOpen && (
          <GenericModal
            size={'large'}
            bodyClassName="document-preview"
            backdropClassName={`signature-requests-backdrop`}
            modalTitle={
              showSignatureForm
                ? Localizer.get('Request for Signature')
                : Localizer.get('Document Preview')
            }
            show={isPreviewDocumentModalOpen}
            fileDownloadUrl={
              showSignatureForm ? null : selectedSignatureRequest.userFileUrl
            }
            fileDownloadName={
              showSignatureForm ? null : selectedSignatureRequest.userFileName
            }
            hasConfirmButton
            confirmButtonStyle={showSignatureForm ? 'success' : 'info'}
            confirmButtonDisable={
              showSignatureForm
                ? !userAcknowledgement ||
                  userSignature !== `${userFirstName} ${userLastName}`
                : false
            }
            confirmButtonType={showSignatureForm ? 'edit' : 'download'}
            confirmButtonText={
              showSignatureForm
                ? Localizer.get('Sign')
                : Localizer.get('Download PDF')
            }
            onConfirmClicked={() => this.handleSignSignatureRequest()}
            onCloseClicked={() => this.handleCloseClicked()}
            closeButtonType={showSignatureForm ? 'cancel' : 'close'}
          >
            <div className="pdf-main">
              <div className="meta-data">
                <div className="document-name">
                  <span className="label">
                    {Localizer.get('Document Name')}
                  </span>
                  <span className="value">
                    {selectedSignatureRequest.userFileName}
                  </span>
                </div>
                <div className="requestor-name">
                  <span className="label">{Localizer.get('Requested By')}</span>
                  <span className="value">
                    {selectedSignatureRequest.requestorUsername}
                  </span>
                </div>
                <div className="document-created">
                  <span className="label">{Localizer.get('Requested On')}</span>
                  <span className="value">
                    {selectedSignatureRequest.requestDate
                      ? DateFormatUtil.getUnixToGivenTimezone(
                          selectedSignatureRequest.requestDate,
                          userTimezone,
                          longDateFormat
                        )
                      : '– –'}
                  </span>
                </div>
              </div>

              <div className="pdf-viewer-container">
                <PdfViewer
                  isSignatureRequest
                  currentUserId={currentUserId}
                  selectedSignatureRequest={selectedSignatureRequest}
                  needsSecurityCheck={false}
                />
              </div>

              {showSignatureForm && (
                <div className="signer-controls">
                  <Checkbox
                    checked={userAcknowledgement}
                    onChange={() => this.handleUserAcknowledgementChange()}
                  >
                    {Localizer.get(
                      'I hereby acknowledge receipt and acceptance of the document displayed above.'
                    )}
                  </Checkbox>
                  <div className="d-flex">
                    <span className="align-self-center mr-1">
                      {Localizer.get('SIGNED')}:
                    </span>
                    <FormControl
                      type="text"
                      value={userSignature}
                      placeholder={`${Localizer.get(
                        'Sign'
                      )} "${userFirstName} ${userLastName}" ${Localizer.get(
                        'here.'
                      )}`}
                      onChange={(e) => this.handleUserSignatureChange(e)}
                      disabled={userAcknowledgement === false}
                    />
                  </div>
                </div>
              )}
            </div>
          </GenericModal>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedSignatureRequestsProps,
  {},
  ISignatureRequestsProps
>(AppMappers.AppMapper)(SignatureRequests);
