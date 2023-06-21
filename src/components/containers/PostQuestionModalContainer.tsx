import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import IImmutableObject from '../../interfaces/IImmutableObject';
import PresentationMappers from '../../mappers/PresentationMappers';
import IQuestion from '../../models/IQuestion';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import PostQuestionsModal from '../presentation/PostQuestionsModal';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedPostQuestionModalContainerProps extends DispatchProp<any> {
  postQuestions?: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IQuestion>>
  >;
}

interface IPostQuestionModalContainerProps {
  courseId: number;
  observerOnly: boolean;
}

interface IPostQuestionModalContainerState {}

class PostQuestionModalContainer extends SrUiComponent<
  IConnectedPostQuestionModalContainerProps & IPostQuestionModalContainerProps,
  IPostQuestionModalContainerState
> {
  doneWithQuestion(question: IQuestion, answered: boolean) {
    const { dispatch, courseId } = this.props;

    dispatch(PresentationActions.markPostQuestionUnavailable(question));
    if (answered) {
      this.broadcast(AppBroadcastEvents.LectureUpdated, {
        courseId,
        lectureId: question.lectureId,
      });
    }
  }

  performRender() {
    const { postQuestions, courseId, observerOnly } = this.props;

    const map = postQuestions.get(courseId.toString());
    const questions = (map ? map.toJS() : []) as IQuestion[];
    const firstUnanswered = questions.filter((q) => q && q.available)[0];

    return (
      <PostQuestionsModal
        currentQuestion={firstUnanswered}
        done={(q, answered) => this.doneWithQuestion(q, answered)}
      />
    );
  }
}

export default connect<
  IConnectedPostQuestionModalContainerProps,
  void,
  IPostQuestionModalContainerProps
>(PresentationMappers.QuestionsMapper)(PostQuestionModalContainer);
