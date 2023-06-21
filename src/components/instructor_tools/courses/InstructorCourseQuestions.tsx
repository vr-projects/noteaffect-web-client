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
import ICourse from '../../../models/ICourse';
import { GENERAL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import BreadcrumbLink from '../../controls/BreadcrumbLink';
import Breadcrumb from '../../controls/Breadcrumb';
import IUserQuestion from '../../../models/IUserQuestion';
import InstructorQuestionTable from './InstructorQuestionTable';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';

interface ICourseQuestionsProps {
  course: ICourse;
}

interface ICourseQuestionsState {
  questions: IUserQuestion[];
  loading: LoadStates;
}

export default class InstructorCourseQuestions extends SrUiComponent<
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

  performRender() {
    const { loading, questions } = this.state;
    const question = this.selectedQuestion();

    return (
      <div className="instructor-course-questions course-lectures">
        <div className="">
          <h3>
            <Breadcrumb>
              <BreadcrumbLink
                linkEnabled={!!question}
                onClick={() => this.returnToQuestions()}
              >
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.STUDENT_PARTICIPANT_QUESTIONS
                )}
              </BreadcrumbLink>
            </Breadcrumb>
          </h3>
        </div>
        {questions.length === 0 ? (
          <LoadIndicator
            state={loading}
            errorMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.ERROR_STUDENT_PARTICIPANT_QUESTIONS
            )}
            loadingMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.LOADING_STUDENT_PARTICIPANT_QUESTIONS
            )}
          />
        ) : null}
        {loading === LoadStates.Succeeded || questions.length > 0 ? (
          questions.length > 0 ? (
            <InstructorQuestionTable showAll large questions={questions} />
          ) : (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.NONE_STUDENT_PARTICIPANT_QUESTIONS
              )}
            </Alert>
          )
        ) : null}
      </div>
    );
  }

  returnToQuestions() {
    this.updateQuery(QueryUtility.buildQuery({ question: undefined }));
  }

  selectedQuestion() {
    return null;
  }
}
