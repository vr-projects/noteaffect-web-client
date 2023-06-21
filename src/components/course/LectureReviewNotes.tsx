import { SrUiComponent } from 'react-strontium';
import * as React from 'react';
import Localizer from '../../utilities/Localizer';

interface ILectureReviewerNotesProps {
  notes: string;
  container: HTMLDivElement;
}

interface ILectureReviewerNotesState {
  style: any;
}

export default class LectureReviewerNotes extends SrUiComponent<
  ILectureReviewerNotesProps,
  ILectureReviewerNotesState
> {
  initialState() {
    return { style: this.styleFromContainer(this.props) };
  }

  resizeCallback() {
    return () => {
      this.setState({ style: this.styleFromContainer(this.props) });
    };
  }

  onNewProps(props: ILectureReviewerNotesProps) {
    this.setState({ style: this.styleFromContainer(props) });
  }

  // TODO - tech debt clientHeight should be handled with CSS, not JS listeners
  styleFromContainer(props: ILectureReviewerNotesProps) {
    if (props.container) {
      return { height: props.container.clientHeight };
    } else {
      return {};
    }
  }

  performRender() {
    return (
      <div className={'review-notes disabled'}>
        {/* // TODO confirm styling if needs form-control */}
        <textarea
          className="resize-vertical"
          placeholder={Localizer.get('No notes entered')}
          value={this.props.notes || ''}
          style={this.state.style}
          disabled={true}
        />
      </div>
    );
  }
}
