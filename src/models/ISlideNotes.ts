export default interface ISlideNotes {
  id: number;
  firstName: string;
  lastName: string;
  userId: number;
  lectureId: number;
  slide: number;
  sharedNote: boolean;
  annotations: string;
  notes: string;
}
