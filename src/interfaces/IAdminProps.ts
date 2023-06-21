import { LoadStates } from 'react-strontium';
import { DispatchProp } from 'react-redux';
import IImmutableObject from './IImmutableObject';
import ICourse from '../models/ICourse';
import * as Immutable from 'immutable';
import IPeriod from '../models/IPeriod';
import IDepartment from '../models/IDepartment';
import IUserPermissions from './IUserPermissions';

// TODO tech debt doesn't follow pattern, use IConnectedProps in each component
export default interface IAdminProps extends DispatchProp<any> {
  adminLoading?: LoadStates;
  series?: Immutable.List<IImmutableObject<ICourse>>;
  periods?: Immutable.List<IImmutableObject<IPeriod>>;
  departments?: Immutable.List<IImmutableObject<IDepartment>>;
  userPermissions?: IImmutableObject<IUserPermissions>;
}
