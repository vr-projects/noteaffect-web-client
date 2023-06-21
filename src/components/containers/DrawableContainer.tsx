import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import * as Immutable from 'immutable';
import { SrUiComponent } from 'react-strontium';
import DrawableSurface from '../drawing/DrawableSurface';
import DrawableSurfaceMappers from '../../mappers/DrawableSurfaceMappers';
import { PenColorMap } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import PresentationNotesUtil from '../../utilities/PresentationNotesUtil';
import PresentationData from '../../utilities/PresentationData';
import * as DrawableSurfaceActions from '../../store/drawable_surface/DrawableSurfaceActions';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';

interface IConnectedDrawableContainerProps extends DispatchProp<any> {
  drawingEnabled?: boolean;
  penSize?: PenSizes;
  penColorKey: PenColorMap;
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  notesData?: Immutable.Map<string, any>;
}

interface IDrawableContainerProps {
  courseId: number;
  currentUserId: number;
}

interface IDrawableContainerState {
  currentAnnotations: any;
  currentSlide: number;
}

class DrawableContainer extends SrUiComponent<
  IConnectedDrawableContainerProps & IDrawableContainerProps,
  IDrawableContainerState
> {
  initialState() {
    const { courseId, presentedData, notesData } = this.props;
    const newSlide = PresentationData.currentUserSlide(courseId, presentedData);

    if (newSlide) {
      let currentNotes = PresentationNotesUtil.currentNotesData(
        courseId,
        notesData,
        presentedData
      );

      return {
        currentAnnotations: currentNotes.slide.get('annotations').toJS(),
        currentSlide: newSlide,
      };
    }

    return { currentAnnotations: undefined, currentSlide: 0 };
  }

  onNewProps(
    props: IConnectedDrawableContainerProps & IDrawableContainerProps
  ) {
    const { courseId, presentedData, notesData } = props;
    const { currentSlide } = this.state;

    const newSlide = PresentationData.currentUserSlide(
      props.courseId,
      props.presentedData
    );

    if (newSlide === currentSlide) {
      return;
    }

    const currentNotes = PresentationNotesUtil.currentNotesData(
      courseId,
      notesData,
      presentedData
    );

    if (currentNotes && currentNotes.slide) {
      this.setState({
        currentAnnotations: currentNotes.slide.get('annotations').toJS(),
        currentSlide: newSlide || 0,
      });
      return;
    }

    this.setState({
      currentAnnotations: undefined,
      currentSlide: newSlide || 0,
    });
    return;
  }

  onDrawing(isDrawing: boolean) {
    this.props.dispatch(DrawableSurfaceActions.updateIsDrawing(isDrawing));
  }

  onDataChanged(data: any, scale: number) {
    if (!this.props.presentedData || this.props.presentedData.count() === 0) {
      return;
    }
    const { courseId, presentedData } = this.props;

    this.props.dispatch(
      PresentationActions.updateNotesData({
        seriesId: courseId,
        slide: PresentationData.currentUserSlide(courseId, presentedData),
        lectureId: PresentationData.currentLectureId(courseId, presentedData),
        notesData: {
          annotations: { scale, data },
        },
      })
    );
  }

  performRender() {
    const { drawingEnabled, penSize, penColorKey } = this.props;
    const { currentSlide, currentAnnotations } = this.state;
    return (
      <>
        <DrawableSurface
          drawingEnabled={drawingEnabled}
          penSize={penSize}
          penColorKey={penColorKey}
          currentSlide={currentSlide}
          currentAnnotations={currentAnnotations}
          dataChanged={(d, r) => this.onDataChanged(d, r)}
          drawing={(d) => this.onDrawing(d)}
        />
      </>
    );
  }
}

export default connect<
  IConnectedDrawableContainerProps,
  void,
  IDrawableContainerProps
>(DrawableSurfaceMappers.DrawableSurfaceMapper)(DrawableContainer);
