import { DispatchProp } from "react-redux";
import { LoadStates } from "react-strontium";
import * as Immutable from "immutable";
import IUserPermissions from "./IUserPermissions";
import IImmutableObject from "./IImmutableObject";
import ICourse from "../models/ICourse";

export default interface IInstructorCoursesProps extends DispatchProp<any> {
  params: any;
  loading?: LoadStates;
  userPermissions?: IImmutableObject<IUserPermissions>;
  courses?: Immutable.List<IImmutableObject<ICourse>>;
}
