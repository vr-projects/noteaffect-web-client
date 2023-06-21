import IStudentSlideAnalysis from "./IStudentSlideAnalysis";

export default interface ILectureOverview {
  lectureId: number;
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
  activeUser: boolean;
  slideDetails: IStudentSlideAnalysis[];
}
