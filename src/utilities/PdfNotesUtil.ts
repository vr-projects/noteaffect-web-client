import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import merge from 'lodash/merge';
import { IPdfNotesDataJS, IPdfAnnotations } from '../interfaces/IPdfNotes';
import { ApiHelpers } from 'react-strontium';
import DataRecordingUtil from './DataRecordingUtil';
import ErrorUtil from './ErrorUtil';

class PdfNotesUtil {
  private static _savingHandles: { [key: string]: number } = {};

  /**
   * Method creates mapping for store { [seriesId]: { [userFileId]: { [page]: { annotations, sharedAnnotations, notes, sharedNotes }} } }
   * @param seriesId
   * @param rawNotesData
   */
  public static mapPdfApiNotesDataForStore(options: {
    seriesId: number;
    userFileId: number;
    currentUserId: number;
    numPages: number;
    rawNotesData: any;
  }) {
    const {
      seriesId,
      userFileId,
      currentUserId,
      numPages,
      rawNotesData,
    } = options;
    // ** Create array of pages ex: 2 => [1,2]
    const pagesArr = [...Array(numPages).keys()].map((i) => i + 1);
    const defaultStoreMapping = pagesArr.reduce((acc, page) => {
      acc[seriesId] = !has(acc, seriesId) ? {} : acc[seriesId];
      acc[seriesId][userFileId] = !has(acc[seriesId], userFileId)
        ? {}
        : acc[seriesId][userFileId];
      acc[seriesId][userFileId][page] = !has(acc[seriesId][userFileId], page)
        ? {}
        : acc[seriesId][userFileId][page];
      acc[seriesId][userFileId][page].annotations = undefined;
      acc[seriesId][userFileId][page].notes = undefined;
      acc[seriesId][userFileId][page].sharedAnnotations = undefined;
      acc[seriesId][userFileId][page].sharedNotes = undefined;
      return acc;
    }, {});

    // ** First time no notes, create mapped object
    if (isEmpty(rawNotesData)) {
      return defaultStoreMapping;
    }

    //** Subsequent times read from API data
    let mappedApiNotesData = rawNotesData.reduce((acc, curr) => {
      // ** Build out mapping obj[seriesId][userFileId][page] { annotations, sharedAnnotations, notes, sharedNotes}
      acc[seriesId] = !has(acc, seriesId) ? {} : acc[seriesId];
      acc[seriesId][curr.userFileId] = !has(acc[seriesId], curr.userFileId)
        ? {}
        : acc[seriesId][curr.userFileId];
      acc[seriesId][curr.userFileId][curr.page] = !has(
        acc[seriesId][curr.userFileId],
        curr.page
      )
        ? {
            annotations: undefined,
            sharedAnnotations: undefined,
            notes: undefined,
            sharedNotes: undefined,
          }
        : acc[seriesId][curr.userFileId][curr.page];

      // ** Set values shared vs. mine
      if (curr.userId === currentUserId) {
        acc[seriesId][curr.userFileId][curr.page].annotations =
          curr.annotations;
        acc[seriesId][curr.userFileId][curr.page].notes = curr.notes;
      } else {
        acc[seriesId][curr.userFileId][curr.page].sharedAnnotations =
          curr.annotations;
        acc[seriesId][curr.userFileId][curr.page].sharedNotes = curr.notes;
      }

      return acc;
    }, {});

    const mappedNotesData = merge(defaultStoreMapping, mappedApiNotesData);

    return mappedNotesData;
  }

  /**
   * Method sets passed notes string to notesData object for setting to pdfStore
   * @param options
   */
  public static setNoteForPage(options: {
    notesData: IPdfNotesDataJS;
    seriesId: number;
    userFileId: number;
    page: number;
    notes: string;
  }) {
    const { notesData, seriesId, userFileId, page, notes } = options;
    const notesDataClone = { ...notesData };

    notesDataClone[seriesId][userFileId][page].notes = notes;

    return notesDataClone;
  }

