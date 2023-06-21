import ILectureOverview from './ILectureOverview';

export default interface IStudentOverview {
  seriesId: number;
  userId: number;
  lectureOverviews: ILectureOverview[];
  slides: number;
  slidesViewed: number;
  slidesNoted: number;
  slidesAnnotated: number;
  questionsAnswered: number;
  questionsNotAnswered: number;
  questionsMissed: number;
  viewedPercentile: number;
  notedPercentile: number;
  annotatedPercentile: number;
  questionsAnsweredPercentile: number;
  participated: boolean;
}
