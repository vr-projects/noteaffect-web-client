import PresentationState from "../PresentationState";
import * as Immutable from "immutable";
import { IPresentedSlide, IImumutablePresentedSlide } from "./IPresentedSlide";
import IImmutableObject from "./IImmutableObject";

export interface IPresentedData {
  state: PresentationState;
  totalSlides: number;
  currentSlide: number;
  userSlide: number;
  lectureId: number;
  presentedSlides:
    | IPresentedSlide[]
    | Immutable.List<IImumutablePresentedSlide>;
}

export interface IImmutablePresentedData extends IPresentedData {
  presentedSlides: Immutable.List<IImumutablePresentedSlide>;
}

export interface IImmutablePresentedDataMap
  extends IImmutableObject<IImmutablePresentedData> {}
