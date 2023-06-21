import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import LiveQuestionsModal from '../presentation/LiveQuestionsModal';
import IImmutableObject from '../../interfaces/IImmutableObject';
import PresentationMappers from '../../mappers/PresentationMappers';
import IQuestion from '../../models/IQuestion';
import * as PresentationActions from '../../store/presentation/PresentationActions';

interface IConnectedLiveQuestionContainerProps extends DispatchProp<any> {
  questions?: Immutable.Map<
    string,
    Immutable.List<IImmutableObject<IQuestion>>
  >;
  courseId: number;
}

interface ILiveQuestionContainerState {}

class LiveQuestionContainer extends SrUiComponent<
  IConnectedLiveQuestionContainerProps,
  ILiveQuestionContainerState
> {
  doneWithQuestion(question: IQuestion) {
    const { dispatch } = this.props;
    dispatch(PresentationActions.markQuestionUnavailable(question));
  }

  performRender() {
    const { questions, courseId } = this.props;
    const map = questions.get(courseId.toString());
    const mappedQuestions = (map ? map.toJS() : []) as IQuestion[];
    const firstUnanswered = mappedQuestions.filter((q) => q.available)[0];

    return (
      <LiveQuestionsModal
        currentQuestion={firstUnanswered}
        done={(q) => this.doneWithQuestion(q)}
      />
    );
  }
}

export default connect<any, void, IConnectedLiveQuestionContainerProps>(
  PresentationMappers.QuestionsMapper
)(LiveQuestionContainer);
