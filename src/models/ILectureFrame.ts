export default interface ILectureFrame {
  id: number;
  lectureId: number;
  slide: number;
  sequence: number;
  imageUrl: string;
  presented: number;
  application: string;
  context: string;
  unansweredPoll: boolean;
}
