import * as React from 'react';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import { FaChevronUp } from 'react-icons/fa';
import { SrUiComponent, ApiHelpers } from 'react-strontium';
import IUserQuestion from '../../models/IUserQuestion';
import Localizer from '../../utilities/Localizer';

interface IQuestionTableItemProps {
  question: IUserQuestion;
  large: boolean;
}

interface IQuestionTableItemState {}

export default class QuestionTableItem extends SrUiComponent<
  IQuestionTableItemProps,
  IQuestionTableItemState
> {
  async onVote(question: IUserQuestion) {
    const {
      question: { seriesId, id },
    } = this.props;
    if (question.userCreated || question.userVoted) {
      return;
    }
    // TODO refactor to try catch
    ApiHelpers.create(`series/${seriesId}/questions/${id}/reactions`, {});
  }

  navToLecture() {
    const {
      question: { seriesId, lectureId },
    } = this.props;
    this.navigate(`course/${seriesId}?menu=lectures&lecture=${lectureId}`);
  }

  navToSlide() {
    const {
      question: { seriesId, lectureId, slide },
    } = this.props;
    this.navigate(
      `course/${seriesId}?menu=lectures&lecture=${lectureId}&initialSlide=${slide}`
    );
  }

  subtitleParts() {
    const { question, large } = this.props;
    let parts: React.ReactNode[] = [];

    parts.push(
      <span key="time" className={`question-item-time`}>{`${Localizer.get(
        'Asked'
      )} ${moment(question.created * 1000).format(
        'MM-DD-YYYY, hh:mma'
      )}`}</span>
    );

    if ((question.lectureName || '').length > 0 && large) {
      parts.push(<span key="div-a"> / </span>);
      parts.push(
        <span key="lecture">
          <Button
            bsStyle="link"
            className="na-btn-reset-width btn-link-flat"
            onClick={() => this.navToLecture()}
          >
            {question.lectureName}
          </Button>
        </span>
      );
    }

    if (question.slide) {
      parts.push(<span key="div-b"> / </span>);
      parts.push(
        <span key="slide">
          <Button
            bsStyle="link"
            className="na-btn-reset-width btn-link-flat"
            onClick={() => this.navToSlide()}
          >{`${Localizer.get('Segment')} ${question.slide}`}</Button>
        </span>
      );
    }

    return parts;
  }

  performRender() {
    const { question } = this.props;

    return (
      <tr className="question-table-item question-item student-question">
        <td className="vote">
          <Button
            bsStyle="link"
            className="na-icon-btn-square"
            title={
              question.userCreated
                ? Localizer.get("You asked this question and can't upvote it.")
                : ''
            }
            onClick={() => this.onVote(question)}
          >
            <span
              className={`${
                question.userCreated
                  ? 'created'
                  : question.userVoted
                  ? 'voted'
                  : ''
              }`}
            ></span>
            <FaChevronUp className="mr-1" />
            <span>{question.votes}</span>
          </Button>
        </td>
        <td className="question">
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
        </td>
      </tr>
    );
  }
}
