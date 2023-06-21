import * as React from 'react';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  SrAppMessage,
  QueryUtility,
} from 'react-strontium';
import IUserQuestion from '../../models/IUserQuestion';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import QuestionTable, { SORT_BY_TYPE } from './QuestionTable';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import ILecture from '../../models/ILecture';
import AskQuestionModalButton from './AskQuestionModalButton';

interface ILectureQuestionsProps {
  lecture: ILecture;
}

interface ILectureQuestionsState {
  questions: IUserQuestion[];
  loading: LoadStates;
}

export default class LectureQuestionsReviewer extends SrUiComponent<
  ILectureQuestionsProps,
  ILectureQuestionsState
> {
  initialState() {
    return { questions: [], loading: LoadStates.Unloaded };
  }

  onComponentMounted() {
    this.loadQuestions(this.props.lecture.seriesId, this.props.lecture.id);
  }

  getHandles() {
    return [
      AppBroadcastEvents.LectureUpdated,
      AppBroadcastEvents.UserQuestionsUpdated,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    if (
      msg.action === AppBroadcastEvents.UserQuestionsUpdated ||
      (this.props.lecture && msg.data.courseId === this.props.lecture.seriesId)
    ) {
      this.loadQuestions(this.props.lecture.seriesId, this.props.lecture.id);
    }
  }

  async loadQuestions(courseId: number, lectureId: number) {
    if (!courseId || !lectureId || this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    const questionsResp = await ApiHelpers.read(
      `series/${courseId}/lectures/${lectureId}/questions`
    );

    if (!this.mounted()) {
      return;
    }

    if (questionsResp.good) {
      if (this.props.lecture && this.props.lecture.id === lectureId) {
        const questions = JSON.parse(questionsResp.data);
        this.set({ questions: questions, loading: LoadStates.Succeeded });
      }
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  onNewProps(props: ILectureQuestionsProps) {
    if (
      props.lecture &&
      this.props.lecture &&
      props.lecture.id !== this.props.lecture.id
    ) {
      this.loadQuestions(props.lecture.seriesId, props.lecture.id);
    }
  }

  returnToQuestions() {
    this.updateQuery(QueryUtility.buildQuery({ question: undefined }));
  }

  selectedQuestion() {
    return null;
  }

  performRender() {
    const { lecture } = this.props;
    const { loading, questions } = this.state;

    return (
      <div className="lecture-questions-reviewer">
        <AskQuestionModalButton
          courseId={lecture.seriesId}
          lectureId={lecture.id}
          className="mb-2"
        />

        {questions.length === 0 ? (
          <LoadIndicator
            state={loading}
            errorMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.QUESTIONS_COURSE_MEETING_ERROR
            )}
            loadingMessage={Localizer.get('Getting questions...')}
          />
        ) : null}
        {loading === LoadStates.Succeeded || questions.length > 0 ? (
          questions.length > 0 ? (
            <QuestionTable
              large
              questions={questions}
              initialSort={SORT_BY_TYPE.VOTES}
            />
          ) : (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.NO_QUESTIONS_LECTURE_PRESENTATION
              )}
            </Alert>
          )
        ) : null}
      </div>
    );
  }
}
