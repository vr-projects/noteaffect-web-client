import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import { LoadIndicator, LoadStates, SrUiComponent } from 'react-strontium';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Document, Page, Outline } from 'react-pdf';
import Localizer from '../../utilities/Localizer';
import IDocument from '../../models/IDocument';
import ISignatureRequest from '../../models/ISignatureRequest';
import PdfMappers from '../../mappers/PdfMappers';
import * as PdfActions from '../../store/pdf/PdfActions';

interface IConnectedPdfViewerProps extends DispatchProp<any> {
  documentLoadState: LoadStates;
  currentPage: number;
  isDrawingEnabled: boolean;
}
interface IPdfViewerProps {
  isParticipantObserver?: boolean;
  isSignatureRequest?: boolean;
  currentUserId: number;
  notesVisible?: boolean;
  selectedDocument?: IDocument;
  selectedSignatureRequest?: ISignatureRequest;
  showOutline?: boolean;
  needsSecurityCheck: boolean;
  isSecurityMode?: boolean;
  isSecurityCheckDone?: boolean;
  seriesId?: number;
}

interface IPdfViewerState {
  numPages: number;
}

class PdfViewer extends SrUiComponent<
  IConnectedPdfViewerProps & IPdfViewerProps,
  IPdfViewerState
> {
  initialState() {
    return {
      numPages: null,
    };
  }

  onComponentMounted() {
    PdfActions.setDocumentLoadState(LoadStates.Loading);
  }

  onComponentWillUnmount() {
    PdfActions.setDocumentLoadState(LoadStates.Unloaded);
  }

  onDocumentLoadSuccess({ numPages }) {
    const {
      isSignatureRequest = false,
      isParticipantObserver,
      currentUserId,
      seriesId,
      selectedDocument,
      selectedSignatureRequest,
      dispatch,
    } = this.props;

    if (isParticipantObserver && !isSignatureRequest) {
      dispatch(
        PdfActions.fetchSeriesDocumentNotesApiData({
          seriesId,
          userFileId: selectedDocument.id,
          currentUserId,
          numPages,
        })
      );
    }

    this.setPartial({
      numPages,
    });

    dispatch(
      PdfActions.setCurrentPage({
        updateRemote: false,
        seriesId,
        userFileId: isSignatureRequest
          ? selectedSignatureRequest.userFileId
          : selectedDocument.id,
        newPageNumber: 1,
        totalPages: numPages,
      })
    );

    dispatch(PdfActions.setDocumentLoadState(LoadStates.Succeeded));

    if (isParticipantObserver && !isSignatureRequest) {
      const options = {
        seriesId,
        userFileId: selectedDocument.id,
      };
      dispatch(PdfActions.setStartedViewingDocumentToRemote(options));
    }
  }

  onDocumentLoadError() {
    const { dispatch } = this.props;
    dispatch(PdfActions.setDocumentLoadState(LoadStates.Failed));
  }

  changePage(offset) {
    const {
      isSignatureRequest,
      isParticipantObserver,
      selectedDocument = { id: null },
      selectedSignatureRequest = { userFileId: null },
      seriesId,
      currentPage,
      dispatch,
    } = this.props;
    const { numPages } = this.state;

    dispatch(
      PdfActions.setCurrentPage({
        updateRemote: !isSignatureRequest ? isParticipantObserver : false,
        seriesId,
        userFileId: !isSignatureRequest
          ? selectedDocument.id
          : selectedSignatureRequest.userFileId,
        newPageNumber: currentPage + offset,
        totalPages: numPages,
      })
    );
  }

  prevPage() {
    this.changePage(-1);
  }

  nextPage() {
    this.changePage(1);
  }

  // Not for signature requests
  handleOutlineClick({ pageNumber }) {
    const {
      isParticipantObserver,
      seriesId,
      selectedDocument,
      dispatch,
    } = this.props;
    const { numPages } = this.state;
    dispatch(
      PdfActions.setCurrentPage({
        updateRemote: isParticipantObserver,
        seriesId,
        userFileId: selectedDocument.id,
        newPageNumber: pageNumber,
        totalPages: numPages,
      })
    );
  }

  performRender() {
    const {
      isSignatureRequest = false,
      selectedDocument = { fileUrl: null },
      selectedSignatureRequest = { userFileUrl: null },
      showOutline = false,
      documentLoadState,
      currentPage,
    } = this.props;
    const { numPages } = this.state;
    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= numPages;
    const hasMultiplePages = numPages > 1;

    return (
      <div className="pdf-viewer">
        <Document
          file={
            !isSignatureRequest
              ? selectedDocument.fileUrl
              : selectedSignatureRequest.userFileUrl
          }
          error={Localizer.get('There was an error loading your document.')}
          noData={Localizer.get(
            'There was no document file returned from the database.'
          )}
          loading={() => <LoadIndicator state={LoadStates.Loading} />}
          onLoadSuccess={(e) => this.onDocumentLoadSuccess(e)}
          onLoadError={() => this.onDocumentLoadError()}
          renderMode="canvas"
        >
          {showOutline && (
            <>
              <h3>PDF Outline</h3>
              <Outline onItemClick={(e) => this.handleOutlineClick(e)} />
            </>
          )}

          <Page pageNumber={currentPage} />
        </Document>

        {documentLoadState === LoadStates.Succeeded && hasMultiplePages && (
          <div className="pdf-controls-container">
            <div className="pdf-controls">
              <Button
                bsStyle={isFirstPage ? 'default' : 'primary'}
                className={'na-btn-reset-width na-icon-btn'}
                disabled={isFirstPage}
                onClick={() => this.prevPage()}
              >
                <FaChevronLeft />
              </Button>
              <span className={'page-numbers'}>
                {currentPage} / {numPages}
              </span>
              <Button
                bsStyle={isLastPage ? 'default' : 'primary'}
                className={'na-icon-btn'}
                disabled={isLastPage}
                onClick={() => this.nextPage()}
              >
                <FaChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect<IConnectedPdfViewerProps, void, IPdfViewerProps>(
  PdfMappers.PdfMapper
)(PdfViewer);
