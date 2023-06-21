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
import Localizer from '../../utilities/Localizer';
import IQuestionAnswer from '../../models/IQuestionAnswer';
import DataRecordingUtil from '../../utilities/DataRecordingUtil';
import LiveQuestionRenderer from '../questions/LiveQuestionRenderer';
interface ILiveQuestionsModalProps {
  currentQuestion: IQuestion;
  done: (question: IQuestion) => void;
}

interface ILiveQuestionsModalState {
  question: IQuestion;
  saving: LoadStates;
  errorMessage: string;
}

export default class LiveQuestionsModal extends SrUiComponent<
  ILiveQuestionsModalProps,
  ILiveQuestionsModalState
> {
  initialState() {
    return {
      question: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
    };
  }

  onNewProps(props: ILiveQuestionsModalProps) {
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
    this.props.done(question);
  }

  async answer(question: IQuestion, answers: IQuestionAnswer[]) {
    const { done } = this.props;
    const { saving } = this.state;

    if (saving === LoadStates.Loading) {
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
        throw new Error('Error posting answers');
      }

      this.setState({ question: undefined, saving: LoadStates.Unloaded });
      done(question);
    } catch (error) {
      this.setPartial({ saving: LoadStates.Failed });
    }
  }

  // TODO tech debt refactor to GenericModal
  performRender() {
    const { question, saving, errorMessage } = this.state;

    return (
      <Modal
        show={!!question}
        className="live-questions-modal-container"
        backdropClassName={'live-questions-modal-backdrop'}
        title={question ? question.question : ''}
        onHide={() => this.close()}
        keyboard
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>{question ? question.question : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="live-questions-modal">
            <div className="rel margin margin-bottom-sm">
              <LiveQuestionRenderer
                hideQuestionHeader
                question={question}
                cancel={() => this.close()}
                completed={(question: IQuestion, answers: IQuestionAnswer[]) =>
                  this.answer(question, answers)
                }
                enabled={saving !== LoadStates.Loading}
              />
              <LoadMask state={saving} />
            </div>
            <LoadIndicator
              state={saving}
              loadingMessage={Localizer.get('Saving your response...')}
              errorMessage={
                errorMessage ||
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
