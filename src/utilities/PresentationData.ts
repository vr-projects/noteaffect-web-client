import * as Immutable from 'immutable';
import { IImmutablePresentedDataMap } from '../interfaces/IPresentedData';
import {
  IImumutablePresentedSlide,
  IPresentedSlide,
} from '../interfaces/IPresentedSlide';

type ImmutablePresData = Immutable.Map<string, IImmutablePresentedDataMap>;

export default class PresentationData {
  public static getSlideNumber(courseId: number, presData: ImmutablePresData) {
    const data = this.currentData(courseId, presData);
    const slideNumber = data
      ? data.get('userSlide') || data.get('currentSlide') || 0
      : 0;

    return slideNumber;
  }

  public static currentData(
    courseId: number,
    data: ImmutablePresData
  ): IImmutablePresentedDataMap {
    const id = courseId.toString();
    let currentData = data.get(id);
    if (!currentData || currentData.isEmpty()) {
      return null;
    }
    return currentData;
  }

  public static lastCurrentSlide(
    courseId: number,
    data: ImmutablePresData,
    allowEmpty: boolean = true
  ): IImumutablePresentedSlide {
    let currentData = this.currentData(courseId, data);
    if (!currentData) {
      return null;
    }

    let currentSlide = currentData.get('currentSlide');
    let results = currentData
      .get('presentedSlides')
      .filter((s) => s.get('slide') === currentSlide)
      .sortBy((s) => s.get('sequence'));
    if (!allowEmpty) {
      results = results.filter((s) => !!s.get('imageUrl'));
    }
    return results.last();
  }

  public static lastUserSlide(
    courseId: number,
    data: ImmutablePresData,
    allowEmpty: boolean = true
  ): IImumutablePresentedSlide {
    let currentData = this.currentData(courseId, data);
    if (!currentData) {
      return null;
    }

    let currentSlide = currentData.get('userSlide');
    let results = currentData
      .get('presentedSlides')
      .filter((s) => s.get('slide') === currentSlide)
      .sortBy((s) => s.get('sequence'));
    if (!allowEmpty) {
      results = results.filter((s) => !!s.get('imageUrl'));
    }
    return results.last();
  }

  public static mappedDataFor(
    courseId: number,
    data: ImmutablePresData,
    ops?: { totalSlides: number; slide: number }
  ) {
    const id = courseId.toString();
    if (!data || data.isEmpty() || !data.get(id)) {
      data = data.set(
        id,
        Immutable.Map<string, any>({
          totalSlides: ops && ops.totalSlides ? ops.totalSlides : 0,
          currentSlide: ops && ops.slide ? ops.slide : 0,
          presentedSlides: Immutable.List<IImmutablePresentedDataMap>(),
        })
      );
    }
    return data;
  }

  public static maxAllowedSlide(
    courseId: number,
    data: ImmutablePresData
  ): number {
    const currentData = this.currentData(courseId, data);

    if (!currentData) {
      return null;
    }

    const slides = currentData.get('presentedSlides');

    if (!slides || slides.isEmpty()) {
      return 0;
    }

    return (slides.toJS() as IPresentedSlide[])
      .map((s) => s.slide)
      .reduce((p, c) => Math.max(p, c));
  }

  public static currentUserSlide(courseId: number, data: ImmutablePresData) {
    const currentData = this.currentData(courseId, data);

    return currentData
      ? currentData.get('userSlide') || currentData.get('currentSlide') || 0
      : 0;
  }

  public static currentLectureId(courseId: number, data: ImmutablePresData) {
    const currentData = this.currentData(courseId, data);

    return currentData && currentData.count() > 0
      ? currentData.get('lectureId')
      : null;
  }
}
