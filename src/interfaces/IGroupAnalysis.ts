import IAnalysisRates from "./IAnalysisRates";
import ISeriesAnalysis from "./ISeriesAnalysis";

export default interface IGroupAnalysis {
  groupType: string;
  groupId: string;
  empty: boolean;
  totalSlides: number;
  uniqueSlideViews: number;
  notesTaken: number;
  totalWords: number;
  questionsAsked: number;
  meanWordsPerNote: number;
  annotatationsMade: number;
  meanNotesPerLecture: number;
  meanWordsPerLecture: number;
  meanAnnotationsPerLecture: number;
  rates: IAnalysisRates;
  lecturesWithSlides: number;
  seriesData: ISeriesAnalysis[];
}
