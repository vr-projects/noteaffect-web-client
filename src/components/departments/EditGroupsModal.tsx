import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { FaTimes, FaSave } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import IAdminTag from '../../models/IAdminTag';
import EditGroupsTag from './EditGroupsTag';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IEditGroupsModalProps {
  course: ICourse;
  groups: IAdminTag[];
  onClose: () => void;
}

interface IEditGroupsModalState {
  loading: LoadStates;
  selections: IAdminTag[];
}

export default class EditGroupsModal extends SrUiComponent<
  IEditGroupsModalProps,
  IEditGroupsModalState
> {
  initialState() {
    return { loading: LoadStates.Unloaded, selections: [] };
  }

  onNewProps(props: IEditGroupsModalProps) {
    if (!props.course) {
      this.setState({ loading: LoadStates.Unloaded, selections: [] });
    } else if (!this.props.course) {
      this.setState({
        loading: LoadStates.Unloaded,
        selections: this.tagsFromCourse(props.course, props.groups),
      });
    }
  }

  tagsFromCourse(course: ICourse, allGroups: IAdminTag[]): IAdminTag[] {
    let courseTags = (course.courseTags || []).map((ct) => ct.adminTagId);
    return allGroups.filter((t) => courseTags.indexOf(t.id) !== -1);
  }

  selectTag(tag: IAdminTag) {
    let tags = this.state.selections;
    if (tags.find((t) => t.id === tag.id)) {
      return;
    }
    tags.push(tag);
    this.setPartial({ selections: tags });
  }

  deselectTag(tag: IAdminTag) {
    let tags = this.state.selections;
    let existing = tags.find((t) => t.id === tag.id);
    if (!existing) {
      return;
    }
    tags.splice(tags.indexOf(existing), 1);
    this.setPartial({ selections: tags });
  }

  selectedTags(): IAdminTag[] {
    return this.state.selections;
  }

  unselectedTags(): IAdminTag[] {
    let selectedIds = this.selectedTags().map((st) => st.id);
    return this.props.groups.filter((g) => selectedIds.indexOf(g.id) === -1);
  }

  async updateCourseTags() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    let selectedIds = this.selectedTags().map((st) => st.id);
    let courseId = this.props.course.id;

    this.setPartial({ loading: LoadStates.Loading });
    const resp = await ApiHelpers.update(
      `series/${this.props.course.id}/tags`,
      { selectedTagIds: selectedIds }
    );
    if (
      !this.mounted() ||
      !this.props.course ||
      courseId !== this.props.course.id
    ) {
      return;
    }

    if (resp.good) {
      this.close();
      this.broadcast(AppBroadcastEvents.DepartmentCourseUpdated);
    } else {
      this.setState({ loading: LoadStates.Failed });
    }
  }

  close() {
    this.setState({ loading: LoadStates.Unloaded, selections: [] });
    this.props.onClose();
  }

  performRender() {
    let selected = this.selectedTags();
    let unselected = this.unselectedTags();
    return (
      <Modal
        show={!!this.props.course}
        onHide={() => this.close()}
        title={
          Localizer.get('Edit groups for ') +
          (this.props.course ? this.props.course.name : '')
        }
        keyboard
        backdrop={'static'}
      >
        <Modal.Header>
          <Modal.Title>
            {Localizer.get('Edit groups for ') +
              (this.props.course ? this.props.course.name : '')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rel">
            <div className="selected-groups">
              <h4>{Localizer.get('Selected groups')}</h4>
              {selected.map((t) => (
                <EditGroupsTag
                  selected
                  tag={t}
                  key={t.id}
                  onClick={(tag) => this.deselectTag(tag)}
                />
              ))}
              {selected.length === 0 ? (
                <Alert bsStyle="info">
                  {Localizer.get('No selected groups')}
                </Alert>
              ) : null}
            </div>
            <hr />
            <div className="unselected-groups">
              <h4>{Localizer.get('Unselected groups')}</h4>
              {unselected.map((t) => (
                <EditGroupsTag
                  tag={t}
                  key={t.id}
                  onClick={(tag) => this.selectTag(tag)}
                />
              ))}
              {unselected.length === 0 ? (
                <Alert bsStyle="info">
                  {Localizer.get('No unselected groups')}
                </Alert>
              ) : null}
            </div>

            <LoadMask state={this.state.loading} />
            <LoadIndicator
              state={this.state.loading}
              loadingMessage={Localizer.getFormatted(
                GENERAL_COMPONENT.UPDATING_COURSE_MEETING
              )}
              errorMessage={Localizer.get(
                'Something went wrong.  Please try again later.'
              )}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-right margin margin-top-md">
            <Button bsStyle="default" onClick={() => this.close()}>
              <FaTimes />
              <span className="ml-1">{Localizer.get('Cancel')}</span>
            </Button>{' '}
            <Button bsStyle="success" onClick={() => this.updateCourseTags()}>
              <FaSave />
              <span className="ml-1">{Localizer.get('Save')}</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}
