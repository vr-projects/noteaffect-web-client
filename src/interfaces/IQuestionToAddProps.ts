import { DispatchProp } from "react-redux";
import IImmutableObject from "./IImmutableObject";
import IQuestion from "../models/IQuestion";

export default interface QuestionToAddProps extends DispatchProp<any> {
  question?: IImmutableObject<IQuestion>;
}
