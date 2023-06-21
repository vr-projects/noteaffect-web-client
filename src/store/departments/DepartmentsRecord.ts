import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import { LoadStates } from 'react-strontium';
import IDepartment from '../../models/IDepartment';
import IAdminTag from '../../models/IAdminTag';
import IPeriod from '../../models/IPeriod';

interface IDepartmentsReduxState {
  departments?: Immutable.List<IImmutableObject<IDepartment>>;
  tags?: Immutable.List<IImmutableObject<IAdminTag>>;
  periods?: Immutable.List<IImmutableObject<IPeriod>>;
  departmentsLoading?: LoadStates;
}

const defaultProps = {
  departments: Immutable.List(),
  departmentsLoading: LoadStates.Unloaded,
  tags: Immutable.List(),
  periods: Immutable.List(),
};

export default class DepartmentsRecord extends Immutable.Record(defaultProps) {
  constructor(params?: IDepartmentsReduxState) {
    params ? super(params) : super();
  }

  get<T extends keyof IDepartmentsReduxState>(
    value: T
  ): IDepartmentsReduxState[T] {
    return super.get(value);
  }

  with(values: IDepartmentsReduxState) {
    return this.merge(values) as this;
  }
}
