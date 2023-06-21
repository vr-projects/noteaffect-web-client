import * as React from 'react';
import * as Immutable from 'immutable';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  TabbedViewer,
  QueryUtility,
  Animated,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import QuestionsList from './QuestionsList';
import QuestionsLayout from './QuestionsLayout';

interface IQuestionBuilderDetailProps {
  menu: string;
  questions: Immutable.List<Immutable.Map<string, any>>;
  options: Immutable.List<Immutable.Map<string, any>>;
  loading: LoadStates;
  creating: LoadStates;
}

interface IQuestionBuilderDetailState {}

export default class QuestionBuilderDetail extends SrUiComponent<
  IQuestionBuilderDetailProps,
  IQuestionBuilderDetailState
> {
  performRender() {
    return (
      <div className="question-builder-detail">
        <h1>{Localizer.get('Poll Builder')}</h1>
        <p>
          {Localizer.get(
            'The Poll Builder lets you build interactive questions you can add to your PowerPoint presentations for real-time engagement and feedback.'
          )}
        </p>
        <LoadIndicator
          state={this.props.loading}
          loadingMessage={Localizer.get('Getting questions...')}
          errorMessage={Localizer.get(
            'There was a problem getting your questions.'
          )}
        />
        {this.props.loading === LoadStates.Succeeded ? (
          <QuestionsLayout questions={this.props.questions.toJS()} />
        ) : null}
      </div>
    );
  }
}
