import PresentationActionTypes from './PresentationActionTypes';
import PresentationState from '../../PresentationState';
import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import PresentationData from '../../utilities/PresentationData';
import PresentationNotesUtil from '../../utilities/PresentationNotesUtil';
import DrawableSurfaceActionTypes from '../drawable_surface/DrawableSurfaceActionTypes';
import { IPresentedSlide } from '../../interfaces/IPresentedSlide';
import { IPresentationNotes } from '../../interfaces/IPresentedNotes';
import IQuestion from '../../models/IQuestion';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import * as SecurityActions from '../security/SecurityActions';
import SecurityAppApiService from '../../api/SecurityAppApiService';

export function updateUserSlide(
  courseId: number,
  lectureId: number,
  slideNumber: number
) {
  return async (dispatch, getState) => {
    const data = PresentationData.mappedDataFor(
      courseId,
      getState().presentation.presentedData
    );
    const presented = data
      .get(courseId.toString())
      .set('userSlide', slideNumber);
    const currentSlide = data.get(courseId.toString()).get('currentSlide');
    const drawable = (slideNumber || currentSlide || 0) !== 0;

    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: drawable,
    });

    dispatch({
      type: PresentationActionTypes.ChangePresentationData,
      value: data.set(courseId.toString(), presented),
    });

    // ** communicate with Security App /setMonitoring
    const securityAppPostPayload = SecurityAppApiService.prepSecurityAppPayloadForPresentations(
      courseId,
      lectureId,
      slideNumber,
      true
    );

    dispatch(
      SecurityActions.notifySecurityAppSlideChanged(securityAppPostPayload)
    );
    // ** communicate with Security App /setMonitoring ^^^
  };
}

export function updatePostUserSlide(
  courseId: number,
  lectureId: number,
  slideNumber: number
) {
  return async (dispatch, getState) => {
    let data = PresentationData.mappedDataFor(
      courseId,
      getState().presentation.postPresentedData
    );

    let presented = data.get(courseId.toString()).set('userSlide', slideNumber);
    let currentSlide = data.get(courseId.toString()).get('currentSlide');
    let drawable = (slideNumber || currentSlide || 0) !== 0;

    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: drawable,
    });

    dispatch({
      type: PresentationActionTypes.ChangePostPresentationData,
      value: data.set(courseId.toString(), presented),
    });

    // ** communicate with Security App /setMonitoring
    const securityAppPostPayload = SecurityAppApiService.prepSecurityAppPayloadForPresentations(
      courseId,
      lectureId,
      slideNumber,
      false
    );
    dispatch(
      SecurityActions.notifySecurityAppSlideChanged(securityAppPostPayload)
    );
    // ** communicate with Security App /setMonitoring ^^^
  };
}

export function updatePostCurrentSlide(
  courseId: number,
  lectureId: number,
  slideNumber: number
) {
  return async (dispatch, getState) => {
    let data = PresentationData.mappedDataFor(
      courseId,
      getState().presentation.postPresentedData
    );
    let presented = data.get(courseId.toString());
    let originalCurrentSlide = presented.get('currentSlide');
    presented = presented.set('currentSlide', slideNumber);
    let isDrawing = getState().drawableSurface.isDrawing === true;
    let userSlide = presented.get('userSlide');
    if (!userSlide && originalCurrentSlide !== slideNumber && isDrawing) {
      presented = presented.set('userSlide', originalCurrentSlide);
      userSlide = originalCurrentSlide;
    }
    let drawable = (userSlide || slideNumber || 0) !== 0;

    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: drawable,
    });
    dispatch({
      type: PresentationActionTypes.ChangePostPresentationData,
      value: data.set(courseId.toString(), presented),
    });

    // ** communicate with Security App /setMonitoring
    const securityAppPostPayload = SecurityAppApiService.prepSecurityAppPayloadForPresentations(
      courseId,
      lectureId,
      slideNumber,
      false
    );
    dispatch(
      SecurityActions.notifySecurityAppSlideChanged(securityAppPostPayload)
    );
    // ** communicate with Security App /setMonitoring ^^^
  };
}

