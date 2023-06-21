import ILectureFrame from './ILectureFrame';

export default interface ILecture {
  id?: number;
  started?: number;
  ended?: number;
  slides?: number;
  slideData?: ILectureFrame[];
  name?: string;
  seriesId?: number;
  audioUrl?: string;
  audioShared?: boolean;
}
