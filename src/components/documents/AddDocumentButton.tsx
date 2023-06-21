import * as React from 'react';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import { connect, DispatchProp } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import {
  SrUiComponent,
  ApiHelpers,
  LoadStates,
  WaitSpinner,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IAddDocumentButtonProps extends DispatchProp<any> {
  handleShowAlert: (status: LoadStates, message: string) => void;
}

interface IAddDocumentButtonState {
  file: any | null;
  saving: LoadStates;
}

class AddDocumentButton extends SrUiComponent<
  IAddDocumentButtonProps,
  IAddDocumentButtonState
> {
  initialState() {
    return {
      file: null,
      saving: LoadStates.Unloaded,
    };
  }

  async onFormSubmit() {
    const { file } = this.state;
    const { handleShowAlert } = this.props;
    if (file === null) {
      return;
    }
    try {
      this.setPartial({
        saving: LoadStates.Loading,
      });

      let formData: any = new FormData();
      formData.append('UserFile', file);

      let resp = await ApiHelpers.create(`userfiles/upload`, formData, {
        contentType: false,
      });

      if (!resp.good) {
        throw new Error('Error uploading document.');
      }

      this.broadcast(AppBroadcastEvents.DocumentAdded);
      this.setPartial({
        saving: LoadStates.Succeeded,
        file: null,
      });
      handleShowAlert(LoadStates.Succeeded, Localizer.get('Document added!'));
    } catch (err) {
      this.setPartial({
        saving: LoadStates.Failed,
      });
      handleShowAlert(
        LoadStates.Failed,
        Localizer.get(
          'Error adding document. Please try again. Only PDF file types are supported.'
        )
      );
      console.error(err);
    }
  }

  onFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setPartialAsync({ file: e.target.files[0] }).then(() => {
      this.onFormSubmit();
    });
  }

  performRender() {
    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.SALES_PRESENTER,
        SystemRoles.DEPARTMENT_ADMIN,
        SystemRoles.CLIENT_ADMIN,
        SystemRoles.ADMIN,
      ])
    )
      return null;
    const { saving } = this.state;
    return (
      <form noValidate onSubmit={this.onFormSubmit} className="mb-0">
        <input
          accept=".pdf"
          id="file-input"
          multiple={false}
          type="file"
          value=""
          onChange={(e) => this.onFileChange(e)}
          onClick={(e) => (e.currentTarget.value = '')}
        />
        <label htmlFor="file-input">
          <Button
            bsStyle="success"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('file-input').click();
            }}
            disabled={saving === LoadStates.Loading}
            className="d-flex justify-content-center"
          >
            {saving === LoadStates.Loading && <WaitSpinner />}
            {saving !== LoadStates.Loading && (
              <>
                <FaPlus />
                <span className="ml-1">{Localizer.get('Add Document')}</span>
              </>
            )}
          </Button>
        </label>
      </form>
    );
  }
}

export default connect<any, void, IAddDocumentButtonProps>(() => {
  return {};
})(AddDocumentButton);
