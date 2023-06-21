import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Grid, Row, Col, Alert, Button } from 'react-bootstrap';
import { FaDownload, FaPrint } from 'react-icons/fa';
import {
  SrUiComponent,
  WaitSpinner,
  ApiHelpers,
  LoadIndicator,
  LoadStates,
} from 'react-strontium';
import ILectureFrame from '../models/ILectureFrame';
import ISlideNotes from '../models/ISlideNotes';
import ICourse from '../models/ICourse';
import ILecturePollingResults from '../interfaces/ILecturePollingResults';
import ScreenSlideExport from '../components/export/ScreenSlideExport';
import moment from 'moment';
import Localizer from '../utilities/Localizer';
import SharePermission from '../enums/SharePermission';
import ParticipantPermissions from '../enums/ParticipantPermissions';
import PresentationMetadata from '../components/shared/PresentationMetadata';
import GenericModal from '../components/controls/GenericModal';
import { getIsObserverOnly } from '../services/ParticipantPermissionService';

// setup a localStore in liew of redux or the window.object
const localStore = {
  appEnvironment: window.appEnvironment,
  exportData: window.exportData,
  userInformation: window.userInformation,
};
delete window.appEnvironment;
delete window.exportData;
delete window.userInformation;
delete window.userPermissions;

const isCorpVersion = localStore.appEnvironment.lexicon === 'corp';

interface IExportNotesProps {}

interface IExportNotesState {
  showModal: boolean;
  preparing: boolean;
  loading: LoadStates | null;
  course: ICourse | null;
  isCorpVersion: boolean;
  canPrintExport: boolean;
  currentUserId: number;
  seriesSharePermission: SharePermission;
  userSharePermission: ParticipantPermissions;
}

class ExportNotesView extends SrUiComponent<
  IExportNotesProps,
  IExportNotesState
