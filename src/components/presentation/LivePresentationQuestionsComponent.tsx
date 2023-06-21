import * as React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { SrUiComponent, LoadStates, ApiHelpers } from 'react-strontium';
import IUserQuestion from '../../models/IUserQuestion';
import { LIVE_PRESENTATION_QUESTIONS_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import QuestionTable from '../course/QuestionTable';

interface IPresentationNotesProps {
  collapsed: boolean;
  questions: IUserQuestion[];
  loading: LoadStates;
  lectureId: number;
  courseId: number;
  currentSlide: number;
  enabled: boolean;
}

interface IPresentationState {
  question: string;
}

export default class LivePresentationQuestionsComponent extends SrUiComponent<
  IPresentationNotesProps,
  IPresentationState
> {
  initialState() {
    return { question: null };
  }

  async onVote(question: IUserQuestion) {
    if (question.userCreated || question.userVoted) {
      return;
    }

    ApiHelpers.create(
      `series/${this.props.courseId}/questions/${question.id}/reactions`,
      {}
    );
  }

  async sendQuestion() {
    ApiHelpers.create(`series/${this.props.courseId}/questions`, {
      question: this.state.question,
      lectureId: this.props.lectureId,
      slide: this.props.currentSlide,
    });
    this.setState({ question: null });
  }

  performRender() {
    const { collapsed, enabled, questions } = this.props;
    const { question } = this.state;

    return (
      <div
        className={`live-presentation-questions-component notes-container ${
          collapsed ? 'collapsed' : ''
        }`}
      >
        {enabled ? (
          <>
            <h4>{Localizer.get('Ask a question')}</h4>
            <p className="helper-message">
              {Localizer.getFormatted(
                LIVE_PRESENTATION_QUESTIONS_COMPONENT.ANONYMITY
              )}
            </p>
            {/* // TODO tech tebt confirm if react-bootstrap FormControl */}
            <textarea
              className="resize-vertical w-100 mb-1"
              value={question || ''}
              onChange={(e) => this.setState({ question: e.target.value })}
              placeholder="Enter your question here"
            ></textarea>
            <div className="d-flex justify-content-end">
              <Button bsStyle="success" onClick={() => this.sendQuestion()}>
                {Localizer.get('Send question')}
              </Button>
            </div>
            <hr />
            <h4>{Localizer.get('Asked questions')}</h4>
            {questions.length === 0 ? (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  LIVE_PRESENTATION_QUESTIONS_COMPONENT.NO_QUESTIONS
                )}
              </Alert>
            ) : (
              <QuestionTable questions={questions} />
            )}
          </>
        ) : (
          <Alert bsStyle="info">
            {Localizer.getFormatted(
              LIVE_PRESENTATION_QUESTIONS_COMPONENT.LECTURE_PRESENTATION_BEGINS
            )}
          </Alert>
        )}
      </div>
    );
  }
}
