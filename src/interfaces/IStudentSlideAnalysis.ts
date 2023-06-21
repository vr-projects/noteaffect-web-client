export default interface IStudentSlideAnalysis {
  slide: number;
  totalViews: number;
  firstViewed: number;
  noteWords: number;
  annotations: number;
  pollAsked: boolean;
  pollAnswered: boolean;
  questionAsked: boolean;
}
