import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import {
  FaChevronUp,
  FaChevronDown,
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaSave,
} from 'react-icons/fa';
import { SrUiComponent, LoadStates, LoadMask } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IQuestion from '../../models/IQuestion';
import IQuestionOptionType from '../../models/IQuestionOptionType';
import IQuestionType from '../../models/IQuestionType';
import IQuestionOption from '../../models/IQuestionOption';
import IQuestionViewType from '../../models/IQuestionViewType';
import LiveQuestions from '../../utilities/LiveQuestions';

interface IQuestionCreateModalProps {
  show: boolean;
  onClose: () => void;
  options: IQuestionOptionType[];
  creating: LoadStates;
  types: IQuestionType[];
  viewTypes: IQuestionViewType[];
  create: (question: IQuestion) => void;
}

interface IQuestionCreateModalState {
  title: string;
  question: string;
  selectedType: string;
  options: IQuestionOption[];
  rating: string;
  invalidFields: string[];
  selectedVisualization: IQuestionViewType;
  selectedCorrectOptions: number[];
}

export default class QuestionCreateModal extends SrUiComponent<
  IQuestionCreateModalProps,
  IQuestionCreateModalState
> {
  initialState() {
    return {
      title: undefined,
      question: undefined,
      selectedType: undefined,
      rating: undefined,
      options: [this.newChoice()],
      invalidFields: [],
      selectedVisualization: undefined,
      selectedCorrectOptions: [],
    };
  }

  onNewProps(props: IQuestionCreateModalProps) {
    if (!this.props.show && props.show) {
      this.setState({ ...this.initialState() });
    }
  }

  addChoice() {
    const ops = this.state.options || [];
    ops.push(this.newChoice());
    this.setPartial({ options: ops });
  }

  newChoice() {
    return {
      id: new Date().getTime(),
      type: this.props.options.find((t) => t.type === 'selection'),
      label: '',
      required: false,
    };
  }

  moveChoiceUp(index) {
    this.moveChoice(index, index - 1);
  }

  moveChoiceDown(index) {
    this.moveChoice(index, index + 1);
  }

  moveChoice(from, to) {
    const ops = this.state.options || [];
    if (to >= ops.length) {
      let k = to - ops.length + 1;
      while (k--) {
        ops.push(undefined);
      }
    }
    ops.splice(to, 0, ops.splice(from, 1)[0]);
    this.setPartial({ options: ops });
  }

  deleteChoice(index) {
    const ops = this.state.options || [];
    ops.splice(index, 1);
    this.setPartial({ options: ops });
  }

  updateChoice(index, event) {
    const ops = this.state.options || [];
    ops[index].label = event.target.value;
    this.setPartial({ options: ops });
  }

  updateCorrect(
    questionId: number,
    selected: boolean,
    singleSelect: boolean = false
  ) {
    if (singleSelect && selected) {
      this.setPartial({ selectedCorrectOptions: [questionId] });
    } else {
      const correctOptions = this.state.selectedCorrectOptions;
      if (selected) {
        correctOptions.push(questionId);
      } else if (correctOptions.indexOf(questionId) !== -1) {
        correctOptions.splice(correctOptions.indexOf(questionId), 1);
      }
      this.setPartial({ selectedCorrectOptions: correctOptions });
    }
  }

  selectType(type: string) {
    const selected = this.selectedType();
    if (!selected || selected.type !== type) {
      this.setPartial({
        selectedType: type,
        selectedVisualization: undefined,
        selectedCorrectOptions: [],
      });
    }
  }

  selectViewType(type: string) {
    this.setPartial({ selectedVisualization: this.getViewType(type) });
  }

  selectRating(type: string) {
    this.setPartial({ rating: type });
  }

  getViewType(id: string) {
    if (!id) {
      return null;
    }

    if (id === 'no-vis') {
      return { id: null, type: null };
    }

    return this.props.viewTypes.find((vt) => vt.id.toString() === id);
  }

  isSelectType() {
    if (!this.state.selectedType) {
      return false;
    }

    const type = this.selectedType();
    return (
      type && (type.type === 'Single choice' || type.type === 'Multiple choice')
    );
  }

  isMultiSelect() {
    if (!this.state.selectedType) {
      return false;
    }

    const type = this.selectedType();
    return type.type === 'Multiple choice';
  }

  isRatingType() {
    if (!this.state.selectedType) {
      return false;
    }

    const type = this.selectedType();
    return type && type.type === 'Rating';
  }

  isTextType() {
    if (!this.state.selectedType) {
      return false;
    }

    const type = this.selectedType();
    return type && type.type === 'Freeform text entry';
  }

  selectedType(): IQuestionType {
    if (!this.state.selectedType) {
      return null;
    }

    return this.props.types.find(
      (t) => t.id.toString() === this.state.selectedType
    );
  }

  createQuestion() {
    if (!this.validate()) {
      return;
    }

    const question: IQuestion = {
      title: this.state.title,
      question: this.state.question,
      type: { id: parseInt(this.state.selectedType) },
      options: this.getOptions(),
      viewType: this.state.selectedVisualization,
    };

    this.props.create(question);
  }

  getOptions(): IQuestionOption[] {
    const options: IQuestionOption[] = [];

    if (this.isRatingType()) {
      options.push({
        type: { id: parseInt(this.state.rating) },
        required: true,
      });
    } else if (this.isTextType()) {
      options.push({
        type: { id: this.props.options.find((o) => o.type === 'text').id },
        required: true,
      });
    } else {
      this.state.options.forEach(
        (o) =>
          (o.correct = this.state.selectedCorrectOptions.indexOf(o.id) !== -1)
      );
      return this.state.options;
    }

    return options;
  }

  validate(): boolean {
    const fields: string[] = [];

    if ((this.state.title || '').trim().length === 0) {
      fields.push('title');
    }

    if ((this.state.question || '').trim().length === 0) {
      fields.push('question');
    }

    if ((this.state.selectedType || '').trim().length === 0) {
      fields.push('type');
    }

    if (this.isRatingType() && (this.state.rating || '').trim().length === 0) {
      fields.push('rating');
    }

    if (this.isSelectType()) {
      if ((this.state.options || []).length < 2) {
        fields.push('options');
      } else if (
        this.state.options.filter((o) => (o.label || '').trim().length === 0)
          .length > 0
      ) {
        fields.push('choices');
      }
    }

    if (!this.state.selectedVisualization) {
      fields.push('viewType');
    }

    this.setPartial({ invalidFields: fields });
    return fields.length === 0;
  }

  validationWarning(field: string, message: string) {
    if (this.state.invalidFields.indexOf(field) !== -1) {
      return <Alert bsStyle="danger">{Localizer.get(message)}</Alert>;
    }

    return null;
  }

  performRender() {
    const { show, onClose } = this.props;

    return (
      <Modal
        className="question-create-modal"
        keyboard={true}
        show={show}
        bsSize="large"
        backdrop={'static'}
        onHide={() => onClose()}
      >
        <Modal.Header>
          <Modal.Title>{Localizer.get('Add New Question')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="question-create-modal">
            <form className="form-horizontal">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="col-sm-2 control-label">
                  {Localizer.get('Title')}
                </label>
                <div className="col-sm-10">
                  <input
                    disabled={this.props.creating === LoadStates.Loading}
                    id="title"
                    className="form-control"
                    name="title"
                    type="text"
                    value={this.state.title || ''}
                    placeholder="Title"
                    onChange={(e) => this.setPartial({ title: e.target.value })}
                  />
                  {this.validationWarning('title', 'A title is required')}
                </div>
              </div>
              {/* Question */}
              <div className="form-group">
                <label htmlFor="question" className="col-sm-2 control-label">
                  {Localizer.get('Question')}
                </label>
                <div className="col-sm-10">
                  <input
                    disabled={this.props.creating === LoadStates.Loading}
                    id="question"
                    className="form-control"
                    name="question"
                    type="text"
                    value={this.state.question || ''}
                    placeholder="Question"
                    onChange={(e) =>
                      this.setPartial({ question: e.target.value })
                    }
                  />
                  {this.validationWarning('question', 'A question is required')}
                </div>
              </div>
              {/* Question Type */}
              <div className="form-group">
                <label className="col-sm-2 control-label">
                  {Localizer.get('Question Type')}
                </label>
                <div
                  className="col-sm-10"
                  onChange={(e: any) => this.selectType(e.target.value)}
                >
                  {this.props.types.map((t) => (
                    <p key={t.id}>
                      <input
                        disabled={this.props.creating === LoadStates.Loading}
                        type="radio"
                        id={t.type + t.id}
                        name="type-select"
                        value={t.id}
                      />{' '}
                      <label htmlFor={t.type + t.id}>{t.type}</label>
                    </p>
                  ))}
                  {this.validationWarning(
                    'type',
                    'A question type is required'
                  )}
                </div>
              </div>
              {/* Rating TYpe */}
              {this.isRatingType() ? (
                <div className="form-group">
                  <label className="col-sm-2 control-label">
                    {Localizer.get('Rating Type')}
                  </label>
                  <div
                    className="col-sm-10"
                    onChange={(e: any) => this.selectRating(e.target.value)}
                  >
                    {this.props.options
                      .filter((t) => t.type.indexOf('range') === 0)
                      .map((t) => (
                        <p key={t.id}>
                          <input
                            disabled={
                              this.props.creating === LoadStates.Loading
                            }
                            defaultChecked={
                              this.state.rating === t.id.toString()
                            }
                            type="radio"
                            id={t.type + t.id}
                            name="rating-select"
                            value={t.id}
                          />{' '}
                          <label htmlFor={t.type + t.id}>{t.description}</label>
                        </p>
                      ))}
                    {this.validationWarning(
                      'rating',
                      'A rating type is required'
                    )}
                  </div>
                </div>
              ) : null}
              {/* Question Choices */}
              {this.isSelectType() ? (
                <div className="form-group">
                  <label className="col-sm-2 control-label">
                    {Localizer.get('Question Choices')}
                  </label>
                  <div className="col-sm-10 d-flex flex-column">
                    <table className="question-choice-list w-100">
                      <thead>
                        <tr>
                          <th className="position"></th>
                          <th className="input">{Localizer.get('Choice')}</th>
                          <th className="correct">
                            {Localizer.get('Correct')}
                          </th>
                          <th className="move">{Localizer.get('Move')}</th>
                          <th className="delete">{Localizer.get('Delete')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.options.map((o, i) => (
                          <tr key={i.toString() + o.id}>
                            <td className="position">{i + 1}.</td>
                            <td className="input">
                              <input
                                className="form-control"
                                type="text"
                                placeholder={Localizer.get('Enter choice text')}
                                onChange={(e) => this.updateChoice(i, e)}
                                value={o.label || ''}
                              />
                            </td>
                            <td className="correct text-center">
                              {this.isMultiSelect() ? (
                                <input
                                  type="checkbox"
                                  onChange={(e) =>
                                    this.updateCorrect(o.id, e.target.checked)
                                  }
                                  checked={
                                    this.state.selectedCorrectOptions.indexOf(
                                      o.id
                                    ) !== -1
                                  }
                                />
                              ) : (
                                <input
                                  type="radio"
                                  onChange={(e) =>
                                    this.updateCorrect(
                                      o.id,
                                      e.target.checked,
                                      true
                                    )
                                  }
                                  checked={
                                    this.state.selectedCorrectOptions.indexOf(
                                      o.id
                                    ) !== -1
                                  }
                                  name="single-correct-answer"
                                />
                              )}
                            </td>
                            <td className="move">
                              {i === 0 ? null : (
                                <Button
                                  className="na-btn-reset-width"
                                  bsStyle="link"
                                  onClick={() => this.moveChoiceUp(i)}
                                >
                                  <FaChevronUp />
                                </Button>
                              )}
                              {i === this.state.options.length - 1 ? null : (
                                <Button
                                  className="na-btn-reset-width"
                                  bsStyle="link"
                                  onClick={() => this.moveChoiceDown(i)}
                                >
                                  <FaChevronDown />
                                </Button>
                              )}
                            </td>
                            <td className="delete">
                              <Button
                                className="na-btn-reset-width"
                                bsStyle="link"
                                onClick={() => this.deleteChoice(i)}
                              >
                                <FaTrashAlt />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Button
                      bsStyle="success"
                      className="mt-1 align-self-end"
                      onClick={() => this.addChoice()}
                    >
                      <FaPlus />
                      <span className="ml-1">
                        {Localizer.get('Add choice')}
                      </span>
                    </Button>
                    {this.validationWarning(
                      'options',
                      'At least two question choices are required'
                    )}
                    {this.validationWarning(
                      'choices',
                      'All choices must have a label'
                    )}
                  </div>
                </div>
              ) : null}
              {/* Visualization Type */}
              {this.selectedType() ? (
                <div className="form-group">
                  <label className="col-sm-2 control-label">
                    {Localizer.get('Visualization Type')}
                  </label>
                  <div
                    className="col-sm-10"
                    onChange={(e: any) => this.selectViewType(e.target.value)}
                  >
                    {LiveQuestions.viewTypesForQuestionType(
                      this.selectedType(),
                      this.props.viewTypes
                    ).map((t) => (
                      <p key={t.id || 'no-vis'}>
                        <input
                          disabled={this.props.creating === LoadStates.Loading}
                          type="radio"
                          id={t.type + (t.id || 'no-vis')}
                          name="view-type-select"
                          value={t.id || 'no-vis'}
                        />{' '}
                        <label htmlFor={t.type + (t.id || 'no-vis')}>
                          {t.type}
                        </label>
                      </p>
                    ))}
                    {this.validationWarning(
                      'viewType',
                      'A visualization choice is required'
                    )}
                  </div>
                </div>
              ) : null}
            </form>

            <LoadMask state={this.props.creating} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end">
            <Button
              bsStyle="default"
              onClick={() => onClose()}
              className="mr-1"
            >
              <FaTimes />
              <span className="ml-1">{Localizer.get('Cancel')}</span>
            </Button>
            <Button bsStyle="info" onClick={() => this.createQuestion()}>
              <FaSave />
              <span className="ml-1">{Localizer.get('Save question')}</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}
