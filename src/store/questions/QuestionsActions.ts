import QuestionsActionTypes from './QuestionsActionTypes';
import { LoadStates, ApiHelpers, GeneralUtility } from 'react-strontium';
import IQuestion from '../../models/IQuestion';

export function loadData() {
  return async (dispatch, state) => {
    if (state.questionDataLoading === LoadStates.Loading) {
      return;
    }

    dispatch({
      type: QuestionsActionTypes.SetLoading,
      value: LoadStates.Loading,
    });
    let questionsResp = await ApiHelpers.read('questions');
    let optionTypesResp = await ApiHelpers.read('questions/options');
    let typesResp = await ApiHelpers.read('questions/types');
    let viewTypesResp = await ApiHelpers.read('questions/viewTypes');

    if (
      !questionsResp.good ||
      !optionTypesResp.good ||
      !typesResp.good ||
      !viewTypesResp.good
    ) {
      dispatch({
        type: QuestionsActionTypes.SetLoading,
        value: LoadStates.Failed,
      });
      return;
    }

    dispatch({
      type: QuestionsActionTypes.SetQuestions,
      value: JSON.parse(questionsResp.data),
    });
    dispatch({
      type: QuestionsActionTypes.SetOptions,
      value: JSON.parse(optionTypesResp.data),
    });
    dispatch({
      type: QuestionsActionTypes.SetTypes,
      value: JSON.parse(typesResp.data),
    });
    dispatch({
      type: QuestionsActionTypes.SetViewTypes,
      value: JSON.parse(viewTypesResp.data),
    });

    dispatch({
      type: QuestionsActionTypes.SetLoading,
      value: LoadStates.Succeeded,
    });
  };
}

export function setDataLoading(loading: LoadStates) {
  return async (dispatch, state) => {
    dispatch({ type: QuestionsActionTypes.SetLoading, value: loading });
  };
}

export function setQuestionCreating(loading: LoadStates) {
  return async (dispatch, state) => {
    dispatch({ type: QuestionsActionTypes.SetCreating, value: loading });
  };
}

export function setShowCreator(show: boolean) {
  return async (dispatch, state) => {
    dispatch({ type: QuestionsActionTypes.SetShowCreator, value: show });
  };
}

export function createQuestion(question: IQuestion) {
  return async (dispatch, state) => {
    if (state.questionCreating === LoadStates.Loading) {
      return;
    }

    dispatch({
      type: QuestionsActionTypes.SetCreating,
      value: LoadStates.Loading,
    });
    let createResp = await ApiHelpers.create('questions', question);

    if (!createResp.good) {
      dispatch({
        type: QuestionsActionTypes.SetCreating,
        value: LoadStates.Failed,
      });
      return;
    }

    dispatch({
      type: QuestionsActionTypes.SetCreating,
      value: LoadStates.Succeeded,
    });
    dispatch(setShowCreator(false));
    await GeneralUtility.delay(500);
    dispatch(loadData());
  };
}

export function setQuestionForAdd(question: IQuestion) {
  return async (dispatch, state) => {
    dispatch({
      type: QuestionsActionTypes.SetQuestionForAdd,
      value: question || ({} as IQuestion),
    });
  };
}

export function setQuestionForPreview(question: IQuestion) {
  return async (dispatch, state) => {
    dispatch({
      type: QuestionsActionTypes.SetQuestionForPreview,
      value: question || ({} as IQuestion),
    });
  };
}
