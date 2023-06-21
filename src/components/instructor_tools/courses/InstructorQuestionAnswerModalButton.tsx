import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  Well,
} from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  LoadMask,
} from 'react-strontium';
import ApiHelpers from 'react-strontium/dist/api/ApiHelpers';
import Localizer from '../../../utilities/Localizer';
import ErrorUtil from '../../../utilities/ErrorUtil';
import IUserQuestion from '../../../models/IUserQuestion';
import GenericModal from '../../controls/GenericModal';

interface IInstructorQuestionAnswerPopoverProps {
  question: IUserQuestion;
}

interface IInstructorQuestionAnswerPopoverState {
  showModal: boolean;
  answerInput: string;
  loading: LoadStates;
  errorMessage: string;
}

export default class InstructorQuestionAnswerPopover extends SrUiComponent<
  IInstructorQuestionAnswerPopoverProps,
  IInstructorQuestionAnswerPopoverState
> {
  initialState() {
    const { question } = this.props;

    return {
      showModal: false,
      answerInput: this.getAnswerText(question.answer),
      loading: LoadStates.Unloaded,
      errorMessage: null,
    };
  }

  getAnswerText(answer) {
    return isNull(answer) ? '' : answer;
  }

  cancel() {
    this.setState({ ...this.initialState() });
  }

  async save() {
    const { question } = this.props;
    const { answerInput = '' } = this.state;

    if (isEmpty(answerInput.trim())) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get('Please enter an answer.'),
      });
      return;
    }

    this.setPartial({ loading: LoadStates.Loading, errorMessage: null });

    try {
      const resp = await ApiHelpers.create(
        `series/${question.seriesId}/questions/${question.id}/answer`,
        { answer: answerInput }
      );

      if (!isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      }
      if (!resp.good) {
        throw new Error('Error saving answer. Please try again.');
      }

      this.setState({
        answerInput: this.getAnswerText(answerInput),
        loading: LoadStates.Succeeded,
        errorMessage: null,
        showModal: false,
      });
    } catch (error) {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  showModal() {
    this.setPartial({
      showModal: true,
    });
  }

  updateAnswer(e) {
    this.setPartial({
      answerInput: e.target.value,
    });
  }

  performRender() {
    const { question } = this.props;
    const {
      showModal,
      loading,
      answerInput = this.getAnswerText(question.answer),
      errorMessage,
    } = this.state;

    return (
      <>
        <Button bsStyle="default" onClick={() => this.showModal()}>
          <FaPen className="light" />
          <span className="ml-1">
            {Localizer.get(
              question.answered ? 'Update answer' : 'Answer question'
            )}
          </span>
        </Button>

        <GenericModal
          show={showModal}
          modalTitle={Localizer.get('Answer for Participant Question:')}
          onCloseClicked={() => this.cancel()}
          closeButtonDisable={loading === LoadStates.Loading}
          hasConfirmButton
          confirmButtonStyle={'success'}
          onConfirmClicked={() => this.save()}
          confirmButtonDisable={loading === LoadStates.Loading}
        >
          <>
            <div className="rel">
              <FormGroup className="my-2">
                <ControlLabel>
                  {Localizer.get('Participant Question:')}
                </ControlLabel>
                <Well>{question.question}</Well>
              </FormGroup>

              <FormGroup>
                <ControlLabel>{Localizer.get('Your Answer:')}</ControlLabel>
                <FormControl
                  type="textarea"
                  componentClass="textarea"
                  readOnly={loading === LoadStates.Loading}
                  autoFocus
                  className="resize-vertical"
                  value={answerInput}
                  onChange={(e) => this.updateAnswer(e)}
                />
              </FormGroup>
            </div>
            <LoadMask state={loading} />
            <LoadIndicator
              state={loading}
              loadingMessage={Localizer.get('Saving answer...')}
              errorMessage={
                errorMessage ||
                Localizer.get(
                  'There was a problem saving the answer.  Please try later.'
                )
              }
            />
          </>
        </GenericModal>
      </>
    );
  }
}
