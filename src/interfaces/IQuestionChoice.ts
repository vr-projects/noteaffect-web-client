export default interface IQuestionChoice {
  id(): number;
  selected(): boolean;
  value(): string;
}
