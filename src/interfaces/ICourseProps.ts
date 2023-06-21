import ICourse from '../models/ICourse';
import IImmutableObject from './IImmutableObject';
import { LoadStates } from 'react-strontium';
import { DispatchProp } from 'react-redux';
import IUserPermissions from './IUserPermissions';

export default interface ICoursesProps extends DispatchProp<any> {
  id: number;
  menu: string;
  lecture: string;
  user?: string;
  userPermissions?: IImmutableObject<IUserPermissions>;
  course?: IImmutableObject<ICourse>;
  coursesLoading?: LoadStates;
  query?: any;
}
