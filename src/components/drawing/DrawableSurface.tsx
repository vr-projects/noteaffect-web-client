import * as React from 'react';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import { fabric } from 'fabric';
import { Log, SrAppMessage, SrUiComponent } from 'react-strontium';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import { PenColorMap, PenColors } from '../../enums/PenColors';
import { PenSizes } from '../../enums/PenSizes';
import BoxScaling, { Rect } from '../../utilities/BoxScaling';
import Canvas from '../../utilities/Canvas';
import { ResizeSensor } from 'css-element-queries';

interface IDrawableSurfaceProps {
  drawingEnabled: boolean;
  penColorKey: PenColorMap;
  penSize: PenSizes;
  currentSlide: number;
  isSharedCourse?: boolean;
  currentAnnotations: any;
  dataChanged: (data: any, referenceScale: number) => void;
  drawing: (isDrawing: boolean) => void;
  convertToImageAfterLoad?: boolean;
  onConvertAnnotations?: () => void;
  isPost?: boolean;
}

interface DrawableSurfaceState {
  unscaledPenSize: number;
  convertedImage: string;
}

export default class DrawableSurface extends SrUiComponent<
  IDrawableSurfaceProps,
  DrawableSurfaceState
> {
  private canvas: fabric.Canvas;
  private container: HTMLDivElement;
  private referenceRect: Rect = { width: 1280, height: 720 };
  private containerRefHandler: (r: HTMLDivElement) => void;
  private canvasRefHandler: (r: HTMLCanvasElement) => void;
  private resizeSensor: any;
  private canvasResizeHandle: number = null;
  private emptyCanvasUrl: string = null;

  initialState() {
    this.containerRefHandler = (r) => this.configureContainer(r);
    this.canvasRefHandler = (r) => this.configureCanvas(r);
    return { unscaledPenSize: this.props.penSize, convertedImage: undefined };
  }

  getHandles() {
    return [AppBroadcastEvents.DrawingUndo, AppBroadcastEvents.DrawingClear];
  }

  onAppMessage(msg: SrAppMessage) {
    if (!this.canvas) {
      return;
    }
    if (msg.action === AppBroadcastEvents.DrawingUndo) {
      this.undoLast();
    } else {
      this.canvas.clear();
    }
  }

  undoLast() {
    let objs = this.canvas.getObjects();
    if (objs.length > 0) {
      this.canvas.remove(objs[objs.length - 1]);
    }
  }

  onNewProps(props: IDrawableSurfaceProps) {
    if (!isEqual(props, this.props)) {
      const annotationsChanged =
        !isEmpty(props.currentAnnotations) &&
        !isEmpty(this.props.currentAnnotations) &&
        !isEqual(
          props.currentAnnotations.data.objects,
          this.props.currentAnnotations.data.objects
        );
      const penChanged =
        !isEqual(props.penSize, this.props.penSize) ||
        !isEqual(props.penColorKey, this.props.penColorKey);

      const convertToImageChange = !isEqual(
        props.convertToImageAfterLoad,
        this.props.convertToImageAfterLoad
      );
      const slideChanged = !isEqual(
        props.currentSlide,
        this.props.currentSlide
      );

      if (penChanged) {
        this.setState({ unscaledPenSize: props.penSize });
        this.setCanvasSettings(props);
      }

      if (slideChanged || annotationsChanged || convertToImageChange) {
        this.setCanvasSettings(props);
        this.updateAnnotations(props);
      }
    }
  }

  componentWillUnmount() {
    if (this.clearForceImageRenderTimeout) {
      clearTimeout(this.clearForceImageRenderTimeout);
    }
  }

  updateAnnotations(props: IDrawableSurfaceProps) {
    const { convertToImageAfterLoad, currentAnnotations, currentSlide } = props;
    const {
      isSharedCourse,
      currentAnnotations: prevAnnotations,
      currentSlide: prevSlide,
      isPost,
    } = this.props;
    const slideChanged = currentSlide !== prevSlide;

    if (!isPost && !slideChanged) {
      return;
    }
    if (!this.canvas) {
      return;
    }

    const data = (currentAnnotations || {}).data;
    const prevData = (prevAnnotations || {}).data;

    if (!data) {
      this.canvas.clear();
      return;
    }

    // FIX diving into objects
    const annotationsChanged =
      has(data, 'objects') &&
      has(prevData, 'objects') &&
      !isEqual(data.objects, prevData.objects);

    const onSharedShouldBeImage = isSharedCourse && convertToImageAfterLoad;

    const unSharedLoad =
      !isSharedCourse && !slideChanged && !annotationsChanged;
    const unSharedSlideChanged =
      !isSharedCourse && slideChanged && annotationsChanged;
    const isSharedLoadOnShared =
      isSharedCourse &&
      !slideChanged &&
      !annotationsChanged &&
      onSharedShouldBeImage;
    const isSharedLoadOnMine =
      isSharedCourse &&
      !slideChanged &&
      !annotationsChanged &&
      !onSharedShouldBeImage;
    const isSharedSharedToMine =
      isSharedCourse &&
      !slideChanged &&
      annotationsChanged &&
      !onSharedShouldBeImage;
    const isSharedMineToShared =
      isSharedCourse &&
      !slideChanged &&
      annotationsChanged &&
      onSharedShouldBeImage;
    const isSharedSlideChangeOnShared =
      isSharedCourse &&
      slideChanged &&
      annotationsChanged &&
      onSharedShouldBeImage;
    const isSharedSlideChangeOnMine =
      isSharedCourse &&
      slideChanged &&
      annotationsChanged &&
      !onSharedShouldBeImage;

    switch (true) {
      case unSharedLoad:
        return;
      case isSharedLoadOnShared:
      case isSharedLoadOnMine:
        this.loadJsonData(props, data, false, isSharedLoadOnShared);
        return;
      case isSharedSharedToMine:
        this.canvas.clear();
        this.setPartial({ convertedImage: undefined });
        this.loadJsonData(props, data);
        const withoutUpdate = true;
        this.resizeCanvas(withoutUpdate);
        return;
      case isSharedMineToShared:
        this.canvas.clear();
        this.setPartial({ convertedImage: undefined });
        this.loadJsonData(props, data);
        return;
      case isSharedSlideChangeOnShared:
        this.canvas.clear();
        this.setPartial({ convertedImage: undefined });
        this.forceImageRenderTimeout(props, data);
        return;
      case isSharedSlideChangeOnMine:
        this.canvas.clear();
        this.loadJsonData(props, data, false, false);
        return;
      case unSharedSlideChanged:
        this.canvas.clear();
        this.loadJsonData(props, data);
        return;
      default:
        this.loadJsonData(props, data);
        return;
    }
  }

  private clearForceImageRenderTimeout: any;
  private forceImageRenderTimeout = (props, data) =>
    (this.clearForceImageRenderTimeout = setTimeout(async () => {
      try {
        const withUpdate = false;
        const forceImageRender = true;
        this.loadJsonData(props, data, withUpdate, forceImageRender);
      } catch (e) {
        console.error(e);
      }
    }, 0));

  // TODO tech debt check this and check switch statement
  loadJsonData(
    props: IDrawableSurfaceProps,
    data: any,
    withUpdate?: boolean,
    forceImageRender?: boolean
  ) {
    this.canvas.loadFromJSON(
      data,
      () => {
        const scale = this.scaleRect().width;
        Log.d(this, 'Scaling loaded drawing', {
          currentScale: scale,
          originalScale: props.currentAnnotations.scale,
        });
        Canvas.rescaleObjects(this.canvas, scale);
        this.canvas.renderAll();

        if (withUpdate) {
          this.canvasUpdated();
        }
        this.checkConvert(props, forceImageRender);
      },
      (jsonObj, fabricObj) => {
        fabricObj.selectable = false;
      }
    );
  }

  configureContainer(element: HTMLDivElement) {
    if (this.container) {
      return;
    }

    this.container = element;
    this.resizeSensor = new ResizeSensor(this.container, () => {
      this.resizeCanvas();
    });

    this.resizeCanvas(true);
  }

  configureCanvas(element: HTMLCanvasElement) {
    if (!element || this.canvas || !fabric) {
      return;
    }

    this.emptyCanvasUrl = element.toDataURL();
    this.canvas = new fabric.Canvas(element, {
      isDrawingMode: this.props.drawingEnabled,
      selection: false,
    });

    this.canvas.on('mouse:down', () => this.setIsDrawing(true));
    this.canvas.on('mouse:up', () => this.setIsDrawing(false));
    ['object:added', 'object:removed', 'canvas:cleared'].forEach((event) =>
      this.canvas.on(event, (e) => {
        this.canvasUpdated();
      })
    );

    this.setCanvasSettings(this.props);

    if (this.props.currentAnnotations && this.props.currentAnnotations.data) {
      this.resizeCanvas(true);
      this.loadJsonData(this.props, this.props.currentAnnotations.data, true);
      return;
    }

    this.resizeCanvas();
    return;
  }

  private setIsDrawing(drawing: boolean) {
    Log.t(this, 'Is drawing on canvas', { drawing });
    this.props.drawing(drawing);
  }

  private canvasUpdated() {
    Log.t(this, 'Canvas updated');
    Canvas.setCustomPropertiesForCanvas(this.canvas, this.scaleRect().width);

    const data = (this.canvas as any).toJSON([
      'naOriginalScaleX',
      'naOriginalScaleY',
      'naOriginalLeft',
      'naOriginalTop',
    ]);

    this.props.dataChanged(data, this.scaleRect().width);
  }

  private checkConvert(
    props: IDrawableSurfaceProps,
    forceImageRender?: boolean
  ) {
    const {
      currentAnnotations,
      convertToImageAfterLoad,
      onConvertAnnotations,
    } = props;
    const { convertedImage } = this.state;
    const canConvert =
      currentAnnotations &&
      convertToImageAfterLoad &&
      (isUndefined(convertedImage) || forceImageRender);
    if (!canConvert) return;

    const url = this.canvas.toDataURL();

    if (url === this.emptyCanvasUrl) {
      this.deferred(() => this.checkConvert(props, forceImageRender), 500);
      return;
    }

    this.setPartial({ convertedImage: url });
    onConvertAnnotations && onConvertAnnotations();
    return;
  }

  private setCanvasSettings(props: IDrawableSurfaceProps) {
    if (!this.canvas) {
      return;
    }
    this.canvas.isDrawingMode = props.drawingEnabled;

    const brush = (this.canvas as any).freeDrawingBrush as fabric.BaseBrush;
    brush.color = PenColors[props.penColorKey];
  }

  private configurePenSize() {
    if (!this.canvas || !this.container) {
      return;
    }

    const scale = this.scaleRect();
    const brush = (this.canvas as any).freeDrawingBrush as fabric.BaseBrush;
    brush.width = this.state.unscaledPenSize * scale.width;
  }

  private currentRect(): Rect {
    if (!this.container) {
      return { width: 0, height: 0 };
    }
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
  }

  private scaleRect(): Rect {
    return BoxScaling.currentScale(this.referenceRect, this.currentRect());
  }

  private resizeCanvas(withoutUpdate?: boolean) {
    if (this.canvasResizeHandle) {
      window.clearTimeout(this.canvasResizeHandle);
    }
    this.canvasResizeHandle = window.setTimeout(
      () => this.doResize(withoutUpdate),
      250
    );
  }

  private doResize(withoutUpdate: boolean) {
    if (!this.container) {
      return;
    }
    const current = this.currentRect();
    const scale = this.scaleRect();

    this.canvas.setDimensions(current);
    Canvas.rescaleObjects(this.canvas, scale.width);
    this.canvas.calcOffset();
    (this.canvas as any).calcViewportBoundaries();
    this.configurePenSize();

    if (!withoutUpdate) {
      this.canvasUpdated();
    }
  }

  performRender() {
    const { convertedImage } = this.state;
    const hasImage = !isUndefined(convertedImage);

    if (!hasImage) {
      this.configurePenSize();
    }

    return (
      <div className="drawable-surface">
        <div className={`surface-ratio-host ${hasImage ? 'hide' : ''}`}>
          <div className="surface-container" ref={this.containerRefHandler}>
            <canvas ref={this.canvasRefHandler} aria-hidden={hasImage} />
          </div>
        </div>

        {hasImage && (
          <img
            className="converted-image"
            src={convertedImage}
            alt={`readonly annotations`}
          />
        )}
      </div>
    );
  }
}
