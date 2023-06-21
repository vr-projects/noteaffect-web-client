import { DispatchProp } from "react-redux";
import { LoadStates } from "react-strontium";
import * as Immutable from "immutable";
import IUserPermissions from "./IUserPermissions";
import IImmutableObject from "./IImmutableObject";

export default interface IQuestionBuilderProps extends DispatchProp<any> {
  menu: string;
  loading?: LoadStates;
  creating?: LoadStates;
  questions?: Immutable.List<Immutable.Map<string, any>>;
  options?: Immutable.List<Immutable.Map<string, any>>;
  userPermissions?: IImmutableObject<IUserPermissions>;
}
