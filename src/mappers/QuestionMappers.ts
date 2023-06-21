import * as QuestionReducer from '../store/questions/QuestionsReducer';
import * as AppReducer from '../store/app/AppReducer';

export default class QuestionMappers {
  public static QuestionMapper = (state, props) => {
    return {
      menu: props.menu,
      questions: QuestionReducer.getQuestions(state),
      options: QuestionReducer.getOptions(state),
      loading: QuestionReducer.getLoading(state),
      creating: QuestionReducer.getCreating(state),
      userPermissions: AppReducer.getUserPermissions(state),
      viewTypes: QuestionReducer.getQuestionViewTypes(state),
    };
  };

  public static CreatorMapper = (state, props) => {
    return {
      options: QuestionReducer.getOptions(state),
      creating: QuestionReducer.getCreating(state),
      showCreator: QuestionReducer.getShowCreator(state),
      types: QuestionReducer.getTypes(state),
      viewTypes: QuestionReducer.getQuestionViewTypes(state),
    };
  };

  public static PreviewMapper = (state) => {
    return {
      question: QuestionReducer.getQuestionForPreview(state),
    };
  };

  public static AddMapper = (state) => {
    return {
      question: QuestionReducer.getQuestionForAdd(state),
    };
  };
}
