import IAnalysisRates from './IAnalysisRates';

export default interface ISlideAnalysis {
  slide: number;
  uniqueViews: number;
  notesTaken: number;
  totalWords: number;
  meanWordsPerNote: number;
  annotatationsMade: number;
  questionAsked: boolean;
  questionsAnswered: number;
  questionsNotAnswered: number;
  rates: IAnalysisRates;
}
