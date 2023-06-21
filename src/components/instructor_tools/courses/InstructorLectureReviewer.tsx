import * as React from 'react';
import { Alert } from 'react-bootstrap';
import isArray from 'lodash/isArray';
import {
  SrUiComponent,
  LoadStates,
  SrAppMessage,
  LoadIndicator,
  ApiHelpers,
} from 'react-strontium';
import {
  INSTRUCTOR_LECTURE_REVIEWER_COMPONENT,
  GENERAL_COMPONENT,
} from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import ILecture from '../../../models/ILecture';
import ILectureFrame from '../../../models/ILectureFrame';
import InstructorLectureReviewSlides from './InstructorLectureReviewSlides';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';
import IUserQuestion from '../../../models/IUserQuestion';
import InstructorQuestionTable, {
  SORT_BY_TYPE,
} from './InstructorQuestionTable';
import InstructorPollReviewer from './InstructorPollReviewer';

interface IInstructorLectureReviewerProps {
  lecture: ILecture;
  initialSlide: number;
}

interface IInstructorLectureReviewerState {
  selectedSlideNumber: number;
  questionsLoading: LoadStates;
  pollsLoading: LoadStates;
  containerRef: HTMLDivElement;
  questions: IUserQuestion[];
}

export default class InstructorLectureReviewer extends SrUiComponent<
  IInstructorLectureReviewerProps,
  IInstructorLectureReviewerState