export function updatePresentation(
  options: {
    courseId: number;
    lectureId: number;
    totalSlides: number;
    state?: PresentationState;
  } & IPresentedSlide
) {
  return async (dispatch, getState) => {
    let data = PresentationData.mappedDataFor(
      options.courseId,
      getState().presentation.presentedData,
      { totalSlides: options.totalSlides, slide: options.slide }
    );

    let currentLecture = PresentationData.currentLectureId(
      options.courseId,
      data
    );

    let originalCurrentSlide = null;

    if (currentLecture && options.lectureId !== currentLecture) {
      await dispatch(resetLivePresentation(options.courseId));

      data = PresentationData.mappedDataFor(
        options.courseId,
        getState().presentation.presentedData,
        { totalSlides: options.totalSlides, slide: options.slide }
      );

      originalCurrentSlide = options.slide;
    }

    let isDrawing = getState().drawableSurface.isDrawing === true;
    let presentedData = data.get(options.courseId.toString());

    if (originalCurrentSlide === null) {
      originalCurrentSlide = presentedData.get('currentSlide');
    }

    presentedData = presentedData.set('currentSlide', options.slide);
    presentedData = presentedData.set('lectureId', options.lectureId);

    if (options.state) {
      presentedData = presentedData.set('state', options.state);
    }

    let slideData = presentedData.get('presentedSlides');
    let slide = slideData.find(
      (d) =>
        d.get('slide') === options.slide &&
        d.get('sequence') === options.sequence &&
        d.get('imageUrl') === options.imageUrl
    );

    if (!slide) {
      presentedData = presentedData.set(
        'presentedSlides',
        slideData.push(
          Immutable.Map<keyof IPresentedSlide, any>({
            slide: options.slide,
            id: options.id,
            sequence: options.sequence,
            imageUrl: options.imageUrl,
          })
        )
      );
    }

    let userSlide = presentedData.get('userSlide');

    if (!userSlide && originalCurrentSlide !== options.slide && isDrawing) {
      presentedData = presentedData.set('userSlide', originalCurrentSlide);
      userSlide = originalCurrentSlide;
    }

    let drawable = (userSlide || options.slide || 0) !== 0;

    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: drawable,
    });

    dispatch({
      type: PresentationActionTypes.ChangePresentationData,
      value: data.set(options.courseId.toString(), presentedData),
    });
  };
}

export function updatePostPresentation(
  options: {
    courseId: number;
    lectureId: number;
    currentUserId: number;
    totalSlides: number;
    state?: PresentationState;
    initialSlide?: number;
  } & IPresentedSlide
) {
  return async (dispatch, getState) => {
    let data = PresentationData.mappedDataFor(
      options.courseId,
      getState().presentation.postPresentedData,
      { totalSlides: options.totalSlides, slide: options.slide }
    );
    let currentLecture = PresentationData.currentLectureId(
      options.courseId,
      data
    );
    let originalCurrentSlide = null;

    if (currentLecture && options.lectureId !== currentLecture) {
      await dispatch(
        resetPostPresentation(options.courseId, options.currentUserId)
      );
      data = PresentationData.mappedDataFor(
        options.courseId,
        getState().presentation.postPresentedData,
        { totalSlides: options.totalSlides, slide: options.slide }
      );
      originalCurrentSlide = options.slide;
    }

    let isDrawing = getState().drawableSurface.isDrawing === true;
    let presentedData = data.get(options.courseId.toString());

    if (originalCurrentSlide === null) {
      originalCurrentSlide = presentedData.get('currentSlide');
    }

    presentedData = presentedData.set(
      'currentSlide',
      options.initialSlide || 1
    );
    presentedData = presentedData.set('lectureId', options.lectureId);

    if (options.state) {
      presentedData = presentedData.set('state', options.state);
    }

    let slideData = presentedData.get('presentedSlides');
    let slideIndex = slideData.findIndex(
      (d) =>
        d.get('slide') === options.slide &&
        d.get('sequence') === options.sequence &&
        d.get('imageUrl') === options.imageUrl
    );

    if (slideIndex === -1) {
      presentedData = presentedData.set(
        'presentedSlides',
        slideData.push(
          Immutable.Map<keyof IPresentedSlide, any>({
            slide: options.slide,
            id: options.id,
            sequence: options.sequence,
            imageUrl: options.imageUrl,
            unansweredPoll: options.unansweredPoll,
          })
        )
      );
    } else {
      let slide = slideData.toArray()[slideIndex];
      slide = slide.set('unansweredPoll', options.unansweredPoll);
      slideData = slideData.set(slideIndex, slide);
      presentedData = presentedData.set('presentedSlides', slideData);
    }

    let userSlide = presentedData.get('userSlide');

    if (!userSlide && originalCurrentSlide !== options.slide && isDrawing) {
      presentedData = presentedData.set('userSlide', originalCurrentSlide);
      userSlide = originalCurrentSlide;
    }

    let drawable = (userSlide || options.slide || 0) !== 0;

    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: drawable,
    });

    dispatch({
      type: PresentationActionTypes.ChangePostPresentationData,
      value: data.set(options.courseId.toString(), presentedData),
    });
  };
}

