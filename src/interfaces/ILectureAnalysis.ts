import IAnalysisRates from "./IAnalysisRates";
import ISlideAnalysis from "./ISlideAnalysis";

export default interface ILectureAnalysis {
  lectureId: number;
  totalSlides: number;
  uniqueSlideViews: number;
  notesTaken: number;
  totalWords: number;
  questionsAsked: number;
  participatingUsers: number;
  questionsAnswered: number;
  questionsNotAnswered: number;
  questionsMissed: number;
  meanWordsPerNote: number;
  meanNotesPerSlideView: number;
  meanWordsPerSlideView: number;
  meanAnnotationsPerSlideView: number;
  annotatationsMade: number;
  activeUsers: number;
  rates: IAnalysisRates;
  slideAnalyses: ISlideAnalysis[];
}
