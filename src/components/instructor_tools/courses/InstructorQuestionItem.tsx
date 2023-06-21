import * as React from 'react';
import moment from 'moment';
import {
  SrUiComponent,
  ApiHelpers,
  LoadStates,
  LoadMask,
  LoadIndicator,
} from 'react-strontium';
import IUserQuestion from '../../../models/IUserQuestion';
import Localizer from '../../../utilities/Localizer';
import InstructorQuestionAnswerModalButton from './InstructorQuestionAnswerModalButton';

interface IQuestionItemProps {
  question: IUserQuestion;
  large: boolean;
}

interface IQuestionItemState {}

export default class InstructorQuestionItem extends SrUiComponent<
  IQuestionItemProps,
  IQuestionItemState
> {
  subtitleParts() {
    let parts: React.ReactNode[] = [];
    parts.push(
      <span key="time">{`${Localizer.get('Asked')} ${moment(
        this.props.question.created * 1000
      ).format('MM-DD-YYYY, hh:mma')}`}</span>
    );

    if (
      (this.props.question.lectureName || '').length > 0 &&
      this.props.large
    ) {
      parts.push(<span key="div-a"> / </span>);
      parts.push(
        <span key="lecture">
          {/* // TODO refactor to map, a-tag */}
          <a onClick={() => this.navToLecture()}>
            {this.props.question.lectureName}
          </a>
        </span>
      );
    }

    if (this.props.question.slide) {
      parts.push(<span key="div-b"> / </span>);
      parts.push(
        <span key="slide">
          <a onClick={() => this.navToSlide()}>{`${Localizer.get('Segment')} ${
            this.props.question.slide
          }`}</a>
        </span>
      );
    }

    return parts;
  }

  navToLecture() {
    this.navigate(
      `instructor/course/${this.props.question.seriesId}?menu=lectures&lecture=${this.props.question.lectureId}`
    );
  }

  navToSlide() {
    this.navigate(
      `instructor/course/${this.props.question.seriesId}?menu=lectures&lecture=${this.props.question.lectureId}&initialSlide=${this.props.question.slide}`
    );
  }

  performRender() {
    const { question } = this.props;

    return (
      <tr className="instructor-question-item student-question instructor">
        <td className="vote no-select">
          <div>{question.votes}</div>
        </td>
        <td className="question">
          <div className="rel">
            <p className="title">{question.question}</p>
            <p className="sub-title">{this.subtitleParts()}</p>
            {question.answered ? (
              <div className="answer">
                {question.answer}
                <p className="sub-title">
                  {Localizer.get('Answered by')}{' '}
                  <strong>{question.answerer}</strong>
                </p>
              </div>
            ) : (
              <p className="no-answer">{Localizer.get('Not yet answered')}</p>
            )}
            <InstructorQuestionAnswerModalButton question={question} />
          </div>
        </td>
      </tr>
    );
  }
}
