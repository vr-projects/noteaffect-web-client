import { ApiHelpers, LoadStates } from 'react-strontium';
import isEmpty from 'lodash/isEmpty';
import ErrorUtil from '../../utilities/ErrorUtil';
import { IPdfNotesDataJS, IPdfAnnotations } from '../../interfaces/IPdfNotes';
import PdfActionTypes from './PdfActionTypes';
import PdfNotesUtil from '../../utilities/PdfNotesUtil';
import DataRecordingUtil from '../../utilities/DataRecordingUtil';

export function setDocumentLoadState(loadState: LoadStates) {
  return async (dispatch, getState) => {
    dispatch({
      type: PdfActionTypes.SetDocumentLoadState,
      value: loadState,
    });
  };
}

export function setCurrentPage(options: {
  updateRemote: boolean;
  seriesId: number;
  userFileId: number;
  newPageNumber: number;
  totalPages: number;
}) {
  return async (dispatch, getState) => {
    const {
      updateRemote,
      seriesId,
      userFileId,
      newPageNumber,
      totalPages,
    } = options;
    dispatch({
      type: PdfActionTypes.SetCurrentPage,
      value: newPageNumber,
    });

    if (!updateRemote) return;

    DataRecordingUtil.recordDataItem({
      key: 'Document page changed',
      id1: seriesId,
      id2: userFileId,
      value1: newPageNumber,
      value2: totalPages,
    });
  };
}

export function fetchSeriesDocumentNotesApiData(options: {
  seriesId: number;
  userFileId: number;
  currentUserId: number;
  numPages: number;
}) {
  return async (dispatch) => {
    const { seriesId, userFileId, currentUserId, numPages } = options;

    try {
      dispatch({
        type: PdfActionTypes.SetDocumentNotesLoadState,
        value: LoadStates.Loading,
      });

      const userFileNotesResp = await ApiHelpers.read(
        `series/${seriesId}/userfiles/${userFileId}/notes`
      );

      if (!userFileNotesResp.good) {
        throw new Error('Error getting notes for document');
      }
      if (!isEmpty(userFileNotesResp.errors)) {
        ErrorUtil.throwErrorMessage(userFileNotesResp.errors);
      }

      const rawNotesData = JSON.parse(userFileNotesResp.data);

      const pdfNotesData = PdfNotesUtil.mapPdfApiNotesDataForStore({
        seriesId,
        userFileId,
        currentUserId,
        numPages,
        rawNotesData,
      });

      dispatch({
        type: PdfActionTypes.SetPdfNotesData,
        value: pdfNotesData,
      });

      dispatch({
        type: PdfActionTypes.SetDocumentNotesLoadState,
        value: LoadStates.Succeeded,
      });

      dispatch({
        type: PdfActionTypes.SetRemoteUpdateEnabled,
        value: true,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: PdfActionTypes.SetRemoteUpdateEnabled,
        value: false,
      });

      // TODO error message to store
      dispatch({
        type: PdfActionTypes.SetDocumentNotesLoadState,
        value: LoadStates.Failed,
      });
    }
  };
}

/**
 * Method creates entirely new .pdfStore.notesData object to dispatch back to reducer
 * @param options
 */
export function setUserNoteToStore(options: {
  seriesId: number;
  userFileId: number;
  page: number;
  notes: string;
}) {
  return async (dispatch, getState) => {
    const { seriesId, userFileId, page, notes } = options;
    const { pdf: pdfState } = getState();
    const notesData = pdfState.toJS().notesData as IPdfNotesDataJS;

    const updatedNotesData = PdfNotesUtil.setNoteForPage({
      notesData,
      seriesId,
      userFileId,
      page,
      notes,
    });

    dispatch({
      type: PdfActionTypes.SetPdfNotesData,
      value: updatedNotesData,
    });

    if (pdfState.isRemoteUpdateEnabled) {
      const options = {
        seriesId,
        userFileId,
        page,
        notesData: {
          notes: notes,
          sharedNotes: null,
          annotations: null,
          sharedAnnotations: null,
        },
      };
      PdfNotesUtil.saveToRemote(options);
    }
  };
}

/**
 * Method creates entirely new .pdfStore.notesData object to dispatch back to reducer
 * @param options
 */
export function setUserAnnotationsToStore(options: {
  seriesId: number;
  userFileId: number;
  page: number;
  annotations: IPdfAnnotations;
}) {
  return async (dispatch, getState) => {
    const { seriesId, userFileId, page, annotations } = options;
    const { pdf: pdfState } = getState();
    const notesData = pdfState.toJS().notesData as IPdfNotesDataJS;

    const updatedNotesData = PdfNotesUtil.setAnnotationsForPage({
      notesData,
      seriesId,
      userFileId,
      page,
      annotations,
    });

    dispatch({
      type: PdfActionTypes.SetPdfNotesData,
      value: updatedNotesData,
    });

    if (pdfState.isRemoteUpdateEnabled) {
      const options = {
        seriesId,
        userFileId,
        page,
        notesData: {
          notes: null,
          sharedNotes: null,
          annotations: annotations,
          sharedAnnotations: null,
        },
      };
      PdfNotesUtil.saveToRemote(options);
    }
  };
}

export function setRemoteNoteUpdatesEnabled(enabled: boolean) {
  return async (dispatch) => {
    dispatch({
      type: PdfActionTypes.SetRemoteUpdateEnabled,
      value: enabled,
    });
  };
}

export function setStartedViewingDocumentToRemote(options: {
  seriesId: number;
  userFileId: number;
}) {
  return async (dispatch, getState) => {
    const { seriesId, userFileId } = options;

    DataRecordingUtil.recordDataItem({
      key: 'Started viewing document',
      id1: seriesId,
      id2: userFileId,
    });
  };
}
