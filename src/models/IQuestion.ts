import IQuestionOption from './IQuestionOption';
import IQuestionType from './IQuestionType';
import IQuestionViewType from './IQuestionViewType';

export default interface IQuestion {
  id?: number;
  title: string;
  question: string;
  type: IQuestionType;
  options: IQuestionOption[];
  seriesId?: number;
  lectureId?: number;
  slide?: number;
  available?: boolean;
  viewType?: IQuestionViewType;
  lectureQuestionId?: number;
}
