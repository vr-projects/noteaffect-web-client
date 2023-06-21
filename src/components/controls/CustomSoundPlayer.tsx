import * as React from 'react';
import isNull from 'lodash/isNull';
import { SrUiComponent } from 'react-strontium';
import {
  PlayButton,
  Timer,
  Progress,
  VolumeControl,
} from 'react-soundplayer/components';
import { withCustomAudio } from 'react-soundplayer/addons';
import Localizer from '../../utilities/Localizer';
import TooltipWrapper from '../controls/TooltipWrapper';

// Props are passed through via withCustomAudio wrapper
interface ICustomAudioPlayerProps {
  onSeekTrack: (time: number) => void;
  onCustomTimeUpdate: (time: number) => void;
  className?: string;
}
interface ICustomAudioPlayerPluginProps {
  // Events
  onCanPlayTrack: (time: number) => {};
  onStartTrack: () => {};
  onPauseTrack: () => {};
  onStopTrack: () => {};
  // Data
  currentTime: number;
  duration: number;
  hasSetStartTime: boolean;
  isMuted: boolean;
  playing: boolean;
  preloadType: string;
  seeking: boolean;
  soundCloudAudio: any;
  streamUrl: string;
  volume: number;
  jumpToTime: number;
}
interface ICustomAudioPlayerState {}

class InnerCustomAudioPlayer extends SrUiComponent<
  ICustomAudioPlayerProps & ICustomAudioPlayerPluginProps,
  ICustomAudioPlayerState
> {
  onComponentMounted() {}

  onNewProps(props) {
    const { playing, currentTime, soundCloudAudio, jumpToTime } = props;
    this.onJumpToTime(soundCloudAudio, jumpToTime);
    this.updateParentPlayingTime(playing, currentTime);
  }

  // Parent momentarily passes a time to jump to for slide chevrons
  onJumpToTime(soundCloudAudio, jumpToTime: number) {
    if (isNull(jumpToTime)) return null;
    soundCloudAudio.audio.currentTime = jumpToTime;
    return;
  }

  updateParentPlayingTime(playing: boolean, currentTime: number) {
    const { onCustomTimeUpdate } = this.props;
    if (!playing) return null;
    onCustomTimeUpdate(currentTime);
  }

  onTrackSeeked(currentTimeDecimal: number) {
    const { duration, onSeekTrack } = this.props;
    const convertedCurrentTime = currentTimeDecimal * duration;
    onSeekTrack(convertedCurrentTime);
  }

  performRender() {
    const { playing, isMuted, className = '' } = this.props;

    return (
      <div className={`custom-sound-player ${className}`}>
        <TooltipWrapper
          id={`custom-sound-player-play-tooltip`}
          tooltipText={playing ? Localizer.get('pause') : Localizer.get('play')}
        >
          <span className="required-span-to-render-control">
            <PlayButton
              {...this.props}
              className={`custom-sound-player-play-button control-item`}
              aria-label={
                playing
                  ? Localizer.get('pause audio')
                  : Localizer.get('play audio')
              }
            />
          </span>
        </TooltipWrapper>
        <Timer {...this.props} className="custom-sound-player-timer" />
        <div className={'custom-sound-player-progress-wrapper'}>
          <Progress
            {...this.props}
            className="custom-sound-player-progress"
            innerClassName="custom-sound-player-progress-inner"
            onSeekTrack={(timeDecimal) => this.onTrackSeeked(timeDecimal)}
          />
        </div>
        <TooltipWrapper
          id={`custom-sound-player-mute-tooltip`}
          tooltipText={
            isMuted ? Localizer.get('unmute') : Localizer.get('mute')
          }
        >
          <span className="required-span-to-render-control">
            <VolumeControl
              {...this.props}
              className={`custom-sound-player-volume-control  ${
                isMuted ? 'isMuted' : ''
              }`}
              buttonClassName="custom-sound-player-volume-control-button control-item"
              rangeClassName={`custom-sound-player-volume-control-range ${
                isMuted ? 'isMuted' : ''
              }`}
            />
          </span>
        </TooltipWrapper>
      </div>
    );
  }
}

const CustomAudioPlayer = withCustomAudio(InnerCustomAudioPlayer);

export default CustomAudioPlayer;
