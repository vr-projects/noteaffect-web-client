import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import findIndex from 'lodash/findIndex';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import PresentationData from '../../utilities/PresentationData';
import PresentationMappers from '../../mappers/PresentationMappers';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import PresentationNotesDisplay from '../presentation/PresentationNotesDisplay';
import PresentationNotesUtil from '../../utilities/PresentationNotesUtil';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import { IImmutableCourseNotesMap } from '../../interfaces/IPresentationDataProps';
import { IPresentationNotes } from '../../interfaces/IPresentedNotes';
import MultiRadioToggler, { IOption } from '../controls/MultiRadioToggler';

export enum NOTES_TYPE {
  LIVE = 'live',
  POST = 'post',
}

export enum SHARE_NOTES_TYPE {
  MINE = 'mine',
  SHARED = 'shared',
}

const toggleOptions: IOption[] = [
  { label: 'Mine', value: SHARE_NOTES_TYPE.MINE, style: 'info' },
  { label: 'Shared', value: SHARE_NOTES_TYPE.SHARED, style: 'info' },
];

interface IConnectedPresentationNotesContainerProps extends DispatchProp<any> {
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  postPresentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  notesData?: IImmutableCourseNotesMap;
  postNotesData?: IImmutableCourseNotesMap;
  container?: HTMLDivElement;
}

interface IPresentationNotesContainerProps {
  type: NOTES_TYPE;
  collapsed: boolean;
  courseId: number;
  isSharedCourse?: boolean;
  hasSharedNotes?: boolean;
}

interface IPresentationNotesContainerState {
  showNotesType: SHARE_NOTES_TYPE;
}

class PresentationNotesContainer extends SrUiComponent<
  IConnectedPresentationNotesContainerProps & IPresentationNotesContainerProps,
  IPresentationNotesContainerState
> {
  initialState() {
    return {
      showNotesType: SHARE_NOTES_TYPE.MINE,
    };
  }

  notesUpdated(slideId: number, notes: IPresentationNotes) {
    const {
      type,
      courseId,
      presentedData,
      postPresentedData,
      dispatch,
    } = this.props;

    switch (type) {
      case NOTES_TYPE.LIVE:
        dispatch(
          PresentationActions.updateNotesData({
            seriesId: courseId,
            lectureId: PresentationData.currentLectureId(
              courseId,
              presentedData
            ),
            slide: slideId,
            notesData: notes,
          })
        );
        return;
      case NOTES_TYPE.POST:
        dispatch(
          PresentationActions.updatePostNotesData({
            seriesId: courseId,
            lectureId: PresentationData.currentLectureId(
              courseId,
              postPresentedData
            ),
            slide: slideId,
            notesData: notes,
          })
        );
        return;
      default:
        return;
    }
  }

  toggleSharedNotes(value: SHARE_NOTES_TYPE) {
    this.setPartial({
      showNotesType: value,
    });
  }

  performRender() {
    if (this.props.collapsed) return null;

    const {
      type,
      courseId,
      presentedData,
      postPresentedData,
      notesData,
      postNotesData,
      isSharedCourse = false,
      hasSharedNotes = false,
      collapsed,
    } = this.props;
    const { showNotesType } = this.state;
    const isLiveType = type === NOTES_TYPE.LIVE;
    const presentedDataParam = isLiveType ? presentedData : postPresentedData;
    const notesDataParam = isLiveType ? notesData : postNotesData;
    const showSharedNotes = showNotesType === SHARE_NOTES_TYPE.SHARED;
    const getKey = showSharedNotes ? 'sharedNotes' : 'notes';

    const slideNumber = PresentationData.getSlideNumber(
      courseId,
      presentedDataParam
    );

    const notes =
      slideNumber === 0
        ? ''
        : PresentationNotesUtil.notesDataForSlide(
            courseId,
            slideNumber,
            notesDataParam
          )
            .slide.get(getKey)
            .get('notes');
    // only enable for my notes, non-shared
    const enabled = !showSharedNotes && slideNumber !== 0;
    const selectedOptionIndex = findIndex(
      toggleOptions,
      (o) => o.value === showNotesType
    );

    return (
      <div className="presentation-notes-container flex-grow-column-container">
        {!isLiveType && isSharedCourse && hasSharedNotes && (
          <MultiRadioToggler
            label={`Show Notes:`}
            options={toggleOptions}
            onToggled={(val) => this.toggleSharedNotes(val)}
            defaultOptionIndex={selectedOptionIndex}
            disable={collapsed}
            className="mt-1 mb-2 d-flex justify-content-between align-items-center"
          />
        )}

        <PresentationNotesDisplay
          isLiveType={isLiveType}
          slide={slideNumber}
          enabled={enabled}
          container={null}
          notes={notes}
          onNotesUpdated={(slide, notes) => this.notesUpdated(slide, notes)}
        />
      </div>
    );
  }
}

export default connect<
  IConnectedPresentationNotesContainerProps,
  {},
  IPresentationNotesContainerProps
>(PresentationMappers.PresentationNotesMapper)(PresentationNotesContainer);
