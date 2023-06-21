import React from 'react';
import Localizer from '../../utilities/Localizer';
import { Alert, Image as ImageComponent } from 'react-bootstrap';
import DocumentsSVG from '../../svgs/empty-bro.svg';
import AddDocumentButton from './AddDocumentButton';
import { Animated, LoadStates, SrUiComponent } from 'react-strontium';

interface IMyDocumentsZeroProps {
  className?: string;
  handleShowAlert: (status: LoadStates, message: string) => void;
  handleDismiss: () => void;
  showFileAlert: boolean;
  fileActionSuccess: boolean;
  fileAlertMessage: string;
}

interface IMyDocumentsZeroState {}

class MyDocumentsZero extends SrUiComponent<
  IMyDocumentsZeroProps,
  IMyDocumentsZeroState
> {
  initialState() {
    return {};
  }
  performRender() {
    const {
      handleShowAlert,
      handleDismiss,
      className,
      showFileAlert,
      fileActionSuccess,
      fileAlertMessage,
    } = this.props;
    return (
      <>
        {showFileAlert && (
          <Animated in>
            <Alert
              bsStyle={`${fileActionSuccess ? 'success' : 'danger'}`}
              onDismiss={() => handleDismiss()}
              className="mt-3"
              style={{ marginBottom: '-8px' }}
            >
              {fileAlertMessage}
            </Alert>
          </Animated>
        )}
        <div className={`my-documents-zero ${className}`}>
          <div className="zero-grid">
            <div className="message-btn-container">
              <h1 className="message">
                {Localizer.get('No documents found...')}
              </h1>
              <AddDocumentButton
                handleShowAlert={(status, fileAlertMessage) =>
                  handleShowAlert(status, fileAlertMessage)
                }
              />
            </div>
            <div className="svg-image-container">
              <ImageComponent
                alt="Woman turning over an empty box"
                className="svg-image"
                src={DocumentsSVG.toString()}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default MyDocumentsZero;
