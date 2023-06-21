import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import IQuestion from '../../models/IQuestion';
import Dispatcher from '../../utilities/Dispatcher';
import * as QuestionActions from '../../store/questions/QuestionsActions';
import IImmutableObject from '../../interfaces/IImmutableObject';
import LiveQuestionRenderer from './LiveQuestionRenderer';
import Localizer from '../../utilities/Localizer';

interface IQuestionPreviewModalProps {
  question: IImmutableObject<IQuestion>;
}

interface IQuestionPreviewModalState {}

// TODO tech debt refactor to connected component
// TODO tech debt use GenericModal component
export default class QuestionPreviewModal extends SrUiComponent<
  IQuestionPreviewModalProps,
  IQuestionPreviewModalState
> {
  close() {
    Dispatcher.dispatch(QuestionActions.setQuestionForPreview(undefined));
  }

  performRender() {
    return (
      <Modal
        show={this.props.question && this.props.question.size > 0}
        onHide={() =>
          Dispatcher.dispatch(QuestionActions.setQuestionForPreview(undefined))
        }
        keyboard
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>{Localizer.get('Question Preview')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="question-preview-modal">
            <LiveQuestionRenderer
              enabled
              question={this.props.question.toJS()}
              cancel={() => this.close()}
              completed={() => this.close()}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="default" onClick={() => this.close()}>
            <FaTimes />
            <span className="ml-1">{Localizer.get('Close')}</span>
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
