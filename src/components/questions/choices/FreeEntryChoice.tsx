import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import IQuestionChoice from '../../../interfaces/IQuestionChoice';
import IQuestionOption from '../../../models/IQuestionOption';

interface IFreeEntryChoiceProps {
  option: IQuestionOption;
}

interface IFreeEntryChoiceState {
  currentText: string;
}

export default class FreeEntryChoice
  extends SrUiComponent<IFreeEntryChoiceProps, IFreeEntryChoiceState>
  implements IQuestionChoice {
  initialState() {
    return { currentText: '' };
  }

  id(): number {
    return this.props.option.id;
  }

  selected(): boolean {
    return (this.state.currentText || '').trim().length > 0;
  }

  value(): string {
    return this.state.currentText;
  }

  performRender() {
    return (
      <div className="free-entry-choice free-entry">
        {/* // TODO confirm refactor to react-bootstrap FormControl */}
        <textarea
          className="resize-vertical"
          placeholder="Enter your answer here"
          value={this.state.currentText}
          onChange={(e) => {
            this.setState({ currentText: e.target.value });
          }}
        />
      </div>
    );
  }
}
