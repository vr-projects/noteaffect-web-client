import QuestionsActionTypes from './QuestionsActionTypes';
import QuestionsRecord from './QuestionsRecord';

const initialState = new QuestionsRecord();
export default function questionsReducer(
  state: QuestionsRecord = initialState,
  action: any = {}
) {
  switch (action.type as QuestionsActionTypes) {
    case QuestionsActionTypes.SetQuestions:
      return state.with({ questions: action.value });
    case QuestionsActionTypes.SetOptions:
      return state.with({ options: action.value });
    case QuestionsActionTypes.SetCreating:
      return state.with({ questionCreating: action.value });
    case QuestionsActionTypes.SetLoading:
      return state.with({ questionDataLoading: action.value });
    case QuestionsActionTypes.SetShowCreator:
      return state.with({ showCreator: action.value });
    case QuestionsActionTypes.SetTypes:
      return state.with({ types: action.value });
    case QuestionsActionTypes.SetQuestionForAdd:
      return state.with({ questionForAdd: action.value });
    case QuestionsActionTypes.SetViewTypes:
      return state.with({ viewTypes: action.value });
    case QuestionsActionTypes.SetQuestionForPreview:
      return state.with({ questionForPreview: action.value });
    default:
      return state;
  }
}

export function getQuestions(state) {
  return state.questions.questions;
}

export function getOptions(state) {
  return state.questions.options;
}

export function getTypes(state) {
  return state.questions.types;
}

export function getLoading(state) {
  return state.questions.questionDataLoading;
}

export function getCreating(state) {
  return state.questions.questionCreating;
}

export function getShowCreator(state) {
  return state.questions.showCreator;
}

export function getQuestionForAdd(state) {
  return state.questions.questionForAdd;
}

export function getQuestionForPreview(state) {
  return state.questions.questionForPreview;
}

export function getQuestionViewTypes(state) {
  return state.questions.viewTypes;
}
