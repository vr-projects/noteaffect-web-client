import ISlideTransition from './ISlideTransition';

export default interface IPresentation {
  id: number;
  courseId: number;
  started: number;
  ended: number;
  slides: number;
  slideData: ISlideTransition[];
}
