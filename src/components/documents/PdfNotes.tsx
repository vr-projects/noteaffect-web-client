import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import findIndex from 'lodash/findIndex';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { Alert } from 'react-bootstrap';
import { LoadStates, SrUiComponent } from 'react-strontium';
import { IPdfNotesData } from '../../interfaces/IPdfNotes';
import IImmutableObject from '../../interfaces/IImmutableObject';
import * as PdfActions from '../../store/pdf/PdfActions';
import PdfMappers from '../../mappers/PdfMappers';
import PdfNotesUtil from '../../utilities/PdfNotesUtil';
import Localizer from '../../utilities/Localizer';
import MultiRadioToggler, { IOption } from '../controls/MultiRadioToggler';
import SpinnerMask from '../layout/SpinnerMask';
import { NOTES_TYPE } from 'components/containers/PresentationNotesContainer';

export enum SHARE_NOTES_TYPE {
  MINE = 'mine',
  SHARED = 'shared',
}

const toggleOptions: IOption[] = [
  { label: 'Mine', value: SHARE_NOTES_TYPE.MINE, style: 'info' },
  { label: 'Shared', value: SHARE_NOTES_TYPE.SHARED, style: 'info' },
];

interface IConnectedPdfNotesProps extends DispatchProp<any> {
  documentNotesLoadState: LoadStates;
  currentPage: number;
  notesData: IImmutableObject<IPdfNotesData>;
}
interface IPdfNotesProps {
  isShared: boolean;
  seriesId: number;
  userFileId: number;
  currentUserId: number;
  container: HTMLDivElement;
  enabled: boolean;
}

interface IPdfNotesState {
  style: any;
  notes: string;
  sharedNotes: string;
  hasSharedNotes: boolean;
  showNotesType: SHARE_NOTES_TYPE;
}

class PdfNotes extends SrUiComponent<
  IConnectedPdfNotesProps & IPdfNotesProps,
  IPdfNotesState
> {
  initialState() {
    return {
      style: this.styleFromContainer(this.props),
      notes: '',
      sharedNotes: '',
      hasSharedNotes: false,
      showNotesType: SHARE_NOTES_TYPE.MINE,
    };
  }

  onComponentMounted() {
    this.checkIfHasSharedNotes();
  }

  checkIfHasSharedNotes() {
    const {
      isShared,
      seriesId,
      userFileId,
      currentPage,
      notesData,
    } = this.props;

    if (!isShared) {
      return this.setPartial({ hasSharedNotes: false });
    }

    const parsedNotesData = notesData.toJS();
    const hasSharedNotes = PdfNotesUtil.getHasSharedNotes(
      parsedNotesData,
      seriesId,
      userFileId,
      currentPage
    );

    return this.setPartial({ hasSharedNotes: hasSharedNotes });
  }

  getNotes(currentPage, showNotesType) {
    switch (showNotesType) {
      case SHARE_NOTES_TYPE.MINE:
        return this.getMyNotesFromStore(currentPage);
      case SHARE_NOTES_TYPE.SHARED:
        return this.getSharedNotesFromStore(currentPage);
      default:
        return '';
    }
  }

  getMyNotesFromStore(currentPage) {
    const { seriesId, userFileId, notesData } = this.props;
    const parsedNotesData = notesData.toJS();
    const notes = PdfNotesUtil.getNotesForPage(
      parsedNotesData,
      seriesId,
      userFileId,
      currentPage
    );

    return notes;
  }

  getSharedNotesFromStore(currentPage) {
    const { seriesId, userFileId, notesData } = this.props;
    const parsedNotesData = notesData.toJS();
    const notes = PdfNotesUtil.getSharedNotesForPage(
      parsedNotesData,
      seriesId,
      userFileId,
      currentPage
    );

    return notes;
  }

  //  TODO determine if needed for Annotations
  resizeCallback() {
    return () => {
      this.setState({ style: this.styleFromContainer(this.props) });
    };
  }

  //  TODO determine if needed for Annotations
  styleFromContainer(props: IConnectedPdfNotesProps & IPdfNotesProps) {
    if (props.container) {
      return { height: props.container.clientHeight };
    } else {
      return {};
    }
  }

  getPlaceholderText(enabled) {
    switch (true) {
      case enabled:
        return Localizer.get('Enter notes here');
      case !enabled:
        return Localizer.get('No notes for this page');
      default:
        return '';
    }
  }

  /**
   *
   * @param notes
   */
  updateNotes(notes: string) {
    const { seriesId, userFileId, currentPage: page, dispatch } = this.props;
    const options = {
      seriesId,
      userFileId,
      page,
      notes,
    };
    dispatch(PdfActions.setUserNoteToStore(options));
  }

  toggleSharedNotes(value: SHARE_NOTES_TYPE) {
    this.setPartial({
      showNotesType: value,
    });
  }

  performRender() {
    const {
      documentNotesLoadState,
      currentPage,
      enabled,
      isShared,
    } = this.props;
    const { style, hasSharedNotes, showNotesType } = this.state;
    const placeholder = this.getPlaceholderText(enabled);
    const displayNotes = this.getNotes(currentPage, showNotesType);
    const selectedOptionIndex = findIndex(
      toggleOptions,
      (o) => o.value === showNotesType
    );

    return (
      <aside className="pdf-notes">
        <SpinnerMask loading={documentNotesLoadState} />

        {documentNotesLoadState === LoadStates.Failed && (
          <Alert bsStyle="danger" className="pdf-notes-error">
            {Localizer.get('There was a problem getting your notes.')}
          </Alert>
        )}

        {documentNotesLoadState === LoadStates.Succeeded && (
          <>
            {isShared && hasSharedNotes && (
              <MultiRadioToggler
                label={`Show Notes:`}
                options={toggleOptions}
                onToggled={(val) => this.toggleSharedNotes(val)}
                defaultOptionIndex={selectedOptionIndex}
                disable={false}
                className="mt-1 mb-2 d-flex justify-content-between align-items-center"
              />
            )}

            <div
              className={`pdf-notes-display notes-container ${
                enabled ? '' : 'disabled'
              }`}
            >
              {showNotesType === SHARE_NOTES_TYPE.MINE && (
                <textarea
                  className="notes resize-vertical"
                  placeholder={placeholder}
                  style={style}
                  value={displayNotes}
                  disabled={!enabled}
                  onChange={(e) => this.updateNotes(e.target.value)}
                />
              )}
              {showNotesType === SHARE_NOTES_TYPE.SHARED && (
                <div className="pdf-shared-notes">
                  {!isUndefined(displayNotes) ? (
                    <p className="pdf-shared-note">{displayNotes}</p>
                  ) : (
                    <Alert bsStyle="info">
                      {Localizer.get('There are no shared notes for this page')}
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    );
  }
}

export default connect<IConnectedPdfNotesProps, void, IPdfNotesProps>(
  PdfMappers.PdfMapper
)(PdfNotes);
