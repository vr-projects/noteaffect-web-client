import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import ICourse from '../../models/ICourse';
import { LoadStates } from 'react-strontium';

interface ICoursesReduxState {
  courses?: Immutable.List<IImmutableObject<ICourse>>;
  coursesLoading?: LoadStates;
  currentCourse?: Immutable.Map<string, any>;
  lastFetched?: number;
}

const defaultProps = {
  courses: Immutable.List<IImmutableObject<ICourse>>(),
  coursesLoading: LoadStates.Unloaded,
  currentCourse: Immutable.Map<string, any>(),
  lastFetched: 0,
};

export default class CoursesRecord extends Immutable.Record(defaultProps) {
  constructor(params?: ICoursesReduxState) {
    params ? super(params) : super();
  }

  get<T extends keyof ICoursesReduxState>(value: T): ICoursesReduxState[T] {
    return super.get(value);
  }

  with(values: ICoursesReduxState) {
    return this.merge(values) as this;
  }
}
