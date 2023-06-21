import * as React from 'react';
import { FaStar } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import IQuestionChoice from '../../../interfaces/IQuestionChoice';
import IQuestionOption from '../../../models/IQuestionOption';

interface IRatingChoiceProps {
  option: IQuestionOption;
  questionId: number;
  totalStars: number;
}

interface IRatingChoiceState {
  currentRating: number;
}

export default class RatingChoice
  extends SrUiComponent<IRatingChoiceProps, IRatingChoiceState>
  implements IQuestionChoice {
  initialState() {
    return { currentRating: 0 };
  }

  id(): number {
    const { option } = this.props;
    return option.id;
  }

  selected(): boolean {
    const { currentRating } = this.state;
    return currentRating > 0;
  }

  value(): string {
    const { currentRating } = this.state;
    return currentRating.toString();
  }

  performRender() {
    const { totalStars } = this.props;
    const starsToBuild = Array.from(Array(totalStars).keys()); // create array with indices as values

    return (
      <div className="rating-choice rating text-center">
        {starsToBuild.map((starIndex) => (
          <span
            key={starIndex}
            onClick={() => this.setState({ currentRating: starIndex + 1 })}
            className={`rating-item ${
              starIndex + 1 <= this.state.currentRating ? 'selected' : ''
            } star-${starIndex}`}
          >
            <FaStar />
          </span>
        ))}
      </div>
    );
  }
}
