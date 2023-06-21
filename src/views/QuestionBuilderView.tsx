import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import QuestionBuilderGuard from '../components/guards/QuestionBuilderGuard';

interface IQuestionsBuilderViewProps {
  menu: string;
}

interface IQuestionsBuilderViewState {}

export default class QuestionsBuilderView extends AppViewWrapper<
  IQuestionsBuilderViewProps & IAppViewWrapperProps,
  IQuestionsBuilderViewState
> {
  getView() {
    const { menu } = this.props;

    return (
      <div id="question-builder-view" className="question-builder-view section">
        <QuestionBuilderGuard menu={menu} />
      </div>
    );
  }

  getMenu() {
    return 'questions';
  }
}
