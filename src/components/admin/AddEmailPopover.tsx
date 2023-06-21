import * as React from 'react';
import { Button } from 'react-bootstrap';
import { SrUiComponent, Popover, ApiHelpers } from 'react-strontium';
import {
  GENERAL_COMPONENT,
  ADD_EMAIL_POPOVER_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';

// TODO tech debt refactor to GenericModal

interface IAddEmailPopoverProps {
  series: ICourse;
  instructor?: boolean;
}

interface IAddEmailPopoverState {
  email: string;
}

export default class AddEmailPopover extends SrUiComponent<
  IAddEmailPopoverProps,
  IAddEmailPopoverState
> {
  initialState() {
    return { email: undefined };
  }

  async addEmail() {
    const email = this.state.email;
    const lecturer = this.props.instructor === true;
    document.getElementsByTagName('body')[0].click();
    this.setState({ email: undefined });
    await ApiHelpers.create(`series/${this.props.series.id}/users`, {
      email,
      lecturer,
    });
  }

  performRender() {
    const content = (
      <div>
        <p>
          {this.props.instructor
            ? Localizer.getFormatted(
                ADD_EMAIL_POPOVER_COMPONENT.DESCRIPTION_INSTRUCTOR_PRESENTER
              )
            : Localizer.getFormatted(
                ADD_EMAIL_POPOVER_COMPONENT.DESCRIPTION_STUDENT_PARTICIPANT
              )}
        </p>
        <textarea
          className="form-control resize-vertical"
          autoFocus
          value={this.state.email || ''}
          onChange={(e) => this.setState({ email: e.target.value })}
          placeholder="Email addresses (separate by line, comma, or semi-colon)"
        />
        <br />
        <div className="d-flex justify-content-end">
          <Button bsStyle="success" onClick={() => this.addEmail()}>
            {Localizer.get('Add')}
          </Button>
        </div>
      </div>
    );
    return (
      <Popover
        id="add-user-po"
        placement="top"
        content={content}
        title="Add by email"
      >
        <Button bsStyle="info">
          {this.props.instructor
            ? Localizer.getFormatted(GENERAL_COMPONENT.ADD_INSTRUCTOR_PRESENTER)
            : Localizer.getFormatted(GENERAL_COMPONENT.ADD_STUDENT_PARTICIPANT)}
        </Button>
      </Popover>
    );
  }
}
