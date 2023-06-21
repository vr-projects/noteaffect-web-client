import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import QuestionMappers from '../../mappers/QuestionMappers';
import IQuestionToPreviewProps from '../../interfaces/IQuestionToPreviewProps';
import QuestionPreviewModal from '../questions/QuestionPreviewModal';

interface IQuestionPreviewContainerProps {}

interface IQuestionPreviewContainerState {}

class QuestionPreviewContainer extends SrUiComponent<
  IQuestionPreviewContainerProps & IQuestionToPreviewProps,
  IQuestionPreviewContainerState
> {
  performRender() {
    return <QuestionPreviewModal question={this.props.question} />;
  }
}

export default connect(QuestionMappers.PreviewMapper)(QuestionPreviewContainer);
