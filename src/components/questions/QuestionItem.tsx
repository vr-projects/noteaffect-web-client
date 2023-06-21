import * as React from 'react';
import { Button } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IQuestion from '../../models/IQuestion';
import * as QuestionActions from '../../store/questions/QuestionsActions';
import Dispatcher from '../../utilities/Dispatcher';
import { BsFilePlus, BsFillEyeFill } from 'react-icons/bs';

interface IQuestionsItemProps {
  question: IQuestion;
}

interface IQuestionsItemState {}
// TODO tech debt refactor to connected component for dispatch use

export default class QuestionsItem extends SrUiComponent<
  IQuestionsItemProps,
  IQuestionsItemState
> {
  performRender() {
    const { question } = this.props;

    return (
      <div className="question-item margin margin-bottom-sm">
        <div className="row">
          <div className="col-sm-6">
            <h4>{question.title}</h4>
            <p>
              {Localizer.get('Type')}: {question.type.type}
            </p>
            <p>
              {Localizer.get('Question')}: {question.question}
            </p>
          </div>
          <div className="col-sm-6 d-flex flex-column align-items-end">
            <Button
              bsStyle="info"
              className="margin margin-top-md"
              onClick={() =>
                Dispatcher.dispatch(
                  QuestionActions.setQuestionForPreview(question)
                )
              }
            >
              <BsFillEyeFill />
              <span className="ml-1">{Localizer.get('Preview question')}</span>
            </Button>
            <br />
            <button
              onClick={() =>
                Dispatcher.dispatch(QuestionActions.setQuestionForAdd(question))
              }
              className="btn btn-success margin margin-top-sm"
            >
              <BsFilePlus />
              <span className="ml-1">
                {Localizer.get('Add to presentation')}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
