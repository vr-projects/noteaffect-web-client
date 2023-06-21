import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { Button } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { BsExclamationTriangle } from 'react-icons/bs';
import { FaDownload } from 'react-icons/fa';
import { WaitSpinner } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import ISecurityError from '../../models/ISecurityError';
import ISecurityViolation from '../../models/ISecurityViolation';

interface ISecurityShieldWallProps {
  isSecurityAppLoading: boolean;
  securityErrors?: ISecurityError[];
  securityViolations?: ISecurityViolation[];
}

const SecurityShieldWall = ({
  isSecurityAppLoading,
  securityErrors,
  securityViolations,
}: ISecurityShieldWallProps) => {
  return (
    <CSSTransition in appear exit classNames={'rtg-fade'} timeout={1000}>
      <div className="security-shield-wall">
        {isSecurityAppLoading ? (
          <div className="security-shield-loader">
            <WaitSpinner />
          </div>
        ) : (
          <>
            {!isEmpty(securityErrors) && (
              <div className="security-shield-error">
                <h3 className="d-flex align-items-center">
                  <BsExclamationTriangle size={50} />
                  <span className="ml-1">
                    {Localizer.get('Unable to start Presentation Viewer')}
                  </span>
                </h3>
                <p>
                  {Localizer.get(
                    'Make sure the Presentation Viewer is running'
                  )}
                </p>
                <p>
                  {Localizer.get(
                    'If you do not have it installed, click the button to download and install'
                  )}
                </p>

                <Button bsStyle="info" className="mt-3">
                  <FaDownload />
                  <span className="ml-1">
                    {Localizer.get('Presentation Viewer')}
                  </span>
                </Button>
              </div>
            )}
            {!isEmpty(securityViolations) && (
              <div className="security-shield-error">
                <h3 className="d-flex align-items-center">
                  <BsExclamationTriangle size={50} />
                  <span className="ml-1">
                    {Localizer.get('Security Violations Detected')}
                  </span>
                </h3>
                <p>{Localizer.get('Security Violations Detected')}</p>
                <p>
                  {Localizer.get(
                    'If you do not have it installed, click the button to download and install'
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </CSSTransition>
  );
};

export default SecurityShieldWall;
