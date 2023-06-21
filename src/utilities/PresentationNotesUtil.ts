import * as Immutable from 'immutable';
import has from 'lodash/has';
import PresentationData from './PresentationData';
import {
  IImmutablePresentationNotes,
  IPresentationAnnotations,
  IPresentationNotes,
  IPresentationNotesData,
} from '../interfaces/IPresentedNotes';
import { IImmutablePresentedDataMap } from '../interfaces/IPresentedData';
import { IImmutableCourseNotesMap } from '../interfaces/IPresentationDataProps';
import { ApiHelpers } from 'react-strontium';
import DataRecordingUtil from './DataRecordingUtil';

type ImmutableCourseData = Immutable.Map<string, IImmutablePresentationNotes>;
type TNotesData = {
  data?: IImmutableCourseNotesMap;
  course?: ImmutableCourseData;
  slide?: IImmutablePresentationNotes;
};
type ImmutablePresData = Immutable.Map<string, IImmutablePresentedDataMap>;

class PresentationNotesUtil {
  private static _savingHandles: { [key: string]: number } = {};

  /**
   * Method create map with course id as key
   * Ex: Map {12: {}}, value is an empty object/map
   * @param courseId
   * @param stateData
   */
  public static mappedNotesStateData(
    courseId: number,
    stateData: IImmutableCourseNotesMap
  ): IImmutableCourseNotesMap {
    const courseIdString = courseId.toString();

    if (!stateData || stateData.isEmpty() || !stateData.get(courseIdString)) {
      stateData = stateData.set(courseIdString, Immutable.Map<string, any>());
    }

    return stateData;
  }

  /**
   * Method Prepares map further returning data and course
   * @param courseId
   * @param stateData
   */
  public static notesDataFor(
    courseId: number,
    stateData: IImmutableCourseNotesMap
  ): TNotesData {
    let notesData = this.mappedNotesStateData(courseId, stateData);

    return { data: notesData, course: notesData.get(courseId.toString()) };
  }

  /**
   * Function prepares shapes of annotations, notes, and sharedNotes
   *
   * @param courseId
   * @param slideNumber
   * @param stateData
   */
  public static notesDataForSlide(
    courseId: number,
    slideNumber: number,
    stateData: IImmutableCourseNotesMap
  ): TNotesData {
    const notesData = this.notesDataFor(courseId, stateData);

    if (
      notesData.course.isEmpty() ||
      !notesData.course.get(slideNumber.toString())
    ) {
      notesData.course = notesData.course.set(
        slideNumber.toString(),
        Immutable.fromJS({
          annotations: {},
          sharedAnnotations: {},
          notes: { notes: undefined },
          sharedNotes: { notes: undefined },
        })
      );
    }

    return {
      data: notesData.data,
      course: notesData.course,
      slide: notesData.course.get(slideNumber.toString()),
    };
  }

  public static currentNotesData(
    courseId: number,
    notesData: IImmutableCourseNotesMap,
    presData: ImmutablePresData
  ): TNotesData {
    let currentSlide = PresentationData.currentUserSlide(courseId, presData);

    if (currentSlide === 0) {
      return undefined;
    }

    return this.notesDataForSlide(courseId, currentSlide, notesData);
  }

  public static updatedNotesForSlide(
    courseId: number,
    slideNumber: number,
    notes: IPresentationNotes,
    stateData: IImmutableCourseNotesMap,
    isSharedNote?: boolean
  ): TNotesData {
    let notesData = this.notesDataForSlide(courseId, slideNumber, stateData);

    if (has(notes, 'annotations')) {
      const setAnnotationsKey = !isSharedNote
        ? 'annotations'
        : 'sharedAnnotations';

      notesData.slide = notesData.slide.set(
        setAnnotationsKey,
        Immutable.fromJS(notes.annotations)
      );
    }

    if (has(notes, 'notes')) {
      const setNotesKey = !isSharedNote ? 'notes' : 'sharedNotes';

      notesData.slide = notesData.slide.set(
        setNotesKey,
        Immutable.fromJS(notes.notes)
      );
    }

    return notesData;
  }

  public static saveToRemote(options: {
    seriesId: number;
    lectureId: number;
    slide: number;
    notesData: IPresentationNotes;
  }) {
    const { seriesId, lectureId, slide, notesData } = options;
    if (!seriesId || !lectureId || !slide || !notesData) {
      return;
    }

    const id = `${seriesId}-${lectureId}-${slide}`;

    if (this._savingHandles[id]) {
      window.clearTimeout(this._savingHandles[id]);
    }

    this._savingHandles[id] = window.setTimeout(() => {
      const hasNotes = has(notesData, 'notes');
      const notesArguments = hasNotes
        ? (notesData.notes as IPresentationNotesData).notes
        : null;
      const payload = {
        slide: options.slide,
        updateNotes: hasNotes,
        notes: notesArguments,
        annotations: notesData.annotations,
        updateAnnotations: has(notesData, 'annotations'),
      };

      try {
        ApiHelpers.create(`lectures/${options.lectureId}/notes`, payload);
      } catch (error) {
        console.error(error);
      }

      DataRecordingUtil.recordDataItem({
        key: 'Slide notes updated',
        id1: seriesId,
        id2: lectureId,
        value1: slide,
      });
    }, 500);
  }
}

export default PresentationNotesUtil;
