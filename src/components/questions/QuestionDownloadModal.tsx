import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { FaDownload } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IQuestion from '../../models/IQuestion';
import * as QuestionActions from '../../store/questions/QuestionsActions';
import IImmutableObject from '../../interfaces/IImmutableObject';
import GenericModal from '../controls/GenericModal';
import Link from '../controls/Link';

interface IConnectedQuestionDownloadModalProps extends DispatchProp<any> {}

interface IQuestionDownloadModalProps {
  question: IImmutableObject<IQuestion>;
}

interface IQuestionDownloadModalState {}

class QuestionDownloadModal extends SrUiComponent<
  IConnectedQuestionDownloadModalProps & IQuestionDownloadModalProps,
  IQuestionDownloadModalState
> {
  url() {
    if (this.props.question && this.props.question.size > 0) {
      return `/api/questions/${this.props.question.get('id')}/slides`;
    }
    return '#';
  }

  close() {
    this.props.dispatch(QuestionActions.setQuestionForAdd(undefined));
  }

  performRender() {
    const { question } = this.props;

    return (
      <>
        <GenericModal
          show={question && question.size > 0}
          onCloseClicked={() => this.close()}
          modalTitle={Localizer.get('Add Live Question to Presentation')}
        >
          <div className="question-download-modal">
            <p>
              {Localizer.get(
                'To add Live Questions to your presentation, click the Download segments button to download a small PowerPoint file.'
              )}
            </p>
            <p>
              {Localizer.get(
                'The file will contain two segments: an instruction segment, and a content segment that will be placed in your own presentation.'
              )}
            </p>
            <p>
              {Localizer.get(
                'Please follow the instructions on the first segment from the downloaded file to get started.'
              )}
            </p>
            <Link href={this.url()} className="btn full btn-success">
              <FaDownload />
              <span className="ml-1">{Localizer.get('Download segments')}</span>
            </Link>
          </div>
        </GenericModal>
      </>
    );
  }
}

export default connect<
  IConnectedQuestionDownloadModalProps,
  void,
  IQuestionDownloadModalProps
>(() => {
  return {};
})(QuestionDownloadModal);