> {
  private _pendingConversions: { [slide: string]: boolean } = null;

  initialState() {
    return {
      showModal: false,
      preparing: true,
      loading: null,
      course: null,
      isCorpVersion,
      canPrintExport: false,
      currentUserId: null,
      seriesSharePermission: null,
      userSharePermission: null,
    };
  }

  async onComponentMounted() {
    if (localStore.exportData && localStore.exportData.lecture) {
      document.title = `${Localizer.get(
        'NoteAffect - Presentation notes for'
      )} ${localStore.exportData.lecture.name || 'Unnamed'}`;
    }

    if (isCorpVersion) {
      return this.getCorpMeetingData();
    }

    await this.getCorpMeetingData();
    return this.setPartial({
      showModal: true,
    });
  }

  getMenu() {
    return 'export';
  }

  getCanPrintExport = (seriesSharePermission, currentUserId, participants) => {
    const isOpenSeries = seriesSharePermission === SharePermission.Open;
    const currentUserPermissions = participants.find(
      (p) => p.userId === currentUserId
    ).permissions;

    switch (true) {
      case currentUserPermissions === ParticipantPermissions.Lecturer:
      case currentUserPermissions === ParticipantPermissions.ViewerLecturer:
      case currentUserPermissions === ParticipantPermissions.Viewer &&
        isOpenSeries:
      case currentUserPermissions === ParticipantPermissions.ViewerObserver &&
        isOpenSeries:
      case currentUserPermissions === ParticipantPermissions.Observer &&
        isOpenSeries:
        return true;
      default:
        return false;
    }
  };

  getCurrentUserPermissions(currentUserId, participants) {
    return participants.find((p) => p.userId === currentUserId).permissions;
  }

  async getCorpMeetingData() {
    try {
      this.setPartial({ loading: LoadStates.Loading });

      const courseResp = await ApiHelpers.read(
        `series/${localStore.exportData.lecture.seriesId}`
      );

      if (!courseResp.good) {
        throw new Error('Error getting series details');
      }

      const courseData = JSON.parse(courseResp.data).responseData;
      const currentUserId = localStore.userInformation.id;

      const canPrintExport = this.getCanPrintExport(
        courseData.sharePermission,
        currentUserId,
        courseData.participants
      );
      const currentUserPermissions = this.getCurrentUserPermissions(
        currentUserId,
        courseData.participants
      );

      this.setPartial({
        loading: LoadStates.Succeeded,
        course: courseData,
        currentUserId: currentUserId,
        seriesSharePermission: courseData.seriesSharePermission,
        userSharePermission: currentUserPermissions,
        canPrintExport,
      });
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed, canPrintExport: false });
    }
  }

  slideConverted(slide: number) {
    this._pendingConversions[slide.toString()] = true;
    this.checkForPrint();
  }

  checkForPrint() {
    const keys = Object.keys(this._pendingConversions);
    const anyPending =
      keys.filter((k) => this._pendingConversions[k] !== true).length > 0;

    if (anyPending) {
      return;
    }

    this.deferred(() => {
      this.setPartial({ preparing: false });
    }, 1000);
  }

  printNotes() {
    this.setPartial({ showModal: false });
  }

  sortedSlideData() {
    const filteredNotes = localStore.exportData.notes.filter(
      (note) => !note.sharedNote
    );
    // TODO tech debt confirm filter out slideData from BE flag

    const sorted = (localStore.exportData.lecture.slideData || []).sort(
      (a, b) => {
        const slideNumber = a.slide - b.slide;
        if (slideNumber !== 0) {
          return slideNumber;
        }

        return b.sequence - a.sequence;
      }
    );

    const finalSlides: {
      slide: ILectureFrame;
      notes: ISlideNotes;
      polling: ILecturePollingResults;
    }[] = [];
    sorted.forEach((slide) => {
      if (
        finalSlides.filter((fs) => fs.slide.slide === slide.slide).length === 0
      ) {
        let notes = filteredNotes.find((n) => n.slide === slide.slide);
        let polling = localStore.exportData.polling.find(
          (p) =>
            p.slideNumber === slide.slide ||
            (p.application === slide.application && p.context === slide.context)
        );
        finalSlides.push({ slide, notes, polling });
      }
    });

    if (!this._pendingConversions) {
      this._pendingConversions = {};
      finalSlides.forEach((s) => {
        this._pendingConversions[s.slide.slide.toString()] = false;
      });
    }

    return finalSlides;
  }

  performRender() {
    if (localStore.exportData == null) {
      return (
        <Grid>
          <Row>
            <Col>
              <Alert bsStyle="danger" className="mt-4">
                {Localizer.get(
                  "You have requested an export of a lecture that doesn't exist or for  which you don't have access."
                )}
              </Alert>
            </Col>
          </Row>
        </Grid>
      );
    }

    if (isEmpty(localStore.exportData.lecture.slideData || [])) {
      return (
        <Grid>
          <Row>
            <Col>
              <Alert bsStyle="danger" className="mt-4">
                {Localizer.get('This lecture had no segments to export.')}
              </Alert>
            </Col>
          </Row>
        </Grid>
      );
    }

    const { lecture } = localStore.exportData;
    const {
      showModal,
      preparing,
      course,
      isCorpVersion,
      loading,
      canPrintExport,
      currentUserId,
    } = this.state;
    const slideData = this.sortedSlideData();

    const isObserverOnly =
      !isNull(course) &&
      !isNull(currentUserId) &&
      getIsObserverOnly(course, currentUserId);

    return (
      <div
        id="export-view"
        className={`${!canPrintExport ? 'print-hide' : ''}`}
      >
        <Row>
          <Col sm={8}>
            <h2>{Localizer.get('Presentation Notes')}</h2>
          </Col>
          <Col sm={4} className="text-right">
            {!showModal && (
              <>
                <Button
                  disabled={!canPrintExport}
                  bsStyle="success"
                  onClick={() => window.print()}
                >
                  <FaDownload />
                  &nbsp;/&nbsp;
                  <FaPrint /> {Localizer.get('Export to PDF or Print')}
                </Button>
              </>
            )}
          </Col>
        </Row>

        {isCorpVersion ? (
          <>
            <LoadIndicator
              state={loading}
              loadingMessage={Localizer.get('Getting data...')}
              errorMessage={Localizer.get(
                'Something went wrong.  Please try again later.'
              )}
            />
            {loading === LoadStates.Succeeded && (
              <>
                <PresentationMetadata
                  isCorpVersion={isCorpVersion}
                  printVersion
                  course={course}
                  lecture={lecture}
                />

                {canPrintExport ? (
                  slideData.map((sd) => (
                    <ScreenSlideExport
                      currentUserId={currentUserId}
                      key={sd.slide.id}
                      {...sd}
                      onConvertAnnotations={(slide) =>
                        this.slideConverted(slide)
                      }
                      isObserver={isObserverOnly}
                    />
                  ))
                ) : (
                  <Alert bsStyle="warning">
                    {Localizer.get(
                      'You do not have access to this presentation'
                    )}
                  </Alert>
                )}

                <GenericModal
                  show={showModal}
                  modalTitle={Localizer.get('Preparing your notes for export')}
                  hasCloseButton={true}
                  onCloseClicked={() => this.setPartial({ showModal: false })}
                >
                  <p>
                    {Localizer.get(
                      'Please wait for your notes to be prepared for export - this should only take a few seconds!'
                    )}
                  </p>
                  {preparing ? (
                    <WaitSpinner
                      message={Localizer.get('Preparing export...')}
                    />
                  ) : (
                    <>
                      <p>
                        {Localizer.get(
                          'Your notes are ready - you can save this page or print it to PDF or a printer.'
                        )}
                      </p>
                      <Button
                        bsStyle="success"
                        onClick={() => this.printNotes()}
                      >
                        {Localizer.get('OK')}
                      </Button>
                    </>
                  )}
                </GenericModal>
              </>
            )}
          </>
        ) : (
          <>
            <p className="helper-message">
              {moment(localStore.exportData.lecture.started * 1000).format(
                'dddd, MMM Do YYYY, hh:mma'
              )}
            </p>
            {slideData.map((sd) => (
              <ScreenSlideExport
                key={sd.slide.id}
                currentUserId={currentUserId}
                {...sd}
                onConvertAnnotations={(slide) => this.slideConverted(slide)}
                isObserver={isObserverOnly}
              />
            ))}

            <GenericModal
              show={showModal}
              modalTitle={Localizer.get('Preparing your notes for export')}
              hasCloseButton={true}
              onCloseClicked={() => this.setPartial({ showModal: false })}
            >
              <p>
                {Localizer.get(
                  'Please wait for your notes to be prepared for export - this should only take a few seconds!'
                )}
              </p>
              {preparing ? (
                <WaitSpinner message={Localizer.get('Preparing export...')} />
              ) : (
                <>
                  <p>
                    {Localizer.get(
                      'Your notes are ready - you can save this page or print it to PDF or a printer.'
                    )}
                  </p>
                  <Button bsStyle="success" onClick={() => this.printNotes()}>
                    {Localizer.get('OK')}
                  </Button>
                </>
              )}
            </GenericModal>
          </>
        )}
      </div>
    );
  }
}

export default ExportNotesView;
