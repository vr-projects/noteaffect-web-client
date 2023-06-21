import { DispatchProp } from "react-redux";
import IImmutableObject from "./IImmutableObject";
import IQuestion from "../models/IQuestion";

export default interface QuestionToPreviewProps extends DispatchProp<any> {
  question?: IImmutableObject<IQuestion>;
}
