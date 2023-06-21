import * as Immutable from 'immutable';
import IImmutableObject from './IImmutableObject';
import { IPresentedData, IImmutablePresentedDataMap } from './IPresentedData';
import {
  IPresentationNotes,
  IImmutablePresentationNotes,
} from './IPresentedNotes';
import IQuestion from '../models/IQuestion';
import IUserQuestion from '../models/IUserQuestion';

export interface ICoursePresentedMap {
  [courseId: string]: IPresentedData;
}

export interface ICourseNotesMap {
  [courseId: string]: ISlideNotesMap;
}

export interface ISlideNotesMap {
  [slide: string]: IPresentationNotes;
}

export interface IQuestionsMap {
  [courseId: string]: IQuestion[];
}

export interface ILectureQuestionsMap {
  [courseId: string]: IUserQuestion[];
}

export interface IImmutableCourseNotesMap
  extends Immutable.Map<
    string,
    Immutable.Map<string, IImmutablePresentationNotes>
  > {}

export interface IPresentationDataProps {
  presentedData?:
    | ICoursePresentedMap
    | Immutable.Map<string, IImmutablePresentedDataMap>;
  postPresentedData?:
    | ICoursePresentedMap
    | Immutable.Map<string, IImmutablePresentedDataMap>;
  notesData?:
    | ICourseNotesMap
    | Immutable.Map<string, Immutable.Map<string, IImmutablePresentationNotes>>;
  postNotesData?:
    | ICourseNotesMap
    | Immutable.Map<string, Immutable.Map<string, IImmutablePresentationNotes>>;
  uiContainer?: HTMLDivElement;
  questions?:
    | IQuestionsMap
    | Immutable.Map<string, Immutable.List<IImmutableObject<IQuestion>>>;
  postQuestions?:
    | IQuestionsMap
    | Immutable.Map<string, Immutable.List<IImmutableObject<IQuestion>>>;
  remoteUpdateEnabled?: boolean;
  lectureQuestions?:
    | ILectureQuestionsMap
    | Immutable.Map<string, Immutable.List<IImmutableObject<IUserQuestion>>>;
  isOnLivePresentationView?: boolean;
}

export interface IImmutablePresentationDataProps
  extends IPresentationDataProps {
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  postPresentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  notesData?: Immutable.Map<
    string,
    Immutable.Map<string, IImmutablePresentationNotes>
  >;
  postNotesData?: Immutable.Map<
    string,
    Immutable.Map<string, IImmutablePresentationNotes>
  >;
  questions?: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IQuestion>>
  >;
  postQuestions?: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IQuestion>>
  >;
  lectureQuestions?: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IUserQuestion>>
  >;
}

export interface IImmutablePresentationData
  extends IImmutableObject<IImmutablePresentationDataProps> {}
