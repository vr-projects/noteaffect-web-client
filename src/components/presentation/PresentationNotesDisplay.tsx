import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import { IPresentationNotes } from '../../interfaces/IPresentedNotes';

interface IPresentationNotesDisplayProps {
  isLiveType: boolean;
  slide: number;
  notes: string;
  container: HTMLDivElement;
  enabled: boolean;
  onNotesUpdated: (slide: number, notes: IPresentationNotes) => void;
}

interface IPresentationNotesDisplayState {
  style: any;
}

export default class PresentationNotesDisplay extends SrUiComponent<
  IPresentationNotesDisplayProps,
  IPresentationNotesDisplayState
> {
  initialState() {
    return { style: this.styleFromContainer(this.props) };
  }

  resizeCallback() {
    return () => {
      this.setState({ style: this.styleFromContainer(this.props) });
    };
  }

  onNewProps(props: IPresentationNotesDisplayProps) {
    this.setState({ style: this.styleFromContainer(props) });
  }

  styleFromContainer(props: IPresentationNotesDisplayProps) {
    if (props.container) {
      return { height: props.container.clientHeight };
    } else {
      return {};
    }
  }

  updateNotes(slide: number, notes: string) {
    const { onNotesUpdated } = this.props;
    onNotesUpdated(slide, { notes: { notes: notes } });
  }

  getPlaceholderText(isLiveType, enabled) {
    switch (true) {
      case isLiveType && !enabled:
        return Localizer.get('Enter notes here once the presentation begins');
      case isLiveType && enabled:
      case !isLiveType && enabled:
        return Localizer.get('Enter notes here');
      case !isLiveType && !enabled:
        return Localizer.get('No notes for this segment');
      default:
        return '';
    }
  }

  performRender() {
    const { enabled, notes = '', slide, isLiveType } = this.props;
    const { style } = this.state;
    const placeholder = this.getPlaceholderText(isLiveType, enabled);

    return (
      <div
        className={`presentation-notes-display notes-container ${
          enabled ? '' : 'disabled'
        }`}
      >
        <textarea
          className="notes resize-none"
          placeholder={placeholder}
          style={style}
          value={notes}
          disabled={!enabled}
          onChange={(e) => this.updateNotes(slide, e.target.value)}
        />
      </div>
    );
  }
}
