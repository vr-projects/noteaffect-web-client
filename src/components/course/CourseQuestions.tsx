import * as React from 'react';
import isNull from 'lodash/isNull';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  SrAppMessage,
  QueryUtility,
} from 'react-strontium';
import ICourse from '../../models/ICourse';
import IUserQuestion from '../../models/IUserQuestion';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import QuestionTable from './QuestionTable';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import AskQuestionModalButton from './AskQuestionModalButton';

interface ICourseQuestionsProps {
  course: ICourse;
}

interface ICourseQuestionsState {
  questions: IUserQuestion[];
  loading: LoadStates;
}

export default class CourseQuestions extends SrUiComponent<
  ICourseQuestionsProps,
  ICourseQuestionsState
> {
  initialState() {
    return { questions: [], loading: LoadStates.Unloaded };
  }

  onComponentMounted() {
    this.loadQuestions(this.props.course);
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
      (this.props.course && msg.data.courseId === this.props.course.id)
    ) {
      this.loadQuestions(this.props.course);
    }
  }

  async loadQuestions(course: ICourse) {
    if (!course || this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    const questionsResp = await ApiHelpers.read(
      `series/${course.id}/questions`
    );

    // TODO - red flag tech debt, confirm if this is ever NOT mounted
    if (!this.mounted()) {
      return;
    }

    if (questionsResp.good) {
      if (this.props.course && this.props.course.id == course.id) {
        const questions = JSON.parse(questionsResp.data);
        this.set({ questions: questions, loading: LoadStates.Succeeded });
      }
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  onNewProps(props: ICourseQuestionsProps) {
    if (
      props.course &&
      this.props.course &&
      props.course.id !== this.props.course.id
    ) {
      this.loadQuestions(props.course);
    }
  }

  returnToQuestions() {
    this.updateQuery(QueryUtility.buildQuery({ question: undefined }));
  }

  selectedQuestion() {
    return null;
  }

  performRender() {
    const { course } = this.props;
    const question = this.selectedQuestion();

    if (isNull(course)) return null;

    return (
      <div className="course-questions course-lectures">
        <div className="d-flex align-items-center justify-content-between">
          <h3>
            <Breadcrumb>
              <BreadcrumbLink
                linkEnabled={!!question}
                onClick={() => this.returnToQuestions()}
              >
                {Localizer.get('Questions and Answers')}
              </BreadcrumbLink>
            </Breadcrumb>
          </h3>
          <AskQuestionModalButton courseId={this.props.course.id} />
        </div>

        {this.state.questions.length === 0 ? (
          <LoadIndicator
            state={this.state.loading}
            errorMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.QUESTIONS_COURSE_MEETING_ERROR
            )}
            loadingMessage={Localizer.get('Getting questions...')}
          />
        ) : null}
        {this.state.loading === LoadStates.Succeeded ||
        this.state.questions.length > 0 ? (
          this.state.questions.length > 0 ? (
            <QuestionTable large questions={this.state.questions} />
          ) : (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.NO_QUESTIONS_COURSE_MEETING
              )}
            </Alert>
          )
        ) : null}
      </div>
    );
  }
}
