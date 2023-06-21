import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import { Alert, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { SrUiComponent, Animated } from 'react-strontium';
import IUserQuestion from '../../models/IUserQuestion';
import Localizer from '../../utilities/Localizer';
import QuestionTableItem from './QuestionTableItem';
import SearchFilterInput from '../controls/SearchFilterInput';
import SortByDropdown from '../controls/SortByDropdown';

interface IQuestionTableProps {
  questions: IUserQuestion[];
  large?: boolean;
  initialSort?: SORT_BY_TYPE;
}

interface IQuestionTableState {
  sortBy: SORT_BY_TYPE;
  inputFilter: string;
  filterLabel: string;
  answeredOnly: boolean;
  mineOnly: boolean;
}

export enum SORT_BY_TYPE {
  DATE = 'Date',
  NAME = 'Name',
  VOTES = 'Votes',
}

const sortByMenuItems = [
  { label: SORT_BY_TYPE.DATE, value: 'Date' },
  { label: SORT_BY_TYPE.NAME, value: 'Name' },
  { label: SORT_BY_TYPE.VOTES, value: 'Votes' },
];

export default class QuestionTable extends SrUiComponent<
  IQuestionTableProps,
  IQuestionTableState
> {
  initialState(): IQuestionTableState {
    const { initialSort, large } = this.props;

    return {
      sortBy: initialSort || (large ? SORT_BY_TYPE.DATE : SORT_BY_TYPE.VOTES),
      inputFilter: '',
      filterLabel: null,
      answeredOnly: false,
      mineOnly: false,
    };
  }

  updateSortBy(type: SORT_BY_TYPE) {
    this.setPartial({ sortBy: type });
  }

  updateInputFilter(value: string) {
    this.setPartial({ filterLabel: value });
    this.deferred(
      () => this.setPartial({ inputFilter: value }),
      300,
      'updateFilter'
    );
  }

  handleClearedInputFilter() {
    this.setPartial({
      inputFilter: '',
      filterLabel: null,
    });
  }

  /**
   * Method filters and sorts questions according to checkboxes and input filter
   */
  questionsForView(): IUserQuestion[] {
    const { questions = [] } = this.props;
    const { answeredOnly, mineOnly, inputFilter } = this.state;
    const copiedQuestions = [...questions];

    // ** Filtering
    const filteredQuestions = copiedQuestions
      .filter((question) => (answeredOnly ? question.answered : true))
      .filter((question) => (mineOnly ? question.userCreated : true))
      .filter((question) =>
        !isEmpty(inputFilter)
          ? (question.question || '').toLowerCase().includes(inputFilter) ||
            (question.answer || '').toLowerCase().includes(inputFilter)
          : true
      );

    // ** Sorting
    const sortedFilteredQuestions = this.sortedQuestions(filteredQuestions);
    return sortedFilteredQuestions;
  }

  sortedQuestions(questions: IUserQuestion[] = []): IUserQuestion[] {
    const { sortBy } = this.state;
    const copiedQuestions = [...questions];

    switch (sortBy) {
      case SORT_BY_TYPE.DATE:
        return copiedQuestions.sort((a, b) => {
          const dateOrder =
            (b.created || 3000000000) - (a.created || 3000000000);
          if (dateOrder !== 0) {
            return dateOrder;
          }
          return (b.question || '').localeCompare(a.question || '');
        });
      case SORT_BY_TYPE.NAME:
        return copiedQuestions.sort((a, b) =>
          a.question.localeCompare(b.question)
        );
      case SORT_BY_TYPE.VOTES:
        return copiedQuestions.sort((a, b) => b.votes - a.votes);
      default:
        return copiedQuestions;
    }
  }

  performRender() {
    const { large, questions } = this.props;
    const { sortBy, answeredOnly, mineOnly } = this.state;
    const displayQuestions = this.questionsForView();
    const filteredOut = displayQuestions.length === 0 && questions.length > 0;

    return (
      <div className="question-table">
        {large && (
          <div className="search-filter d-flex justify-content-between align-items-center">
            <div className="flex-grow mr-mr-1">
              <SearchFilterInput
                placeholder={Localizer.get('Search questions')}
                updateCurrentVal={(val) => this.updateInputFilter(val)}
                clearedInput={() => this.handleClearedInputFilter()}
              />
            </div>
            <div>
              <SortByDropdown
                id={`sortby-question-table`}
                className="instructor-courses-controls--sort ml-1"
                menuItems={sortByMenuItems}
                onSelect={(val: SORT_BY_TYPE) => this.updateSortBy(val)}
                selectedVal={sortBy}
              />
            </div>
          </div>
        )}
        <div className="list-filters">
          <div className="d-flex">
            {/* Checkbox 1 Answered only */}
            <FormGroup controlId="formControlAnsweredOnly" className="d-flex">
              <FormControl
                type="checkbox"
                checked={answeredOnly}
                onChange={(e: any) =>
                  this.setPartial({ answeredOnly: e.target.checked })
                }
              />
              <ControlLabel className="ml-1">
                {Localizer.get('Answered only')}
              </ControlLabel>
            </FormGroup>
            {/* Checkbox 2 My questions only */}
            <FormGroup controlId="formControlMineOnly" className="d-flex ml-2">
              <FormControl
                type="checkbox"
                checked={mineOnly}
                onChange={(e: any) =>
                  this.setPartial({ mineOnly: e.target.checked })
                }
              />
              <ControlLabel className="ml-1">
                {Localizer.get('My questions only')}
              </ControlLabel>
            </FormGroup>
          </div>
        </div>
        <hr />
        {filteredOut && (
          <Animated in>
            <Alert bsStyle="info">
              {Localizer.get(
                'There are no questions matching your search and/or selections.'
              )}
            </Alert>
          </Animated>
        )}
        {!isEmpty(displayQuestions) && (
          <Animated in>
            <div className="questions-table-container">
              <table className={`student-questions ${large ? 'large' : ''}`}>
                <thead>
                  <tr>
                    <th className="votes-header">{Localizer.get('Votes')}</th>
                    <th className="questions-header">
                      {Localizer.get('Question')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayQuestions.map((q) => (
                    <QuestionTableItem large={large} question={q} key={q.id} />
                  ))}
                </tbody>
              </table>
            </div>
          </Animated>
        )}
      </div>
    );
  }
}
