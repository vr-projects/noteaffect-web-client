import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent, LoadStates } from 'react-strontium';
import QuestionMappers from '../../mappers/QuestionMappers';
import * as QuestionActions from '../../store/questions/QuestionsActions';
import QuestionCreateModal from '../questions/QuestionCreateModal';
import IQuestionCreatorProps from '../../interfaces/IQuestionCreatorProps';
import IQuestion from '../../models/IQuestion';

interface IQuestionCreateContainerProps {}

interface IQuestionCreateContainerState {}

class QuestionCreateContainer extends SrUiComponent<
  IQuestionCreateContainerProps & IQuestionCreatorProps,
  IQuestionCreateContainerState
> {
  onDone() {
    if (this.props.creating === LoadStates.Loading) {
      return;
    }

    this.props.dispatch(QuestionActions.setShowCreator(false));
  }

  async createQuestion(question: IQuestion) {
    this.props.dispatch(QuestionActions.createQuestion(question));
  }

  performRender() {
    const { showCreator, options, creating, types, viewTypes } = this.props;

    return (
      <QuestionCreateModal
        show={showCreator}
        onClose={() => this.onDone()}
        options={options.toJS()}
        creating={creating}
        types={types.toJS()}
        viewTypes={viewTypes.toJS()}
        create={(question: IQuestion) => this.createQuestion(question)}
      />
    );
  }
}

export default connect(QuestionMappers.CreatorMapper)(QuestionCreateContainer);
