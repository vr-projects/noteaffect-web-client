import * as React from 'react';
import { Button } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import IQuestion from '../../models/IQuestion';
import IQuestionChoice from '../../interfaces/IQuestionChoice';
import IQuestionOption from '../../models/IQuestionOption';
import Localizer from '../../utilities/Localizer';
import IQuestionAnswer from '../../models/IQuestionAnswer';
import RatingChoice from './choices/RatingChoice';
import FreeEntryChoice from './choices/FreeEntryChoice';
import SelectionChoice from './choices/SelectionChoice';
interface ILiveQuestionRendererProps {
  question: IQuestion;
  hideQuestionHeader?: boolean;
  cancel: () => void;
  completed: (question: IQuestion, answers: IQuestionAnswer[]) => void;
  enabled: boolean;
}

interface ILiveQuestionRendererState {
  selectedChoices: number[];
}

enum QUESTION_CHOICE_TYPE {
  RANGE_1_5 = 'range-1-5',
  RANGE_1_10 = 'range-1-10',
  TEXT = 'text',
  SELECTION = 'selection',
}

class LiveQuestionRenderer extends SrUiComponent<
  ILiveQuestionRendererProps,
  ILiveQuestionRendererState
> {
  private _choiceMap: { [key: string]: IQuestionChoice } = {};

  initialState() {
    return { selectedChoices: [] };
  }

  onComponentMounted() {
    this._choiceMap = {};
  }

  onNewProps(props: ILiveQuestionRendererProps) {
    const { question: currQuestion } = props;
    const { question: prevQuestion } = this.props;
    const existingId = prevQuestion ? prevQuestion.lectureQuestionId : null;
    const newId = currQuestion ? currQuestion.lectureQuestionId : null;
    if (existingId !== newId) {
      this._choiceMap = {};
      this.setState(this.initialState());
    }
  }

  storeChoice(key: string, ref: IQuestionChoice) {
    if (!ref) {
      return;
    }

    this._choiceMap[key] = ref;
  }

  choiceSelected(option: IQuestionOption, selected: boolean) {
    const { question } = this.props;
    const { selectedChoices } = this.state;

    if (question.type.type === 'Multiple choice') {
      const selections = selectedChoices;
      const index = selections.indexOf(option.id);

      if (selected && index === -1) {
        selections.push(option.id);
      } else if (!selected && index !== -1) {
        selections.splice(index, 1);
      }
      this.setState({ selectedChoices: selections });
    } else {
      if (selected) {
        this.setState({ selectedChoices: [option.id] });
      }
    }
  }

  getAnswers(): IQuestionAnswer[] {
    return Object.keys(this._choiceMap)
      .filter((k) => this._choiceMap[k].selected())
      .map((k) => {
        const qa: IQuestionAnswer = {
          optionId: this._choiceMap[k].id(),
          value: this._choiceMap[k].value(),
        };
        return qa;
      });
  }

  performRender() {
    const {
      question,
      hideQuestionHeader,
      enabled,
      cancel,
      completed,
    } = this.props;
    // TODO - adjust z-index
    if (!question) return null;

    const {
      question: { options = [] },
    } = this.props;

    return (
      <div className="live-question-renderer live-question">
        {!hideQuestionHeader && (
          <>
            <h3>{question.question}</h3>
            <hr />
          </>
        )}
        <div className="choices">
          {options.map((option) => {
            const { type, id: optionId } = option;
            const { question } = this.props;

            switch (type.type) {
              case QUESTION_CHOICE_TYPE.RANGE_1_5:
                return (
                  <RatingChoice
                    option={option}
                    ref={(r) => this.storeChoice(optionId.toString(), r)}
                    totalStars={5}
                    questionId={question.id}
                    key={optionId}
                  />
                );
              case QUESTION_CHOICE_TYPE.RANGE_1_10:
                return (
                  <RatingChoice
                    option={option}
                    ref={(r) => this.storeChoice(optionId.toString(), r)}
                    totalStars={10}
                    questionId={question.id}
                    key={option.id}
                  />
                );
              case QUESTION_CHOICE_TYPE.TEXT:
                return (
                  <FreeEntryChoice
                    option={option}
                    ref={(r) => this.storeChoice(optionId.toString(), r)}
                    key={optionId}
                  />
                );
              case QUESTION_CHOICE_TYPE.SELECTION:
                return (
                  <SelectionChoice
                    key={optionId}
                    questionId={question.id}
                    option={option}
                    ref={(r) => this.storeChoice(optionId.toString(), r)}
                    selected={
                      this.state.selectedChoices.indexOf(optionId) !== -1
                    }
                    changed={(o, s) => this.choiceSelected(o, s)}
                    multi={question.type.type === 'Multiple choice'}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
        {enabled && (
          <div className="text-right margin margin-top-md">
            <Button bsStyle="default" onClick={() => cancel()}>
              {Localizer.get("Don't answer")}
            </Button>

            <Button
              bsStyle="success"
              onClick={() => completed(question, this.getAnswers())}
            >
              {Localizer.get('Submit answer')}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default LiveQuestionRenderer;
