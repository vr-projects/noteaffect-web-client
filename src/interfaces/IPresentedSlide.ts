import IImmutableObject from "./IImmutableObject";
import * as Immutable from "immutable";

export interface IPresentedSlide {
  id: number;
  slide: number;
  sequence: number;
  imageUrl: string;
  unansweredPoll?: boolean;
}

export interface IImumutablePresentedSlide
  extends IImmutableObject<IPresentedSlide> {}