export function updatePostPresentationCurrentSlide(ops: {
  courseId: number;
  lectureId: number;
  currentSlide: number;
}) {
  return async (dispatch, getState) => {
    let data = PresentationData.mappedDataFor(
      ops.courseId,
      getState().presentation.postPresentedData
    );
    let isDrawing = getState().drawableSurface.isDrawing === true;
    let presentedData = data.get(ops.courseId.toString());
    let originalCurrentSlide = presentedData.get('currentSlide');
    presentedData = presentedData.set('currentSlide', ops.currentSlide);
    presentedData = presentedData.set('lectureId', ops.lectureId);
    let userSlide = presentedData.get('userSlide');
    if (!userSlide && originalCurrentSlide !== ops.currentSlide && isDrawing) {
      presentedData = presentedData.set('userSlide', originalCurrentSlide);
      userSlide = originalCurrentSlide;
    }
    let drawable = (userSlide || ops.currentSlide || 0) !== 0;

    dispatch({
      type: DrawableSurfaceActionTypes.ChangeDrawingEnabled,
      value: drawable,
    });
    dispatch({
      type: PresentationActionTypes.ChangePostPresentationData,
      value: data.set(ops.courseId.toString(), presentedData),
    });
  };
}

export function updateNotesData(options: {
  seriesId: number;
  lectureId: number;
  slide: number;
  notesData: IPresentationNotes; // TODO notesData
}) {
  return async (dispatch, getState) => {
    const state = getState();

    let notesData = PresentationNotesUtil.updatedNotesForSlide(
      options.seriesId,
      options.slide,
      options.notesData,
      state.presentation.notesData,
      false
    );

    notesData.course = notesData.course.set(
      options.slide.toString(),
      notesData.slide
    );

    if (state.presentation.remoteUpdateEnabled) {
      PresentationNotesUtil.saveToRemote(options);
    }

    dispatch({
      type: PresentationActionTypes.SetPresentationNotes,
      value: notesData.data.set(options.seriesId.toString(), notesData.course),
    });
  };
}

export function setPostNotesDataToStore(options: {
  seriesId: number;
  lectureId: number;
  slide: number;
  notesData: IPresentationNotes;
  authorUserId?: number;
  currentUserId?: number;
}) {
  return async (dispatch, getState) => {
    const state = getState();
    const isSharedNote = options.authorUserId !== options.currentUserId;

    let notesData = PresentationNotesUtil.updatedNotesForSlide(
      options.seriesId,
      options.slide,
      options.notesData,
      state.presentation.postNotesData,
      isSharedNote
    );

    notesData.course = notesData.course.set(
      options.slide.toString(),
      notesData.slide
    );

    if (state.presentation.remoteUpdateEnabled) {
      PresentationNotesUtil.saveToRemote(options);
    }

    const newStoreStateValue = notesData.data.set(
      options.seriesId.toString(),
      notesData.course
    );

    // Setting API transformed values to the store
    dispatch({
      type: PresentationActionTypes.SetPostPresentationNotes,
      value: newStoreStateValue,
    });
  };
}

export function updatePostNotesData(options: {
  seriesId: number;
  lectureId: number;
  slide: number;
  notesData: IPresentationNotes;
}) {
  return async (dispatch, getState) => {
    const state = getState();

    let notesData = PresentationNotesUtil.updatedNotesForSlide(
      options.seriesId,
      options.slide,
      options.notesData,
      state.presentation.postNotesData
    );

    notesData.course = notesData.course.set(
      options.slide.toString(),
      notesData.slide
    );

    if (state.presentation.remoteUpdateEnabled) {
      PresentationNotesUtil.saveToRemote(options);
    }

    const newStoreStateValue = notesData.data.set(
      options.seriesId.toString(),
      notesData.course
    );

    dispatch({
      type: PresentationActionTypes.SetPostPresentationNotes,
      value: newStoreStateValue,
    });
  };
}

export function updateUiContainer(container: HTMLDivElement) {
  return async (dispatch, _) => {
    dispatch({
      type: PresentationActionTypes.ChangeUiContainer,
      value: container,
    });
  };
}

export function receivedQuestion(question: IQuestion) {
  return async (dispatch) => {
    if (question.seriesId && question.lectureId) {
      question.available = true;
      dispatch({
        type: PresentationActionTypes.ReceivedQuestion,
        value: question,
      });
    }
  };
}

