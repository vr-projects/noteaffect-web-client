import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isEqual from 'lodash/isEqual';
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

interface IConnectedPostDrawableContainerProps extends DispatchProp<any> {
  drawingEnabled?: boolean;
  penSize?: PenSizes;
  penColorKey?: PenColorMap;
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  notesData?: Immutable.Map<string, any>;
}

interface IPostDrawableContainerProps {
  courseId: number;
  currentUserId: number;
  showSharedAnnotations: boolean;
  isSharedCourse?: boolean;
}

interface IPostDrawableContainerState {
  currentAnnotations: any;
  currentSlide: number;
}

class DrawableContainer extends SrUiComponent<
  IConnectedPostDrawableContainerProps & IPostDrawableContainerProps,
  IPostDrawableContainerState
> {
  initialState() {
    const {
      courseId,
      presentedData,
      notesData,
      showSharedAnnotations,
    } = this.props;
    const newSlide = PresentationData.currentUserSlide(courseId, presentedData);

    if (newSlide) {
      const currentNotes = PresentationNotesUtil.currentNotesData(
        courseId,
        notesData,
        presentedData
      );
      const annotationsKey = showSharedAnnotations
        ? 'sharedAnnotations'
        : 'annotations';
      const currentAnnotations = currentNotes.slide.get(annotationsKey).toJS();

      return {
        currentAnnotations,
        currentSlide: newSlide,
      };
    }

    return { currentAnnotations: undefined, currentSlide: 0 };
  }

  onNewProps(
    props: IConnectedPostDrawableContainerProps & IPostDrawableContainerProps
  ) {
    if (isEqual(props, this.props)) {
      return;
    }

    const { courseId, presentedData, notesData, showSharedAnnotations } = props;
    const { showSharedAnnotations: prevShowSharedAnnotations } = this.props;
    const { currentSlide } = this.state;
    const newSlide = PresentationData.currentUserSlide(courseId, presentedData);
    const currentNotes = PresentationNotesUtil.currentNotesData(
      courseId,
      notesData,
      presentedData
    );

    if (
      newSlide === currentSlide &&
      showSharedAnnotations === prevShowSharedAnnotations
    ) {
      return;
    }

    if (currentNotes && currentNotes.slide) {
      const annotationsKey = showSharedAnnotations
        ? 'sharedAnnotations'
        : 'annotations';

      const currentAnnotations = currentNotes.slide.get(annotationsKey).toJS();

      this.setState({
        currentAnnotations,
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
    const {
      courseId,
      presentedData,
      showSharedAnnotations,
      dispatch,
    } = this.props;

    if (
      showSharedAnnotations ||
      !presentedData ||
      presentedData.count() === 0
    ) {
      return;
    }

    dispatch(
      PresentationActions.updatePostNotesData({
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
    const {
      drawingEnabled,
      penSize,
      penColorKey,
      showSharedAnnotations,
      isSharedCourse,
    } = this.props;
    const { currentSlide, currentAnnotations } = this.state;
    const convertToImage = isSharedCourse && showSharedAnnotations;

    return (
      <DrawableSurface
        isPost
        drawingEnabled={drawingEnabled}
        penSize={penSize}
        penColorKey={penColorKey}
        currentSlide={currentSlide}
        isSharedCourse={isSharedCourse}
        currentAnnotations={currentAnnotations}
        convertToImageAfterLoad={convertToImage}
        dataChanged={(d, r) => this.onDataChanged(d, r)}
        drawing={(d) => this.onDrawing(d)}
      />
    );
  }
}

export default connect<
  IConnectedPostDrawableContainerProps,
  void,
  IPostDrawableContainerProps
>(DrawableSurfaceMappers.PostDrawableSurfaceMapper)(DrawableContainer);
