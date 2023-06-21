import * as React from 'react';
import isNull from 'lodash/isNull';
import { SrUiComponent } from 'react-strontium';
import { Modal, Sizes, Button } from 'react-bootstrap';
import {
  FaTimes,
  FaSave,
  FaCheck,
  FaTrashAlt,
  FaBan,
  FaPen,
  FaFileDownload,
  FaPaperPlane,
} from 'react-icons/fa';
import Localizer from '../../utilities/Localizer';

interface IGenericModalProps {
  show: boolean;
  modalTitle: string;
  onCloseClicked: () => void;
  onConfirmClicked?: () => void;
  bodyClassName?: string;
  children: React.ReactNode;
  hasCloseButton?: boolean;
  closeButtonDisable?: boolean;
  closeButtonType?: 'close' | 'cancel';
  closeButtonStyle?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  hasConfirmButton?: boolean;
  confirmButtonDisable?: boolean;
  confirmButtonType?: 'save' | 'done' | 'remove' | 'edit' | 'download' | 'send';
  confirmButtonText?: string;
  confirmButtonStyle?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  fileDownloadUrl?: string;
  fileDownloadName?: string;
  size?: Sizes;
  backdropClassName?: string;
}

interface IGenericModalState {}

class GenericModal extends SrUiComponent<
  IGenericModalProps,
  IGenericModalState
> {
  performRender() {
    const {
      show,
      modalTitle,
      children,
      bodyClassName,
      hasCloseButton = true,
      closeButtonDisable = false,
      closeButtonType = 'close',
      closeButtonStyle = 'default',
      hasConfirmButton = false,
      confirmButtonDisable = false,
      confirmButtonType = 'save',
      confirmButtonStyle = 'info',
      confirmButtonText,
      fileDownloadName = null,
      fileDownloadUrl = null,
      onCloseClicked,
      onConfirmClicked,
      size = null,
      backdropClassName,
    } = this.props;

    return (
      <Modal
        className="generic-modal-container"
        keyboard={true}
        show={show}
        backdrop={'static'}
        onHide={() => onCloseClicked()}
        bsSize={!isNull(size) ? size : null}
        backdropClassName={backdropClassName ? backdropClassName : ''}
      >
        <Modal.Header>
          <h3>{Localizer.get(modalTitle)}</h3>
        </Modal.Header>
        <Modal.Body>
          <div className={`generic-modal ${bodyClassName}`}>{children}</div>
        </Modal.Body>
        <Modal.Footer>
          {hasCloseButton && (
            <Button
              bsStyle={closeButtonStyle}
              disabled={closeButtonDisable}
              onClick={() => onCloseClicked()}
            >
              {closeButtonType === 'close' && (
                <>
                  <FaTimes />
                  <span className="ml-1">{Localizer.get('Close')}</span>
                </>
              )}
              {closeButtonType === 'cancel' && (
                <>
                  <FaBan />
                  <span className="ml-1">{Localizer.get('Cancel')}</span>
                </>
              )}
            </Button>
          )}
          {hasConfirmButton && (
            <Button
              bsStyle={confirmButtonStyle}
              disabled={confirmButtonDisable}
              onClick={() => onConfirmClicked()}
              href={fileDownloadUrl ? fileDownloadUrl : null}
              download={fileDownloadName ? fileDownloadName : null}
            >
              {confirmButtonType === 'save' && (
                <>
                  <FaSave />
                  <span className="ml-1">
                    {confirmButtonText
                      ? confirmButtonText
                      : Localizer.get('Save')}
                  </span>
                </>
              )}
              {confirmButtonType === 'download' && (
                <>
                  <FaFileDownload />
                  <span className="ml-1">
                    {confirmButtonText
                      ? confirmButtonText
                      : Localizer.get('Download')}
                  </span>
                </>
              )}
              {confirmButtonType === 'done' && (
                <>
                  <FaCheck />
                  <span className="ml-1">
                    {confirmButtonText
                      ? confirmButtonText
                      : Localizer.get('Done')}
                  </span>
                </>
              )}
              {confirmButtonType === 'remove' && (
                <>
                  <FaTrashAlt />
                  <span className="ml-1">
                    {confirmButtonText
                      ? confirmButtonText
                      : Localizer.get('Remove')}
                  </span>
                </>
              )}
              {confirmButtonType === 'edit' && (
                <>
                  <FaPen />
                  <span className="ml-1">
                    {confirmButtonText
                      ? confirmButtonText
                      : Localizer.get('Edit')}
                  </span>
                </>
              )}
              {confirmButtonType === 'send' && (
                <>
                  <FaPaperPlane />
                  <span className="ml-1">
                    {confirmButtonText
                      ? confirmButtonText
                      : Localizer.get('Send')}
                  </span>
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}

export default GenericModal;
