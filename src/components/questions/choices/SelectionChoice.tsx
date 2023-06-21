import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import IQuestionChoice from '../../../interfaces/IQuestionChoice';
import IQuestionOption from '../../../models/IQuestionOption';

interface ISelectionChoiceProps {
  changed: (option: IQuestionOption, selected: boolean) => void;
  selected: boolean;
  questionId: number;
  option: IQuestionOption;
  multi: boolean;
}

interface ISelectionChoiceState {}

export default class SelectionChoice
  extends SrUiComponent<ISelectionChoiceProps, ISelectionChoiceState>
  implements IQuestionChoice {
  selected(): boolean {
    return this.props.selected;
  }

  id(): number {
    return this.props.option.id;
  }

  value(): string {
    return null;
  }

  performRender() {
    const {
      questionId,
      option,
      option: { id: optionId, label: optionLabel },
      selected,
      multi,
    } = this.props;
    const id = `question-${questionId}-${optionId}`;

    return (
      <div className="selection-choice selection">
        <input
          onChange={(e) => this.props.changed(option, e.target.checked)}
          checked={selected}
          id={id}
          type={multi ? 'checkbox' : 'radio'}
          name={(multi ? optionId : questionId).toString()}
        />
        <label htmlFor={id}>{optionLabel}</label>
      </div>
    );
  }
}
