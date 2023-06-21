import PresentationActionTypes from './PresentationActionTypes';
import PresentationRecord from './PresentationRecord';
import IQuestion from '../../models/IQuestion';
import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';

const initialState = new PresentationRecord();
export default function presentationReducer(
  state: PresentationRecord = initialState,
  action: any = {}
) {
  switch (action.type as PresentationActionTypes) {
    case PresentationActionTypes.ChangePresentationData:
      return state.with({ presentedData: action.value });
    case PresentationActionTypes.ChangePostPresentationData:
      return state.with({ postPresentedData: action.value });
    case PresentationActionTypes.SetPresentationNotes:
      return state.with({ notesData: action.value });
    case PresentationActionTypes.ChangeUiContainer:
      return state.with({ uiContainer: action.value });
    case PresentationActionTypes.SetPostPresentationNotes:
      return state.with({ postNotesData: action.value });
    case PresentationActionTypes.ReceivedQuestion:
      let questionMap = state.get('questions');
      let question = action.value as IQuestion;
      const id = question.seriesId.toString();
      if (!questionMap.has(id)) {
        questionMap = questionMap.set(
          id,
          Immutable.List<IImmutableObject<IQuestion>>()
        );
      }
      let questions = questionMap.get(id);
      questions = questions.push(Immutable.fromJS(question));
      questionMap = questionMap.set(id, questions);
      return state.with({ questions: questionMap });
    case PresentationActionTypes.ReceivedPostQuestion:
      let postQuestionsMap = state.get('postQuestions');
      let postQuestion = action.value as IQuestion;
      const postId = postQuestion.seriesId.toString();
      if (!postQuestionsMap.has(postId)) {
        postQuestionsMap = postQuestionsMap.set(
          postId,
          Immutable.List<IImmutableObject<IQuestion>>()
        );
      }
      let postQuestions = postQuestionsMap.get(postId);
      postQuestions = postQuestions.push(Immutable.fromJS(postQuestion));
      postQuestionsMap = postQuestionsMap.set(postId, postQuestions);
      return state.with({ postQuestions: postQuestionsMap });
    case PresentationActionTypes.UpdateQuestions:
      return state.with({ questions: action.value });
    case PresentationActionTypes.UpdatePostQuestions:
      return state.with({ postQuestions: action.value });
    case PresentationActionTypes.RemoteUpdateEnabled:
      return state.with({ remoteUpdateEnabled: action.value });
    case PresentationActionTypes.UpdateLectureQuestions:
      return state.with({ lectureQuestions: action.value });
    case PresentationActionTypes.SetIsOnLivePresentationView:
      return state.with({ isOnLivePresentationView: action.value });
    default:
      return state;
  }
}

export function getPresentedData(state) {
  return state.presentation.presentedData;
}

export function getPostPresentedData(state) {
  return state.presentation.postPresentedData;
}

export function getNotesData(state) {
  return state.presentation.notesData;
}

export function getPostNotesData(state) {
  return state.presentation.postNotesData;
}

export function getUiContainer(state) {
  return state.presentation.uiContainer;
}

export function getQuestions(state) {
  return state.presentation.questions;
}

export function getPostQuestions(state) {
  return state.presentation.postQuestions;
}

export function getRemoteUpdateEnabled(state) {
  return state.presentation.remoteUpdateEnabled;
}

export function getLectureQuestions(state) {
  return state.presentation.lectureQuestions;
}

export function getIsOnLivePresentationView(state) {
  return state.presentation.isOnLivePresentationView;
}
