import * as React from 'react';
import { Modal } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  LoadIndicator,
  ApiHelpers,
} from 'react-strontium';
import IQuestion from '../../models/IQuestion';
import LiveQuestionRenderer from '../questions/LiveQuestionRenderer';
import Localizer from '../../utilities/Localizer';
import IQuestionAnswer from '../../models/IQuestionAnswer';
import DataRecordingUtil from '../../utilities/DataRecordingUtil';

interface IPostQuestionModalProps {
  currentQuestion: IQuestion;
  done: (question: IQuestion, answered: boolean) => void;
}

interface IPostQuestionModalState {
  question: IQuestion;
  saving: LoadStates;
  errorMessage: string;
}

export default class PostQuestionsModal extends SrUiComponent<
  IPostQuestionModalProps,
  IPostQuestionModalState
> {
  initialState() {
    return {
      question: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
    };
  }

  onNewProps(props: IPostQuestionModalProps) {
    if (!this.state.question) {
      this.setState({
        question: props.currentQuestion,
        saving: LoadStates.Unloaded,
      });
    }
  }

  async close() {
    let question = this.state.question;
    DataRecordingUtil.recordDataItem({
      key: 'Question not answered',
      id1: question.lectureQuestionId,
      id2: question.lectureId,
    });
    this.setState({ question: undefined, saving: LoadStates.Unloaded });
    this.props.done(question, false);
  }

  async answer(question: IQuestion, answers: IQuestionAnswer[]) {
    if (this.state.saving === LoadStates.Loading) {
      return;
    }

    if (answers.length === 0) {
      DataRecordingUtil.recordDataItem({
        key: 'Question not given answer',
        id1: question.lectureQuestionId,
        id2: question.lectureId,
      });
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: Localizer.get(
          'Please answer the question to save your response.'
        ),
      });
      return;
    }

    this.setPartial({ saving: LoadStates.Loading, errorMessage: undefined });

    DataRecordingUtil.recordDataItem({
      key: 'Question answered',
      id1: question.lectureQuestionId,
      id2: question.lectureId,
    });

    try {
      const resp = await ApiHelpers.create(
        `lectures/${question.lectureId}/questions/${question.id}/responses`,
        { slide: question.slide, responses: answers }
      );

      if (!resp.good) {
        throw new Error('Error saving answer');
      }

      this.setState({ question: undefined, saving: LoadStates.Unloaded });
      this.props.done(question, true);
    } catch (error) {
      console.error(error);
      this.setPartial({ saving: LoadStates.Failed });
    }
  }

  performRender() {
    return (
      <Modal
        show={!!this.state.question}
        title={this.state.question ? this.state.question.question : ''}
        onHide={() => this.close()}
        keyboard
        backdrop={'static'}
      >
        <Modal.Header>
          <Modal.Title>
            {this.state.question ? this.state.question.question : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="post-questions-modal">
            <div className="rel margin margin-bottom-sm">
              <LiveQuestionRenderer
                hideQuestionHeader
                question={this.state.question}
                cancel={() => this.close()}
                completed={(question: IQuestion, answers: IQuestionAnswer[]) =>
                  this.answer(question, answers)
                }
                enabled={this.state.saving !== LoadStates.Loading}
              />
              <LoadMask state={this.state.saving} />
            </div>
            <LoadIndicator
              state={this.state.saving}
              loadingMessage={Localizer.get('Saving your response...')}
              errorMessage={
                this.state.errorMessage ||
                Localizer.get(
                  'There was a problem saving your response.  Try again.'
                )
              }
            />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
