import * as React from 'react';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadIndicator,
  LoadStates,
  ApiHelpers,
} from 'react-strontium';
import ILecture from '../../models/ILecture';
import ILectureFrame from '../../models/ILectureFrame';
import { INSTRUCTOR_PRESENTATION_PLAYBACK_CONTROLS_COMPONENT } from '../../version/versionConstants';
import ErrorUtil from '../../utilities/ErrorUtil';
import Localizer from '../../utilities/Localizer';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import CustomSoundPlayer from './CustomSoundPlayer';

interface IPresentationPlaybackControlsProps {
  isInstructor?: boolean;
  lecture: ILecture;
  currentSlide: number;
  onPlaybackSlideChanged: (slide: number) => void;
}

interface IPresentationPlaybackControlsState {
  loading: LoadStates;
  jumpToTime: number;
}

interface IScrubberElement {
  currentTime: number;
  slideNumber: number;
  hasPoll: boolean;
  endTime: number;
  position: number;
}

class PresentationPlaybackControls extends SrUiComponent<
  IPresentationPlaybackControlsProps,
  IPresentationPlaybackControlsState
> {
  private _scrubberElements: IScrubberElement[] = null;
  private _sendUpdates: boolean = false;

  initialState() {
    return { loading: LoadStates.Unloaded, jumpToTime: null };
  }

  async onNewProps(props: IPresentationPlaybackControlsProps) {
    const { currentSlide, lecture } = props;
    const { currentSlide: prevSlide } = this.props;
    this.jumpSlideAndAudio(prevSlide, currentSlide, lecture);
  }

  async jumpSlideAndAudio(prevSlide, currentSlide, lecture) {
    const slideChanged = currentSlide !== prevSlide;
    if (!slideChanged) return;

    const currentElement = this.elementForTime(this._currentTime);
    let slide: ILectureFrame = null;

    if (!currentElement || currentElement.slideNumber !== currentSlide) {
      slide = this.slideForNumber(currentSlide);
    }

    if (slide && lecture && lecture.audioUrl) {
      const currentScrubberElement = this._scrubberElements.find(
        (s) => s.slideNumber === slide.slide
      );

      // First set value for child component to watch for onNewProps, then null out
      await this.setPartialAsync({
        jumpToTime: currentScrubberElement.currentTime,
      });
      await this.setPartialAsync({ jumpToTime: null });
    }
  }

  async setAudioPosition(currentTime) {
    const { currentSlide, lecture } = this.props;

    const currentElement = this.elementForTime(currentTime);
    let slide: ILectureFrame = null;
    if (!currentElement || currentElement.slideNumber !== currentSlide) {
      slide = this.slideForNumber(currentSlide);
    }

    // build out scrubber elements on audio load for slide reference
    if (slide && lecture && lecture.audioUrl) {
      this.getScrubberElements();
    }
  }

  //** Unique to this component */
  async updateSharing(allowShare) {
    const { lecture } = this.props;
    const { loading } = this.state;

    if (loading === LoadStates.Loading) {
      return;
    }

    await this.setPartialAsync({ loading: LoadStates.Loading });
    try {
      const resp = await ApiHelpers.update(
        `series/${lecture.seriesId}/lectures/${lecture.id}/audio`,
        { shared: allowShare }
      );

      ErrorUtil.handleAPIErrors(
        resp,
        'There was an error updating sharing settings'
      );

      await this.setPartialAsync({ loading: LoadStates.Succeeded });
      this.broadcast(AppBroadcastEvents.LectureUpdated, {
        courseId: lecture.seriesId,
      });
    } catch (error) {
      console.error(error);
      await this.setPartialAsync({ loading: LoadStates.Failed });
    }
  }

  // "Scrubber Elements" are audio positions for slides
  getScrubberElements(): IScrubberElement[] {
    const { lecture } = this.props;
    if (this._scrubberElements) {
      return this._scrubberElements;
    }

    const begin = lecture.started;
    const end = lecture.ended;
    const length = end - begin;
    const slideNumbers = (lecture.slideData || [])
      .map((sd) => sd.slide)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b);

    const results: IScrubberElement[] = [];

    for (const slideNumber of slideNumbers) {
      const slide = this.slideForNumber(slideNumber);
      if (slide) {
        const currentTime = slide.presented - begin - 2;
        results.push({
          currentTime: currentTime,
          slideNumber: slideNumber,
          hasPoll: false,
          endTime: null,
          position: 100 * (currentTime / length),
        });

        if (results[results.length - 2]) {
          results[results.length - 2].endTime = currentTime;
        }
      }
    }

    this._scrubberElements = results;
    return results;
  }

  slideForNumber(slideNumber: number): ILectureFrame {
    if (!slideNumber) return null;

    let slides = this.sortedSlides();
    let slide: ILectureFrame = null;
    let earliestTime = null;
    for (let i = 0; i < slides.length; i++) {
      let nextSlide = slides[i];
      if (nextSlide.slide === slideNumber) {
        if (!earliestTime) {
          earliestTime = nextSlide.presented;
        }
        earliestTime = Math.min(earliestTime, nextSlide.presented);
        slide = nextSlide;
      } else if (nextSlide.slide > slideNumber) {
        break;
      }
    }

    if (slide) {
      slide.presented = earliestTime;
    }

    return slide;
  }

  sortedSlides() {
    const { lecture } = this.props;
    return (lecture.slideData || []).slice().sort((a, b) => {
      let slideNumber = a.slide - b.slide;
      if (slideNumber !== 0) {
        return slideNumber;
      }

      return a.sequence - b.sequence;
    });
  }

  private _currentTime: 0; // Track in private variable to avoid bugs with state rerenders
  async updateTime(currentTime) {
    this._currentTime = currentTime;
    const { currentSlide, onPlaybackSlideChanged } = this.props;
    if (!this._sendUpdates) {
      this._sendUpdates = true;
      return;
    }

    const elem = this.elementForTime(currentTime);
    if (elem && elem.slideNumber !== currentSlide) {
      onPlaybackSlideChanged(elem.slideNumber);
    }
  }

  elementForTime(time: number) {
    const elements = this.getScrubberElements();

    for (let element of elements) {
      if (element.slideNumber === 1 && time < element.currentTime) {
        return element;
      }
      if (element.endTime == null && time > element.currentTime) {
        return element;
      }
      if (time >= element.currentTime && time < element.endTime) {
        return element;
      }
    }

    return null;
  }

  performRender() {
    const { lecture, isInstructor = false } = this.props;
    const { loading, jumpToTime } = this.state;

    if (!lecture || !lecture.audioUrl) return null;

    return (
      <div className="presentation-playback-controls rel">
        <div className="presentation-playback-controls--controls">
          {lecture.audioUrl && (
            <CustomSoundPlayer
              className=""
              streamUrl={lecture.audioUrl}
              preloadType="auto"
              onSeekTrack={(currentTime) => {
                this.updateTime(currentTime);
              }}
              onCustomTimeUpdate={(playingTime) => {
                this.updateTime(playingTime);
              }}
              onCanPlayTrack={({ audio }) => {
                this.setAudioPosition(audio.currentTime);
              }}
              jumpToTime={jumpToTime}
            />
          )}
        </div>
        {isInstructor && (
          <>
            <div className="presentation-playback-controls--sharing">
              {loading !== LoadStates.Loading ? (
                <input
                  type="checkbox"
                  className="presentation-playback-controls--sharing-checkbox"
                  checked={lecture.audioShared}
                  id="audioShared"
                  onChange={(e) => this.updateSharing(e.target.checked)}
                />
              ) : (
                <LoadIndicator state={LoadStates.Loading} />
              )}
              <label
                htmlFor="audioShared"
                className="presentation-playback-controls--sharing-label"
              >
                {Localizer.getFormatted(
                  INSTRUCTOR_PRESENTATION_PLAYBACK_CONTROLS_COMPONENT.SHARED_AUDIO
                )}
              </label>
            </div>
            {loading === LoadStates.Failed && (
              <Alert bsStyle="danger">
                {Localizer.get(
                  'There was a problem updating the sharing preferences.  Please try again.'
                )}
              </Alert>
            )}
          </>
        )}
      </div>
    );
  }
}

export default PresentationPlaybackControls;
