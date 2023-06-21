import * as Immutable from 'immutable';
import { LoadStates } from 'react-strontium';
import IImmutableObject from '../../interfaces/IImmutableObject';
import ICourse from '../../models/ICourse';
import IPeriod from '../../models/IPeriod';
import IDepartment from '../../models/IDepartment';

interface IAdminState {
  series?: Immutable.List<IImmutableObject<ICourse>>;
  periods?: Immutable.List<IImmutableObject<IPeriod>>;
  departments?: Immutable.List<IImmutableObject<IDepartment>>;
  adminLoading?: LoadStates;
}

const defaultProps = {
  menu: null,
  series: Immutable.List(),
  periods: Immutable.List(),
  departments: Immutable.List(),
  adminLoading: LoadStates.Unloaded,
};

export default class AppRecord extends Immutable.Record(defaultProps) {
  constructor(params?: IAdminState) {
    params ? super(params) : super();
  }

  get<T extends keyof IAdminState>(value: T): IAdminState[T] {
    return super.get(value);
  }

  with(values: IAdminState) {
    return this.merge(values) as this;
  }
}
