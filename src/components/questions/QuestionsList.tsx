import * as React from 'react';
import { Alert } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IQuestion from '../../models/IQuestion';
import QuestionItem from './QuestionItem';

interface IQuestionsListProps {
  questions: IQuestion[];
}

interface IQuestionsListState {}

export default class QuestionsList extends SrUiComponent<
  IQuestionsListProps,
  IQuestionsListState
> {
  performRender() {
    const { questions } = this.props;

    return (
      <div className="questions-list">
        {isEmpty(questions) || isUndefined(questions) ? (
          <Alert bsStyle="info">
            {Localizer.get("You haven't built any questions.")}
          </Alert>
        ) : (
          <>
            {questions.map((q) => (
              <QuestionItem key={q.id} question={q} />
            ))}
          </>
        )}
      </div>
    );
  }
}
