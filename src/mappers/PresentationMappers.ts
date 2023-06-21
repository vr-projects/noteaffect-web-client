import * as SecurityReducer from '../store/security/SecurityReducer';
import * as PresentationReducer from '../store/presentation/PresentationReducer';

export default class PresentationMappers {
  public static PresentationMapper = (state, props) => {
    return {
      isSecurityMode: SecurityReducer.getIsSecurityMode(state),
      isSecurityAppLoading: SecurityReducer.getIsSecurityAppLoading(state),
      isSecurityAppOn: SecurityReducer.getIsSecurityAppOn(state),
      presentedData: PresentationReducer.getPresentedData(state),
      postPresentedData: PresentationReducer.getPostPresentedData(state),
      courseId: props.courseId,
    };
  };

  public static PresentationNotesMapper = (state, props) => {
    return {
      presentedData: PresentationReducer.getPresentedData(state),
      postPresentedData: PresentationReducer.getPostPresentedData(state),
      notesData: PresentationReducer.getNotesData(state),
      postNotesData: PresentationReducer.getPostNotesData(state),
      courseId: props.courseId,
      collapsed: props.collapsed,
      container: PresentationReducer.getUiContainer(state),
    };
  };

  public static QuestionsMapper = (state, props) => {
    return {
      courseId: props.courseId,
      questions: PresentationReducer.getQuestions(state),
      postQuestions: PresentationReducer.getPostQuestions(state),
    };
  };
}
