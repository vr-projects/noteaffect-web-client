import IAnalysisRates from './IAnalysisRates';
import ILectureAnalysis from './ILectureAnalysis';
import IDocumentAnalysis from './IDocumentAnalysis';

export default interface ISeriesAnalysis {
  annotatationsMade: number;
  documentAnalyses: IDocumentAnalysis[]; // TODO confirm interface
  documentAnnotationsMade: number;
  documentNotesTaken: number;
  documentUniqueViews: number;
  documents: 0;
  filter: string;
  lectureAnalyses: ILectureAnalysis[];
  lecturesWithSlides: number;
  meanAnnotationsPerLecture: number;
  meanNotesPerLecture: number;
  meanWordsPerLecture: number;
  meanWordsPerNote: number;
  notesTaken: number;
  questionsAsked: number;
  rates: IAnalysisRates;
  seriesId: number;
  totalSlides: number;
  totalWords: number;
  uniqueSlideViews: number;
}
