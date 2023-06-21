import * as Immutable from 'immutable';
import { LoadStates } from 'react-strontium';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import ICourse from '../../models/ICourse';
import IPeriod from '../../models/IPeriod';
import IDepartment from '../../models/IDepartment';
import IQuestion from '../../models/IQuestion';
import { IImumutablePresentedSlide } from '../../interfaces/IPresentedSlide';
import IQuestionViewType from '../../models/IQuestionViewType';

interface IQuestionRecord {
  questions?: Immutable.List<Immutable.Map<string, any>>;
  options?: Immutable.List<Immutable.Map<string, any>>;
  types?: Immutable.List<Immutable.Map<string, any>>;
  questionDataLoading?: LoadStates;
  questionCreating?: LoadStates;
  showCreator?: boolean;
  questionForAdd?: IImmutableObject<IQuestion>;
  questionForPreview?: IImmutableObject<IQuestion>;
  viewTypes?: Immutable.List<IImmutableObject<IQuestionViewType>>;
}

const defaultProps = {
  questions: Immutable.List(),
  options: Immutable.List(),
  types: Immutable.List(),
  questionDataLoading: LoadStates.Unloaded,
  questionCreating: LoadStates.Unloaded,
  showCreator: false,
  questionForAdd: Immutable.Map<string, any>(),
  questionForPreview: Immutable.Map<string, any>(),
  viewTypes: Immutable.List(),
};

export default class QuestionsRecord extends Immutable.Record(defaultProps) {
  constructor(params?: IQuestionRecord) {
    params ? super(params) : super();
  }

  get<T extends keyof IQuestionRecord>(value: T): IQuestionRecord[T] {
    return super.get(value);
  }

  with(values: IQuestionRecord) {
    return this.merge(values) as this;
  }
}
