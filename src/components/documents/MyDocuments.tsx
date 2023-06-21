import React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import { Alert, Dropdown, MenuItem, Table } from 'react-bootstrap';
import { FaAngleDown } from 'react-icons/fa';
import {
  SrUiComponent,
  Animated,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
  LoadMask,
  LoadIndicator,
} from 'react-strontium';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';
import Localizer from '../../utilities/Localizer';
import IDocument from '../../models/IDocument';
import MyDocumentsZero from './MyDocumentsZero';
import SearchFilterInput from '../controls/SearchFilterInput';
import DateFormatUtil, { longDateFormat } from '../../utilities/DateFormatUtil';
import AddDocumentButton from './AddDocumentButton';
import GenericModal from '../controls/GenericModal';
import AssociateDocumentToMeetingModal from './AssociateDocumentToMeetingModal';
import RequestSignaturesModal from './RequestSignaturesModal';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import AppMappers from '../../mappers/AppMappers';
import PdfViewer from './PdfViewer';
import DocumentsTableContainer from './DocumentsTableContainer';
import SystemRoles from '../../enums/SystemRoles';
import SystemRoleService from '../../services/SystemRoleService';

interface IConnectedMyDocumentsProps {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface IMyDocumentsProps {}

interface IMyDocumentsState {
  loading: LoadStates;
  documents: IDocument[];
  searchFilterInputValue: string;
  showFileAlert: boolean;
  fileAlertMessage: string | null;
  wasFileActionSuccessful: boolean | null;
  selectedDocument: IDocument;
  isDeleteDocumentModalOpen: boolean;
  isPreviewDocumentModalOpen: boolean;
  isAssociateDocumentModalOpen: boolean;
  isRequestSignaturesModalOpen: boolean;
  associateDocumentModalSelectedTab: boolean;
  requestSignaturesShowForm: boolean;
}

class MyDocuments extends SrUiComponent<
  IConnectedMyDocumentsProps & IMyDocumentsProps,
  IMyDocumentsState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      documents: [],
      searchFilterInputValue: '',
      showFileAlert: false,
      fileAlertMessage: null,
      wasFileActionSuccessful: null,
      selectedDocument: null,
      isDeleteDocumentModalOpen: false,
      isPreviewDocumentModalOpen: false,
      isAssociateDocumentModalOpen: false,
      isRequestSignaturesModalOpen: false,
      associateDocumentModalSelectedTab: false,
      requestSignaturesShowForm: false,
    };
  }

  async getMyDocuments() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }
    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });

      const resp = await ApiHelpers.read(`userfiles`);

      if (!resp.good) {
        throw new Error('Error getting documents.');
      }
      if (!isEmpty(this.state.selectedDocument)) {
        this.setPartial({
          selectedDocument: JSON.parse(resp.data).filter(
            (document) => document.id === this.state.selectedDocument.id
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
    this.getMyDocuments();
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
    e: React.MouseEvent<HTMLAnchorElement>,
    document: IDocument
  ): void {
    e.preventDefault();
    this.setPartial({
      isPreviewDocumentModalOpen: true,
      selectedDocument: document,
    });
  }

  getFilteredDocuments() {
    const { documents, searchFilterInputValue } = this.state;

    return documents
      .filter((document) => {
        // return all results when no text in search input
        if (searchFilterInputValue.length === 0) return true;
        return document.fileName.toLowerCase().includes(searchFilterInputValue);
      })
      .sort((a: any, b: any) => {
        return a.fileName.localeCompare(b.fileName);
      });
  }

  getHandles() {
    return [AppBroadcastEvents.DocumentAdded];
  }

  onAppMessage(msg: SrAppMessage) {
    switch (msg.action) {
      case AppBroadcastEvents.DocumentAdded:
        return this.getMyDocuments();
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

  onDeleteBtnClick(e, doc: IDocument) {
    e.stopPropagation();
    this.setPartial({
      selectedDocument: doc,
      isDeleteDocumentModalOpen: true,
    });
  }

  async handleDeleteDocument(id) {
    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });

      const resp = await ApiHelpers.delete(`userfiles/${id}`);
      if (!resp.good) {
        throw new Error('Error deleting document.');
      }

      this.setPartial({
        loading: LoadStates.Succeeded,
        selectedDocument: null,
        isDeleteDocumentModalOpen: false,
      });

      this.getMyDocuments();
      this.handleShowAlert(
        LoadStates.Succeeded,
        Localizer.get('Document removed!')
      );
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
      console.error(err);
    }
  }

  handleAssociateDocument(
    e: React.MouseEvent<{}>,
    document: IDocument,
    selectedTab?: boolean
  ): void {
    e.preventDefault();
    this.setPartial({
      selectedDocument: document,
      isAssociateDocumentModalOpen: true,
      associateDocumentModalSelectedTab: selectedTab ? true : false,
    });
  }

  handleCloseClicked(): void {
    this.setPartial({
      selectedDocument: null,
      isPreviewDocumentModalOpen: false,
    });
  }

  performRender() {
    const { userInformation } = this.props;
    const {
      documents,
      showFileAlert,
      fileAlertMessage,
      wasFileActionSuccessful,
      isDeleteDocumentModalOpen,
      isPreviewDocumentModalOpen,
      isAssociateDocumentModalOpen,
      isRequestSignaturesModalOpen,
      requestSignaturesShowForm,
      associateDocumentModalSelectedTab,
      selectedDocument,
      loading,
    } = this.state;
    const userTimezone = userInformation.toJS().timezone;
    const currentUserId = userInformation.toJS().id;
    const filteredDocuments = this.getFilteredDocuments() || [];

    return (
      <div className="documents my-documents flex-grow-column-container">
        <Animated in>
          <>
            {isEmpty(documents) && loading !== LoadStates.Loading && (
              <MyDocumentsZero
                handleShowAlert={(status, fileAlertMessage) =>
                  this.handleShowAlert(status, fileAlertMessage)
                }
                showFileAlert={showFileAlert}
                fileActionSuccess={wasFileActionSuccessful}
                handleDismiss={() => this.handleAlertDismiss()}
                fileAlertMessage={fileAlertMessage}
              />
            )}
            {documents.length >= 1 && (
              <div className="instructor-courses-component is-corp">
                <div className="instructor-courses-content">
                  <div className="header-controls">
                    <h1>{Localizer.get('My Documents')}</h1>
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
                      <AddDocumentButton
                        handleShowAlert={(status, fileAlertMessage) =>
                          this.handleShowAlert(status, fileAlertMessage)
                        }
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
                    {/* List of documents */}
                    <DocumentsTableContainer className="documents-list mt-4">
                      <Table>
                        <thead>
                          <tr>
                            <th>{Localizer.get('Name')}</th>
                            <th>{Localizer.get('Signatures')}</th>
                            <th>{Localizer.get('Date Added')}</th>
                            {SystemRoleService.hasSomeRoles([
                              SystemRoles.SALES_PRESENTER,
                              SystemRoles.CLIENT_ADMIN,
                              SystemRoles.DEPARTMENT_ADMIN,
                              SystemRoles.ADMIN,
                            ]) && (
                              <th>{Localizer.get('Associated Meetings')}</th>
                            )}
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocuments.map((document, index) => (
                            <tr key={index}>
                              <td className="document-name">
                                <a
                                  href=" "
                                  onClick={(e) =>
                                    this.handleDocumentPreview(e, document)
                                  }
                                >
                                  {document.fileName}
                                </a>
                              </td>
                              <td>
                                {document.totalSignatureRequestCount > 0 ? (
                                  <a
                                    href=" "
                                    onClick={(e) => {
                                      e.preventDefault();
                                      this.setPartial({
                                        isRequestSignaturesModalOpen: true,
                                        selectedDocument: document,
                                      });
                                    }}
                                  >{`${
                                    document.signedSignatureRequestCount
                                  } ${Localizer.get('of')} ${
                                    document.totalSignatureRequestCount
                                  }`}</a>
                                ) : (
                                  `— —`
                                )}
                              </td>
                              <td>
                                {DateFormatUtil.getUnixToGivenTimezone(
                                  document.created,
                                  userTimezone,
                                  longDateFormat
                                )}
                              </td>
                              {SystemRoleService.hasSomeRoles([
                                SystemRoles.SALES_PRESENTER,
                                SystemRoles.CLIENT_ADMIN,
                                SystemRoles.DEPARTMENT_ADMIN,
                                SystemRoles.ADMIN,
                              ]) && (
                                <td>
                                  {!isEmpty(document.series) ? (
                                    <a
                                      href=" "
                                      onClick={(e) =>
                                        this.handleAssociateDocument(
                                          e,
                                          document
                                        )
                                      }
                                    >
                                      {document.series.length}&nbsp;
                                      {document.series.length === 1
                                        ? Localizer.get('Meeting')
                                        : Localizer.get('Meetings')}
                                    </a>
                                  ) : (
                                    '— —'
                                  )}
                                </td>
                              )}
                              <td className="context-menu-container">
                                <Dropdown
                                  id={`context-menu-${index}`}
                                  pullRight
                                  className="data-group context-menu"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) =>
                                    AccessibilityUtil.handleEnterKey(e, () =>
                                      e.stopPropagation()
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
                                    {SystemRoleService.hasSomeRoles([
                                      SystemRoles.SALES_PRESENTER,
                                      SystemRoles.CLIENT_ADMIN,
                                      SystemRoles.DEPARTMENT_ADMIN,
                                      SystemRoles.ADMIN,
                                    ]) && (
                                      <>
                                        <MenuItem
                                          eventKey="1"
                                          onClick={(e) =>
                                            this.handleAssociateDocument(
                                              e,
                                              document
                                            )
                                          }
                                          onKeyDown={(e) =>
                                            AccessibilityUtil.handleEnterKey(
                                              e,
                                              (e) =>
                                                this.handleAssociateDocument(
                                                  e,
                                                  document
                                                )
                                            )
                                          }
                                        >
                                          {Localizer.get('Add to Meeting')}
                                        </MenuItem>

                                        <MenuItem
                                          eventKey="2"
                                          onClick={(e) =>
                                            this.handleAssociateDocument(
                                              e,
                                              document,
                                              true
                                            )
                                          }
                                          onKeyDown={(e) =>
                                            AccessibilityUtil.handleEnterKey(
                                              e,
                                              (e) =>
                                                this.handleAssociateDocument(
                                                  e,
                                                  document,
                                                  true
                                                )
                                            )
                                          }
                                        >
                                          {Localizer.get('Remove from Meeting')}
                                        </MenuItem>
                                      </>
                                    )}
                                    {SystemRoleService.hasSomeRoles([
                                      SystemRoles.SALES_PRESENTER,
                                      SystemRoles.CLIENT_ADMIN,
                                      SystemRoles.DEPARTMENT_ADMIN,
                                      SystemRoles.ADMIN,
                                    ]) && (
                                      <>
                                        <MenuItem
                                          eventKey="3"
                                          onClick={() =>
                                            this.setPartial({
                                              isRequestSignaturesModalOpen: true,
                                              selectedDocument: document,
                                              requestSignaturesShowForm: true,
                                            })
                                          }
                                          onKeyDown={(e) =>
                                            AccessibilityUtil.handleEnterKey(
                                              e,
                                              () =>
                                                this.setPartial({
                                                  isRequestSignaturesModalOpen: true,
                                                  selectedDocument: document,
                                                  requestSignaturesShowForm: true,
                                                })
                                            )
                                          }
                                        >
                                          {Localizer.get('Request Signatures')}
                                        </MenuItem>
                                        {/* <MenuItem
                                          eventKey="4"
                                          onClick={() => null}
                                          onKeyDown={(e) =>
                                            AccessibilityUtil.handleEnterKey(
                                              e,
                                              () => null
                                            )
                                          }
                                        >
                                          {Localizer.get('Remind Signers')}
                                        </MenuItem> */}
                                      </>
                                    )}
                                    <MenuItem
                                      eventKey="5"
                                      onClick={(e) =>
                                        this.onDeleteBtnClick(e, document)
                                      }
                                      onKeyDown={(e) =>
                                        AccessibilityUtil.handleEnterKey(
                                          e,
                                          () =>
                                            this.onDeleteBtnClick(e, document)
                                        )
                                      }
                                    >
                                      {Localizer.get('Delete')}
                                    </MenuItem>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </DocumentsTableContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        </Animated>
        <GenericModal
          show={isDeleteDocumentModalOpen}
          confirmButtonDisable={loading === LoadStates.Loading}
          modalTitle={`${Localizer.get('Delete Document')}: ${
            selectedDocument ? selectedDocument.fileName : ''
          }`}
          bodyClassName={`document-preview`}
          hasCloseButton={true}
          closeButtonType="cancel"
          onCloseClicked={() => {
            this.setPartial({
              selectedDocument: null,
              isDeleteDocumentModalOpen: false,
            });
          }}
          hasConfirmButton={true}
          confirmButtonType="remove"
          confirmButtonStyle="danger"
          onConfirmClicked={() =>
            this.handleDeleteDocument(selectedDocument.id)
          }
        >
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Loading document...')}
            errorMessage={Localizer.get(
              'Something went wrong loading the document.  Please try again later.'
            )}
          />
          <p>
            {Localizer.get(
              'Deleting this document will delete it from all associated meetings including presentations, questions, analytics, as well as participant access to the document and their personal notes.'
            )}
          </p>
        </GenericModal>

        {!isNull(selectedDocument) && isPreviewDocumentModalOpen && (
          <GenericModal
            size={'large'}
            bodyClassName="document-preview"
            backdropClassName={`my-documents-backdrop`}
            modalTitle={Localizer.get('Document Preview')}
            show={isPreviewDocumentModalOpen}
            hasConfirmButton
            confirmButtonType="download"
            fileDownloadUrl={selectedDocument.fileUrl}
            fileDownloadName={selectedDocument.fileName}
            onConfirmClicked={() => null}
            confirmButtonText={Localizer.get('Download PDF')}
            onCloseClicked={() => this.handleCloseClicked()}
          >
            <div className="pdf-main">
              <div className="meta-data">
                <div className="document-name">
                  <span className="label">
                    {Localizer.get('Document Name')}
                  </span>
                  <span className="value">{selectedDocument.fileName}</span>
                </div>
                <div className="document-created">
                  <span className="label">{Localizer.get('Created On')}</span>
                  <span className="value">
                    {DateFormatUtil.getUnixToGivenTimezone(
                      selectedDocument.created,
                      userTimezone,
                      longDateFormat
                    )}
                  </span>
                </div>
              </div>

              <div className="pdf-viewer-container">
                <PdfViewer
                  currentUserId={currentUserId}
                  selectedDocument={selectedDocument}
                  needsSecurityCheck={false}
                />
              </div>
            </div>
          </GenericModal>
        )}
        {!isNull(selectedDocument) && isAssociateDocumentModalOpen && (
          <AssociateDocumentToMeetingModal
            show={isAssociateDocumentModalOpen}
            document={selectedDocument}
            onClosed={() =>
              this.setPartial({
                isAssociateDocumentModalOpen: false,
                selectedDocument: null,
              })
            }
            documentUpdated={() => this.getMyDocuments()}
            selectedTab={associateDocumentModalSelectedTab}
          />
        )}
        {!isNull(selectedDocument) && isRequestSignaturesModalOpen && (
          <RequestSignaturesModal
            show={isRequestSignaturesModalOpen}
            document={selectedDocument}
            onClosed={() =>
              this.setPartial({
                isRequestSignaturesModalOpen: false,
                selectedDocument: null,
                requestSignaturesShowForm: false,
              })
            }
            userTimezone={userTimezone}
            showRequestForm={requestSignaturesShowForm}
            onSignaturesRequested={() => this.getMyDocuments()}
          />
        )}
      </div>
    );
  }
}

export default connect<IConnectedMyDocumentsProps, {}, IMyDocumentsProps>(
  AppMappers.AppMapper
)(MyDocuments);
