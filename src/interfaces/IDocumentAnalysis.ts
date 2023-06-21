export interface IDocumentPageAnalysis {
  pageNumber: number;
  documentPageUniqueViews: number;
  documentPageNotesTaken: number;
  documentPageAnnotationsMade: number;
}

interface IDocumentAnalysis {
  userFileId: number;
  documentUniqueViews: number;
  documentNotesTaken: number;
  documentAnnotationsMade: number;
  documentPageAnalyses: IDocumentPageAnalysis[];
}

export default IDocumentAnalysis;
