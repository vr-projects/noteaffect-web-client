import IQuestionOptionType from './IQuestionOptionType';

export default interface IQuestionOption {
  id?: number;
  label?: string;
  correct?: boolean;
  required: boolean;
  type: IQuestionOptionType;
}
