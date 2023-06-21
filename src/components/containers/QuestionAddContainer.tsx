import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import QuestionMappers from '../../mappers/QuestionMappers';
import QuestionDownloadModal from '../questions/QuestionDownloadModal';
import IQuestionToAddProps from '../../interfaces/IQuestionToAddProps';

interface IQuestionAddContainerProps {}

interface IQuestionAddContainerState {}

class QuestionAddContainer extends SrUiComponent<
  IQuestionAddContainerProps & IQuestionToAddProps,
  IQuestionAddContainerState
> {
  performRender() {
    return <QuestionDownloadModal question={this.props.question} />;
  }
}

export default connect(QuestionMappers.AddMapper)(QuestionAddContainer);
