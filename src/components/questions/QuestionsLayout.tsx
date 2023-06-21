import * as React from 'react';
import { Button } from 'react-bootstrap';
import { SrUiComponent, runtime } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IQuestion from '../../models/IQuestion';
import QuestionsList from './QuestionsList';
import ServiceReduxConnectionServices from '../../services/ServiceReduxConnectionServices';
import * as QuestionActions from '../../store/questions/QuestionsActions';
import QuestionCreateContainer from '../containers/QuestionCreateContainer';
import QuestionAddContainer from '../containers/QuestionAddContainer';
import QuestionPreviewContainer from '../containers/QuestionPreviewContainer';
import { FaPlus } from 'react-icons/fa';

interface IQuestionsLayoutProps {
  questions: IQuestion[];
}

interface IQuestionsLayoutState {}
export default class QuestionsLayout extends SrUiComponent<
  IQuestionsLayoutProps,
  IQuestionsLayoutState
> {
  onAddQuestion() {
    const svc = runtime.services.get(
      'serviceReduxConnection'
    ) as ServiceReduxConnectionServices;
    svc.dispatch(QuestionActions.setShowCreator(true));
  }

  performRender() {
    return (
      <div className="questions-layout">
        <div className="row">
          <div className="col-sm-3 add-questions">
            <h3>{Localizer.get('Add new questions')}</h3>
            <p>{Localizer.get('Start here to build your questions.')}</p>
            <p>
              {Localizer.get(
                "After you build a question, you'll be able to download special segments to insert into your own presentations that will present questions to your audience when you present your segments."
              )}
            </p>
            <div className="text-center">
              <Button bsStyle="success" onClick={() => this.onAddQuestion()}>
                <FaPlus />
                <span className="ml-1">
                  {Localizer.get('Add new question')}
                </span>
              </Button>
            </div>
            <QuestionCreateContainer />
          </div>
          <div className="col-sm-9">
            <h3>{Localizer.get('Questions')}</h3>
            <QuestionsList questions={this.props.questions} />
          </div>
        </div>
        <QuestionAddContainer />
        <QuestionPreviewContainer />
      </div>
    );
  }
}
