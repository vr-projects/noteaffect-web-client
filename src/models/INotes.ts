import ISlideNote from './ISlideNote';

export default interface INotes {
  courseId: number;
  presentationId: number;
  slideNotes: ISlideNote[];
}
