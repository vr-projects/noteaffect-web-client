import * as React from 'react';
import isUndefined from 'lodash/isUndefined';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { FaCommentAlt } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadMask,
  LoadIndicator,
} from 'react-strontium';
import { ASK_QUESTION_POPOVER_COMPONENT } from '../../version/versionConstants';
import GenericModal from '../controls/GenericModal';
import Localizer from '../../utilities/Localizer';

interface IAskQuestionModalButtonProps {
  courseId: number;
  lectureId?: number;
  currentSlide?: number;
  className?: string;
}

interface IAskQuestionModalButtonState {
  question: string;
  loading: LoadStates;
  errorMessage: string;
  showModal: boolean;
}

export default class AskQuestionModalButton extends SrUiComponent<
  IAskQuestionModalButtonProps,
  IAskQuestionModalButtonState
> {
  initialState(): IAskQuestionModalButtonState {
    return {
      question: null,
      loading: LoadStates.Unloaded,
      errorMessage: null,
      showModal: false,
    };
  }

  cancel() {
    this.setState(this.initialState());
  }

  handleQuestionChange(e) {
    this.setPartial({ question: e.target.value });
  }

  async saveQuestion() {
    const { lectureId, currentSlide } = this.props;
    const { question } = this.state;

    if ((this.state.question || '').trim().length === 0) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get('Please enter a question.'),
      });
      return;
    }

    this.setPartial({ loading: LoadStates.Loading, errorMessage: undefined });

    try {
      const payload = {
        question,
        lectureId,
        slide: currentSlide,
      };
      const resp = await ApiHelpers.create(
        `series/${this.props.courseId}/questions`,
        payload
      );
      if (!resp.good) {
        throw new Error('There was an error saving your question.');
      }

      this.setState(this.initialState());
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  getButtonText() {
    const { lectureId, currentSlide } = this.props;

    switch (true) {
      case !isUndefined(lectureId) && isUndefined(currentSlide):
        return ASK_QUESTION_POPOVER_COMPONENT.QUESTION_LECTURE_PRESENTATION;
      case !isUndefined(lectureId) && !isUndefined(currentSlide):
        return ASK_QUESTION_POPOVER_COMPONENT.QUESTION_SEGMENT;
      default:
        return ASK_QUESTION_POPOVER_COMPONENT.QUESTION_COURSE_MEETING;
    }
  }

  performRender() {
    const { className = '' } = this.props;
    const { showModal, loading } = this.state;
    const buttonMessageVersionKey = this.getButtonText();

    return (
      <div className={`ask-question-modal-button ${className}`}>
        <Button
          bsStyle="info"
          onClick={() => this.setPartial({ showModal: true })}
        >
          <FaCommentAlt />
          <span className="ml-1">
            {Localizer.getFormatted(buttonMessageVersionKey)}
          </span>
        </Button>

        <GenericModal
          show={showModal}
          modalTitle={Localizer.get('Ask a question')}
          hasCloseButton
          onCloseClicked={() => this.cancel()}
          hasConfirmButton
          confirmButtonStyle={'success'}
          onConfirmClicked={() => this.saveQuestion()}
        >
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Sending question...')}
            errorMessage={
              this.state.errorMessage ||
              Localizer.get(
                'There was a problem sending the question.  Please try later.'
              )
            }
          />
          <FormGroup className="flex-grow mb-0" controlId="formQuestion">
            <ControlLabel>
              <span>
                {Localizer.getFormatted(
                  ASK_QUESTION_POPOVER_COMPONENT.UNSEEN_QUESTION
                )}
              </span>
            </ControlLabel>
            <FormControl
              disabled={false}
              required
              value={this.state.question || ''}
              componentClass="textarea"
              className="resize-vertical"
              placeholder={Localizer.get('Enter Description for Sharing Email')}
              onChange={(e) => this.handleQuestionChange(e)}
            />
          </FormGroup>
          <LoadMask state={loading} />
        </GenericModal>
      </div>
    );
  }
}
