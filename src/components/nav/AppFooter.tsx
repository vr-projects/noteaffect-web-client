import React from 'react';
import { Image as ImageComponent } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import CorpPrivacyModal from '../corp/CorpPrivacyModal';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';
import Localizer from '../../utilities/Localizer';

interface IAppFooterProps {
  isCorpVersion: boolean;
  logoUrl: string | null;
  storeLoading: boolean;
}

interface IAppFooterState {
  isCorpPrivacyModalOpen: boolean;
}

class AppFooter extends SrUiComponent<IAppFooterProps, IAppFooterState> {
  initialState() {
    return {
      isCorpPrivacyModalOpen: false,
    };
  }

  openModal() {
    this.setPartial({ isCorpPrivacyModalOpen: true });
  }

  performRender() {
    const { logoUrl, isCorpVersion } = this.props;
    const { isCorpPrivacyModalOpen } = this.state;
    const showPoweredBy = isCorpVersion && logoUrl !== null;

    return (
      <>
        <footer className="app-footer">
          <div className="d-flex justify-content-between">
            <span className="footer-spacer mr-auto" />
            {showPoweredBy && (
              <span className="footer-powered">
                <span className="mr-1">Powered By:</span>
                <ImageComponent
                  alt="NoteAffect logo"
                  className="footer-noteaffect"
                  src={'/images/na-logo-light.svg?version=final'}
                />
              </span>
            )}
            <span className="footer-copy ml-auto">
              {isCorpVersion && (
                <span
                  role="button"
                  tabIndex={0}
                  className="footer-privacy whitespace-nowrap mr-3"
                  onClick={() => this.openModal()}
                  onKeyDown={(e) =>
                    AccessibilityUtil.handleEnterKey(e, () => this.openModal())
                  }
                >
                  {Localizer.get('Privacy Statement')}
                </span>
              )}
              <span className="whitespace-nowrap">
                &copy; 2020 - NoteAffect
              </span>
            </span>
          </div>
          <div className="d-flex justify-content-between"></div>
        </footer>

        {isCorpVersion && (
          <CorpPrivacyModal
            show={isCorpPrivacyModalOpen}
            onClose={() => this.setPartial({ isCorpPrivacyModalOpen: false })}
          />
        )}
      </>
    );
  }
}

export default AppFooter;