> {
  initialState(): IInstructorLectureReviewerState {
    let slide = this.slideForNumber(this.props.initialSlide);
    let slideNumber = slide && slide.slide;
    return {
      questionsLoading: LoadStates.Unloaded,
      pollsLoading: LoadStates.Unloaded,
      selectedSlideNumber: slideNumber || this.firstSlideNumber(),
      containerRef: undefined,
      questions: [],
    };
  }

  onComponentMounted() {
    this.updateQuestions();
  }

  getHandles() {
    return [
      AppBroadcastEvents.LivePresentationUpdated,
      AppBroadcastEvents.UserQuestionsUpdated,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    if (
      !(
        msg.data.seriesId == this.props.lecture.seriesId &&
        msg.data.lectureId == this.props.lecture.id
      )
    ) {
      return;
    }

    if (msg.action === AppBroadcastEvents.LivePresentationUpdated) {
      this.setPartial({
        selectedSlideNumber:
          msg.data.slideNumber || this.state.selectedSlideNumber,
      });
      this.updateLecture();
    } else if (msg.action === AppBroadcastEvents.UserQuestionsUpdated) {
      this.updateQuestions();
    }
  }

  async updateLecture() {
    this.broadcast(AppBroadcastEvents.LectureUpdated, {
      courseId: this.props.lecture.seriesId,
    });
  }

  async updateQuestions() {
    if (!this.props.lecture) {
      return;
    }

    await this.loadQuestions(
      this.props.lecture.seriesId,
      this.props.lecture.id
    );
  }

  async loadQuestions(courseId: number, lectureId: number) {
    if (
      !courseId ||
      !lectureId ||
      this.state.questionsLoading === LoadStates.Loading
    ) {
      return;
    }

    this.setPartial({ questionsLoading: LoadStates.Loading });

    const questionsResp = await ApiHelpers.read(
      `series/${courseId}/lectures/${lectureId}/questions`
    );

    if (!this.mounted()) {
      return;
    }

    if (questionsResp.good) {
      if (this.props.lecture && this.props.lecture.id == lectureId) {
        const questions = JSON.parse(questionsResp.data);
        this.setPartial({
          questions: questions,
          questionsLoading: LoadStates.Succeeded,
        });
      }
    } else {
      this.setPartial({ questionsLoading: LoadStates.Failed });
    }
  }

  changeSlide(forward: boolean, slide?: number) {
    if (slide && slide === this.state.selectedSlideNumber) {
      return;
    }

    if (slide) {
      this.setPartial({ selectedSlideNumber: slide });
    } else {
      if (
        (forward && this.state.selectedSlideNumber === this.maxSlides()) ||
        (!forward && this.state.selectedSlideNumber === this.minSlides())
      ) {
        return;
      }

      const slideNumber = forward
        ? this.nextSlideNumber()
        : this.previousSlideNumber();
      if (slideNumber) {
        this.setPartial({ selectedSlideNumber: slideNumber });
      }
    }
  }

  firstSlideNumber() {
    const first = this.firstSlide();
    if (first) {
      return first.slide;
    }
    return null;
  }

  minSlides() {
    return Math.min(
      ...(this.props.lecture.slideData || []).map((f) => f.slide)
    );
  }

  maxSlides() {
    return Math.max(
      ...(this.props.lecture.slideData || []).map((f) => f.slide)
    );
  }

  nextSlideNumber() {
    let slide = this.sortedSlides().filter(
      (s) => s.slide > this.state.selectedSlideNumber
    )[0];
    if (slide) {
      return slide.slide;
    }
    return null;
  }

  previousSlideNumber() {
    let slide = this.sortedSlides()
      .filter((s) => s.slide < this.state.selectedSlideNumber)
      .reverse()[0];
    if (slide) {
      return slide.slide;
    }
    return null;
  }

  firstSlide() {
    let slide = this.sortedSlides()[0];
    if (slide) {
      return this.slideForNumber(slide.slide);
    }

    return null;
  }

  // TODO tech debt needs refactor - reused logic
  slideForNumber(slideNumber: number): ILectureFrame {
    if (!slideNumber) {
      return null;
    }

    let slides = this.sortedSlides();
    let slide = null;

    for (let i = 0; i < slides.length; i++) {
      let nextSlide = slides[i];
      if (nextSlide.slide === slideNumber && !!nextSlide.imageUrl) {
        slide = nextSlide;
      } else if (nextSlide.slide > slideNumber) {
        break;
      }
    }

    return slide;
  }

  sortedSlides() {
    const { lecture } = this.props;
    return (lecture.slideData || []).sort((a, b) => {
      let slideNumber = a.slide - b.slide;
      if (slideNumber !== 0) {
        return slideNumber;
      }

      return a.sequence - b.sequence;
    });
  }

  performRender() {
    const { lecture } = this.props;
    const { selectedSlideNumber, questions, questionsLoading } = this.state;
    const hasSlideData =
      lecture.slideData &&
      isArray(lecture.slideData) &&
      lecture.slideData.length > 0;
    const slide = this.slideForNumber(selectedSlideNumber);
    const imageUrl = slide ? slide.imageUrl : null;

    return (
      <>
        <div className="instructor-lecture-reviewer lecture-reviewer rel">
          {!hasSlideData ? (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.NO_SEGMENTS
              )}
            </Alert>
          ) : (
            <div className="presentation-container">
              <div className="presentation-questions-container">
                <div className="presentation-item">
                  <h4>
                    {Localizer.getFormatted(
                      INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.PRESENTED_SEGMENTS
                    )}
                  </h4>
                  <InstructorLectureReviewSlides
                    currentSlide={selectedSlideNumber}
                    totalSlides={this.maxSlides()}
                    minSlide={this.minSlides()}
                    slideImage={imageUrl}
                    currentAnnotations={undefined}
                    changeSlide={(forward, slide) =>
                      this.changeSlide(forward, slide)
                    }
                    lecture={this.props.lecture}
                  />
                </div>
                <div className="questions-item">
                  <h4>
                    {Localizer.getFormatted(
                      INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.QUESTIONS_TITLE
                    )}
                  </h4>
                  {questions.length === 0 ? (
                    <LoadIndicator
                      state={questionsLoading}
                      errorMessage={Localizer.getFormatted(
                        INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.QUESTION_ERROR
                      )}
                      loadingMessage={Localizer.get('Getting questions...')}
                    />
                  ) : null}
                  {questionsLoading === LoadStates.Succeeded ||
                  questions.length > 0 ? (
                    questions.length > 0 ? (
                      <InstructorQuestionTable
                        showAll
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
              </div>
              <div className="polls-item">
                <InstructorPollReviewer
                  selectedSlideNumber={selectedSlideNumber}
                  lecture={lecture}
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
