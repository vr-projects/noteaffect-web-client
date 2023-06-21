import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Table, Alert } from 'react-bootstrap';
import { SrUiComponent, Animated } from 'react-strontium';
import { SERIES_DOCUMENTS } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import IDocument from '../../models/IDocument';
import DocumentsTableContainer from './DocumentsTableContainer';
import GenericModal from '../controls/GenericModal';
import DateFormatUtil, {
  prettyLongDateFormat,
} from '../../utilities/DateFormatUtil';
import PdfViewer from '../documents/PdfViewer';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import * as SecurityActions from '../../store/security/SecurityActions';
import * as PdfActions from '../../store/pdf/PdfActions';
import PdfDrawableSurfaceControls from './PdfDrawableSurfaceControls';
import PdfNotes from './PdfNotes';

interface IConnectedSeriesDocumentsProps extends DispatchProp<any> {
  isSecurityCheckDone: boolean;
  isSecurityMode: boolean;
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface ISeriesDocumentsProps {
  series: ICourse;
  isPresenter?: boolean;
}

interface ISeriesDocumentsState {
  selectedDocument: IDocument;
  isPreviewDocumentModalOpen: boolean;
  isNotesVisible: boolean;
}

class SeriesDocuments extends SrUiComponent<
  IConnectedSeriesDocumentsProps & ISeriesDocumentsProps,
  ISeriesDocumentsState
> {
  initialState() {
    return {
      selectedDocument: null,
      isPreviewDocumentModalOpen: false,
      isNotesVisible: false,
    };
  }

  onComponentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(PdfActions.setRemoteNoteUpdatesEnabled(false));
  }

  handleDocumentPreview(
    e: React.MouseEvent<HTMLAnchorElement>,
    document: IDocument
  ): void {
    const {
      isPresenter = false,
      isSecurityCheckDone,
      isSecurityMode,
      series,
      dispatch,
    } = this.props;
    e.preventDefault();

    if (!isPresenter && isSecurityCheckDone && isSecurityMode) {
      dispatch(SecurityActions.startDocumentMonitoring(series.id, document.id));
    }

    this.setPartial({
      isPreviewDocumentModalOpen: true,
      selectedDocument: document,
    });
  }

  handleCloseClicked(): void {
    const {
      isPresenter = false,
      isSecurityCheckDone,
      isSecurityMode,
      series,
      dispatch,
    } = this.props;
    const { selectedDocument } = this.state;

    if (!isPresenter) {
      if (isSecurityCheckDone && isSecurityMode) {
        dispatch(
          SecurityActions.stopDocumentMonitoring(series.id, selectedDocument.id)
        );
      }
      dispatch(PdfActions.setRemoteNoteUpdatesEnabled(false));
    }

    this.setPartialAsync({
      selectedDocument: null,
      isPreviewDocumentModalOpen: false,
    });
  }

  handleToggleNotes() {
    const { isPresenter = false, dispatch } = this.props;
    const { isNotesVisible } = this.state;
    const willNotesBeVisible = !isNotesVisible;
    if (isPresenter) return;

    dispatch(PdfActions.setRemoteNoteUpdatesEnabled(willNotesBeVisible));
    this.setPartial({ isNotesVisible: !isNotesVisible });
  }

  performRender() {
    const {
      isPresenter = false,
      userInformation,
      isSecurityCheckDone,
      isSecurityMode,
      series: { id: seriesId, documents, sharedBy },
    } = this.props;
    const {
      selectedDocument,
      isPreviewDocumentModalOpen,
      isNotesVisible,
    } = this.state;
    const userTimezone = userInformation.toJS().timezone;
    const currentUserId = userInformation.toJS().id;
    const removeDownloadButton =
      !isPresenter && isSecurityCheckDone && isSecurityMode;
    const hasDocuments = !isEmpty(documents);

    return (
      <div className="series-documents">
        <div className="series-documents-wrapper">
          <h3>{Localizer.get('Documents')}</h3>

          {hasDocuments ? (
            <DocumentsTableContainer>
              <Table className="mb-0">
                <thead>
                  <tr>
                    <th colSpan={2}>{Localizer.get('Name')}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
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
                      <td className="context-menu-container"></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </DocumentsTableContainer>
          ) : (
            <Animated in>
              <Alert bsStyle="info">
                <span>{Localizer.getFormatted(SERIES_DOCUMENTS.NONE)}</span>
              </Alert>
            </Animated>
          )}
        </div>

        {/* //** Preview Document Modal/ */}
        {!isNull(selectedDocument) && isPreviewDocumentModalOpen && (
          <GenericModal
            size={'large'}
            bodyClassName={`document-preview`}
            backdropClassName={`document-notes ${
              isNotesVisible ? 'document-notes-visible' : ''
            }`}
            modalTitle={Localizer.get('Document Preview')}
            show={isPreviewDocumentModalOpen}
            hasConfirmButton={!removeDownloadButton}
            confirmButtonType="download"
            fileDownloadUrl={
              !removeDownloadButton ? selectedDocument.fileUrl : null
            }
            fileDownloadName={
              !removeDownloadButton ? selectedDocument.fileName : null
            }
            onConfirmClicked={() => null}
            confirmButtonText={
              !removeDownloadButton ? Localizer.get('Download PDF') : null
            }
            onCloseClicked={() => this.handleCloseClicked()}
          >
            <div className="pdf-main">
              <div className="meta-data">
                <div className="document-name">
                  <div className="label d-flex justify-content-start">
                    <span>{Localizer.get('Document Name:')}</span>
                  </div>
                  <div className="value d-flex justify-content-start">
                    <span>{selectedDocument.fileName}</span>
                  </div>
                </div>
                <div className="document-created">
                  <div className="label d-flex justify-content-end">
                    <span>{Localizer.get('Created On:')}</span>
                  </div>
                  <div className="value d-flex justify-content-end">
                    <span>
                      {DateFormatUtil.getUnixToGivenTimezone(
                        selectedDocument.created,
                        userTimezone,
                        prettyLongDateFormat
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {!isPresenter && (
                <PdfDrawableSurfaceControls
                  fullscreen={true}
                  isNotesVisible={isNotesVisible}
                  onToggleNotes={() => this.handleToggleNotes()}
                />
              )}

              <div className="pdf-viewer-container">
                <PdfViewer
                  currentUserId={currentUserId}
                  isParticipantObserver={!isPresenter}
                  needsSecurityCheck
                  selectedDocument={selectedDocument}
                  isSecurityCheckDone={isSecurityCheckDone}
                  isSecurityMode={isSecurityCheckDone}
                  notesVisible={isNotesVisible}
                  seriesId={seriesId}
                />
              </div>
            </div>
            {isNotesVisible && (
              <div className="pdf-notes-container">
                <PdfNotes
                  isShared={!isNull(sharedBy)}
                  seriesId={seriesId}
                  userFileId={selectedDocument.id}
                  currentUserId={currentUserId}
                  enabled={isNotesVisible}
                  container={null}
                />
              </div>
            )}
          </GenericModal>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedSeriesDocumentsProps,
  void,
  ISeriesDocumentsProps
>(AppMappers.AppMapper)(SeriesDocuments);