export function markQuestionUnavailable(question: IQuestion) {
  return async (dispatch, getState) => {
    if (question.seriesId && question.lectureId && question.lectureQuestionId) {
      question.available = false;
      let questionMap = getState().presentation.questions as Immutable.Map<
        string,
        Immutable.List<IImmutableObject<IQuestion>>
      >;
      const id = question.seriesId.toString();
      let questions = questionMap.get(id);
      var index = questions.findIndex(
        (q) => q.get('lectureQuestionId') === question.lectureQuestionId
      );
      if (index !== -1) {
        questions = questions.update(index, (v) => Immutable.fromJS(question));
        questionMap = questionMap.set(id, questions);
        dispatch({
          type: PresentationActionTypes.UpdateQuestions,
          value: questionMap,
        });
      }
    }
  };
}

export function receivedPostQuestion(question: IQuestion) {
  return async (dispatch, getState) => {
    if (question.seriesId && question.lectureId) {
      let questionMap = getState().presentation.postQuestions as Immutable.Map<
        string,
        Immutable.List<IImmutableObject<IQuestion>>
      >;
      const id = question.seriesId.toString();
      let questions = questionMap.get(id, Immutable.List());
      var index = questions.findIndex(
        (q) => q.get('lectureQuestionId') === question.lectureQuestionId
      );
      if (index === -1) {
        question.available = true;
        dispatch({
          type: PresentationActionTypes.ReceivedPostQuestion,
          value: question,
        });
      }
    }
  };
}

export function markPostQuestionUnavailable(question: IQuestion) {
  return async (dispatch, getState) => {
    if (question.seriesId && question.lectureId && question.lectureQuestionId) {
      question.available = false;
      let questionMap = getState().presentation.postQuestions as Immutable.Map<
        string,
        Immutable.List<IImmutableObject<IQuestion>>
      >;
      const id = question.seriesId.toString();
      let questions = questionMap.get(id);
      var index = questions.findIndex(
        (q) => q.get('lectureQuestionId') === question.lectureQuestionId
      );
      if (index !== -1) {
        questions = questions.update(index, (v) => Immutable.fromJS(question));
        questionMap = questionMap.set(id, questions);
        dispatch({
          type: PresentationActionTypes.UpdatePostQuestions,
          value: questionMap,
        });
      }
    }
  };
}

export function setRemoteNoteUpdatesEnabled(enabled: boolean) {
  return async (dispatch) => {
    dispatch({
      type: PresentationActionTypes.RemoteUpdateEnabled,
      value: enabled,
    });
  };
}

export function resetLivePresentation(
  courseId: number,
  currentSlide?: number,
  totalSlides?: number
) {
  return async (dispatch, getState) => {
    const state = getState();

    let notesData = PresentationNotesUtil.mappedNotesStateData(
      courseId,
      state.presentation.notesData
    );

    notesData = notesData.set(
      courseId.toString(),
      Immutable.Map<string, any>()
    );

    dispatch({
      type: PresentationActionTypes.SetPresentationNotes,
      value: notesData,
    });

    let data = PresentationData.mappedDataFor(
      courseId,
      state.presentation.presentedData
    );

    data = data.set(
      courseId.toString(),
      Immutable.Map<string, any>({
        totalSlides: totalSlides || 0,
        currentSlide: currentSlide || 0,
        presentedSlides: Immutable.List<IImmutablePresentedDataMap>(),
      })
    );

    dispatch({
      type: PresentationActionTypes.ChangePresentationData,
      value: data,
    });
  };
}

export function resetPostPresentation(
  courseId: number,
  currentSlide?: number,
  totalSlides?: number
) {
  return async (dispatch, getState) => {
    const state = getState();

    let notesData = PresentationNotesUtil.mappedNotesStateData(
      courseId,
      state.presentation.postNotesData
    );

    notesData = notesData.set(
      courseId.toString(),
      Immutable.Map<string, any>()
    );
    dispatch({
      type: PresentationActionTypes.SetPostPresentationNotes,
      value: notesData,
    });
    dispatch({
      type: PresentationActionTypes.UpdatePostQuestions,
      value: Immutable.Map(),
    });

    let data = PresentationData.mappedDataFor(
      courseId,
      state.presentation.postPresentedData
    );

    data = data.set(
      courseId.toString(),
      Immutable.Map<string, any>({
        totalSlides: totalSlides || 0,
        currentSlide: currentSlide || 0,
        presentedSlides: Immutable.List<IImmutablePresentedDataMap>(),
      })
    );

    dispatch({
      type: PresentationActionTypes.ChangePostPresentationData,
      value: data,
    });
  };
}

export function setIsOnLivePresentationView(isOnLivePresentationView) {
  return async (dispatch, state) => {
    dispatch({
      type: PresentationActionTypes.SetIsOnLivePresentationView,
      value: isOnLivePresentationView,
    });
  };
}
