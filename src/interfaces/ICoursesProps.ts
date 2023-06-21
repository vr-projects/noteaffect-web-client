import ICourse from "../models/ICourse";
import * as Immutable from "immutable";
import IImmutableObject from "./IImmutableObject";
import { LoadStates } from "react-strontium";
import { DispatchProp } from "react-redux";

export default interface ICoursesProps extends DispatchProp<any> {
  courses?: Immutable.List<IImmutableObject<ICourse>>;
  coursesLoading?: LoadStates;
}
