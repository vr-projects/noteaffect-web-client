import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import { IImmutablePresentationDataProps } from '../../interfaces/IPresentationDataProps';
import IQuestion from '../../models/IQuestion';

const defaultProps: IImmutablePresentationDataProps = {
  presentedData: Immutable.Map<string, any>(),
  postPresentedData: Immutable.Map<string, any>(),
  notesData: Immutable.Map<string, any>(),
  postNotesData: Immutable.Map<string, any>(),
  uiContainer: null,
  questions: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IQuestion>>
  >(),
  postQuestions: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IQuestion>>
  >(),
  remoteUpdateEnabled: true,
  isOnLivePresentationView: false,
};

export default class PresentationRecord extends Immutable.Record(defaultProps) {
  constructor(params?: IImmutablePresentationDataProps) {
    params ? super(params) : super();
  }

  get<T extends keyof IImmutablePresentationDataProps>(
    value: T
  ): IImmutablePresentationDataProps[T] {
    return super.get(value);
  }

  with(values: IImmutablePresentationDataProps) {
    return this.merge(values) as this;
  }
}