  /**
   * Method sets passed annotations object to notesData object for setting to pdfStore
   * @param options
   */
  public static setAnnotationsForPage(options: {
    notesData: IPdfNotesDataJS;
    seriesId: number;
    userFileId: number;
    page: number;
    annotations: IPdfAnnotations;
  }) {
    const { notesData, seriesId, userFileId, page, annotations } = options;
    const notesDataClone = { ...notesData };

    notesDataClone[seriesId][userFileId][page].annotations = annotations;

    return notesDataClone;
  }

  /**
   * Method returns current user notes from shape stored in pdf store
   * @param parsedNotesData
   * @param seriesId
   * @param userFileId
   * @param currentUserId
   * @param currentPageNumber
   */
  public static getNotesForPage(
    parsedNotesData,
    seriesId,
    userFileId,
    currentPageNumber
  ) {
    if (
      isEmpty(parsedNotesData) ||
      !has(parsedNotesData, seriesId) ||
      !has(parsedNotesData[seriesId], userFileId) ||
      !has(parsedNotesData[seriesId][userFileId], currentPageNumber) ||
      isUndefined(
        parsedNotesData[seriesId][userFileId][currentPageNumber].notes
      )
    ) {
      return '';
    }

    return parsedNotesData[seriesId][userFileId][currentPageNumber].notes;
  }

  /**
   * Method returns current user notes from shape stored in pdf store
   * @param parsedNotesData
   * @param seriesId
   * @param userFileId
   * @param currentUserId
   * @param currentPageNumber
   */
  public static getSharedNotesForPage(
    parsedNotesData,
    seriesId,
    userFileId,
    currentPageNumber
  ) {
    if (
      isEmpty(parsedNotesData) ||
      !has(parsedNotesData, seriesId) ||
      !has(parsedNotesData[seriesId], userFileId) ||
      !has(parsedNotesData[seriesId][userFileId], currentPageNumber)
    ) {
      return '';
    }

    return parsedNotesData[seriesId][userFileId][currentPageNumber].sharedNotes;
  }

  public static getHasSharedNotes(parsedNotesData, seriesId, userFileId, page) {
    return !isEmpty(
      this.getSharedNotesForPage(parsedNotesData, seriesId, userFileId, page)
    );
  }

  public static saveToRemote(options: {
    seriesId: number;
    userFileId: number;
    page: number;
    notesData: IPdfNotesDataJS;
  }) {
    const { seriesId, userFileId, page, notesData } = options;

    const id = `${seriesId}-${userFileId}-${page}`;

    if (this._savingHandles[id]) {
      window.clearTimeout(this._savingHandles[id]);
    }

    this._savingHandles[id] = window.setTimeout(async () => {
      const hasNotes = !isNull(notesData.notes);
      const hasAnnotations = !isNull(notesData.annotations);
      const notesArguments = !hasNotes ? null : notesData.notes;
      const annotationsArguments = !hasAnnotations
        ? null
        : notesData.annotations;

      const payload = {
        userFileId,
        seriesId,
        updateNotes: hasNotes,
        notes: notesArguments,
        updateAnnotations: hasAnnotations,
        annotations: annotationsArguments,
        page,
      };

      try {
        const resp = await ApiHelpers.create(
          `userfiles/${userFileId}/notes`,
          payload
        );

        if (!isEmpty(resp.errors)) {
          ErrorUtil.throwErrorMessage(resp.errors);
          return;
        }
        if (!resp.good) {
          throw new Error('Error removing department. Please try again.');
        }

        DataRecordingUtil.recordDataItem({
          key: 'Document notes updated',
          id1: seriesId,
          id2: userFileId,
          value1: page,
        });
      } catch (error) {
        console.error(error);
        return;
      }
    }, 500);
  }
}

export default PdfNotesUtil;
