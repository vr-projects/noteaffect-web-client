import React from 'react';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import { Alert } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import ILectureFrame from '../../models/ILectureFrame';
import ISlideNotes from '../../models/ISlideNotes';
import ILecturePollingResults from '../../interfaces/ILecturePollingResults';
import PollExporter from './PollExporter';
import DrawableSurface from '../drawing/DrawableSurface';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import Localizer from '../../utilities/Localizer';

interface IScreenSlideExportProps {
  currentUserId: number;
  isObserver: boolean;
  slide: ILectureFrame;
  notes: ISlideNotes;
  polling: ILecturePollingResults;
  onConvertAnnotations: (slide: number) => void;
}

interface IScreenSlideExportState {}

export default class ScreenSlideExport extends SrUiComponent<
  IScreenSlideExportProps,
  IScreenSlideExportState
> {
  onComponentMounted() {
    const {
      slide: { unansweredPoll, slide: slideNumber },
      notes,
      onConvertAnnotations,
    } = this.props;
    if (unansweredPoll || !(notes && notes.annotations)) {
      onConvertAnnotations(slideNumber);
    }
  }

  performRender() {
    const {
      slide,
      slide: { slide: slideNumber },
      notes,
      polling,
      onConvertAnnotations,
      currentUserId,
      isObserver,
    } = this.props;

    return (
      <div className="slide-export">
        <h3>
          {Localizer.get('Segment')} {slideNumber}
        </h3>
        {!isObserver && slide.unansweredPoll ? (
          <Alert bsStyle="warning">
            {Localizer.get(
              'Segment image not available until you answer the poll.'
            )}
          </Alert>
        ) : (
          <div className="slide-imagery">
            <img src={slide.imageUrl} alt={`segment number ${slideNumber}`} />
            {notes && notes.annotations && (
              <DrawableSurface
                convertToImageAfterLoad
                drawingEnabled={false}
                penSize={PenSizes.Large}
                penColorKey={PenColorMap.Black}
                currentSlide={slide.slide}
                currentAnnotations={JSON.parse(notes.annotations)}
                dataChanged={(d, r) => {}}
                onConvertAnnotations={() => {
                  onConvertAnnotations(slide.slide);
                }}
                drawing={(d) => {}}
              />
            )}
          </div>
        )}
        <h4>{Localizer.get('Your notes')}</h4>

        {notes && has(notes, 'notes') && !isEmpty(notes.notes) ? (
          <p className="notes">{notes.notes}</p>
        ) : (
          <Alert bsStyle="warning">{Localizer.get('No notes taken')}</Alert>
        )}

        {polling ? (
          <PollExporter
            currentUserId={currentUserId}
            slideNumber={slideNumber}
            results={polling}
            isObserver={isObserver}
          />
        ) : (
          <h4>{Localizer.get('No poll asked on this segment')}</h4>
        )}
        <hr />
      </div>
    );
  }
}
