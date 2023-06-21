import * as Immutable from "immutable";
import { DispatchProp } from "react-redux";
import { LoadStates } from "react-strontium";
import IImmutableObject from "./IImmutableObject";
import IQuestionViewType from "../models/IQuestionViewType";

export default interface IQuestionCreatorProps extends DispatchProp<any> {
  showCreator?: boolean;
  options?: Immutable.List<Immutable.Map<string, any>>;
  types?: Immutable.List<Immutable.Map<string, any>>;
  viewTypes?: Immutable.List<IImmutableObject<IQuestionViewType>>;
  creating: LoadStates;
}
