import $ from 'jquery';
import { AnnotationTool } from '@/enums/annotationTool';

export abstract class Editor {
  public static zoomScale: number = 1;
  public static offsetX: number = 0;
  public static offsetY: number = 0;
  public static prevMouseX: number = 0;
  public static prevMouseY: number = 0;
  public static mouseX: number = 0;
  public static mouseY: number = 0;
  public static isMoving: boolean = false;
  public static isPanning: boolean = false;
  protected static canvas: HTMLCanvasElement;
  protected static ctx: CanvasRenderingContext2D;
  protected static image: HTMLImageElement = new Image();
  private static allEditors: Editor[] = [];

  protected constructor() {
    Editor.add(this);
    Editor.image.onload = () => {
      if (Editor.image.width === 0) {
        throw new Error('Tried to load image with 0 width');
      }
      if (Editor.image.height === 0) {
        throw new Error('Tried to load image with 0 height');
      }
      // on success reset global zoom and pan
      Editor.zoomScale = 1;
      Editor.offsetX = 0;
      Editor.offsetY = 0;

      Editor.notify((editor) => editor.onBackgroundLoaded());
      Editor.center();
      Editor.draw();
    };
    Editor.image.onerror = (e) => {
      throw new Error('Failed to load image: ' + e);
    };
  }

  public static get hasImage() {
    return Editor.image.width !== 0 && Editor.image.height !== 0;
  }

  public abstract get tool(): AnnotationTool;

  public static draw() {
    Editor.allEditors.forEach((editor: Editor) => {
      editor.draw();
    });
  }

  public static setCanvas(canvas: HTMLCanvasElement) {
    Editor.canvas = canvas;
    const ctx = Editor.canvas.getContext('2d');
    if (!ctx) {
      window.location.reload();
    }
    Editor.ctx = ctx as CanvasRenderingContext2D;
  }

  public static pan(deltaX: number, deltaY: number): void {
    Editor.canvas.style.cursor = 'move';
    // update offsets
    const rect = Editor.canvas.getBoundingClientRect();
    Editor.offsetX += (deltaX / rect.width) * Editor.canvas.width;
    Editor.offsetY += (deltaY / rect.height) * Editor.canvas.height;
  }

  public static zoom(out: boolean) {
    const dx = (Editor.mouseX - Editor.offsetX) / Editor.zoomScale;
    const dy = (Editor.mouseY - Editor.offsetY) / Editor.zoomScale;
    if (out) {
      Editor.canvas.style.cursor = 'zoom-out';
      Editor.zoomScale /= 1.1;
    } else {
      Editor.canvas.style.cursor = 'zoom-in';
      Editor.zoomScale *= 1.1;
    }
    // Ensure zoom level is within a reasonable range
    Editor.zoomScale = Math.min(Math.max(0.1, Editor.zoomScale), 50);
    // Update offsets
    Editor.offsetX = Editor.mouseX - dx * Editor.zoomScale;
    Editor.offsetY = Editor.mouseY - dy * Editor.zoomScale;
  }

  public static center() {
    Editor.fitToWindow();
    const rect = Editor.canvas.getBoundingClientRect();
    const scaleX = rect.width / Editor.image.width;
    const scaleY = rect.height / Editor.image.height;
    Editor.zoomScale = scaleX < scaleY ? scaleX : scaleY;
    Editor.offsetX = rect.width / 2 - (Editor.image.width / 2) * Editor.zoomScale;
    Editor.offsetY = rect.height / 2 - (Editor.image.height / 2) * Editor.zoomScale;
    Editor.ctx.translate(Editor.offsetX, Editor.offsetY);
    Editor.ctx.scale(Editor.zoomScale, Editor.zoomScale);
  }

  static remove(editor: Editor) {
    Editor.allEditors = Editor.allEditors.filter((e) => e !== editor);
  }

  protected static add(editor: Editor) {
    Editor.allEditors.push(editor);
  }

  protected static fitToWindow() {
    const canvas = $('#canvas-div');
    if (!canvas) return;
    if (!canvas.innerWidth) return;
    if (!canvas.innerHeight) return;
    if (!Editor.canvas) return;
    Editor.canvas.width = <number>canvas.innerWidth();
    Editor.canvas.height = <number>canvas.innerHeight();
  }

  /**
   * Calls the given callback function with the list of all editors as an argument.
   * @param callback the function to call
   */
  protected static notify(callback: (editors: Editor) => void) {
    this.allEditors.forEach((e) => callback(e));
  }

  /** ---------- Utility functions for drawing on the canvas -------------------------------------------------------- */

  protected static drawCircleAtPoint(
    ctx: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    radius: number
  ) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  public abstract draw(): void;

  /* handle the user interacting with the canvas */
  /**
   * called if the mouse is down and moved, if the editing flag is set
   * @param relativeMouseX relative X position of the mouse towards the top left corner of the canvas
   * @param relativeMouseY relative Y position of the mouse towards the top left corner of the canvas
   */

  public abstract onMove(relativeMouseX: number, relativeMouseY: number): void;

  /**
   * called if the mouse is down and moved, if the editing flag is **NOT** set
   * @param relativeMouseX relative X position of the mouse towards the top left corner of the canvas
   * @param relativeMouseY relative Y position of the mouse towards the top left corner of the canvas
   */
  public abstract onPan(relativeMouseX: number, relativeMouseY: number): void;

  /* handle the raw mouse interactions */
  /**
   * handles the raw mouse down action. Decide if there is any modification possible.
   * Set/Unset the isMoving, isPanning
   * @param event - the raw mouse event
   */
  public abstract onMouseDown(event: MouseEvent): void;

  /**
   * handles the raw mouse moving action.
   * Set/Unset the isMoving, isPanning
   * @param event - the raw mouse event
   * @param relativeMouseX relative X position of the mouse towards the top left corner of the canvas
   * @param relativeMouseY relative Y position of the mouse towards the top left corner of the canvas
   */
  public abstract onMouseMove(
    event: MouseEvent,
    relativeMouseX: number,
    relativeMouseY: number
  ): void;

  /**
   * If the user releases their mouse. should handle cleanup of any data created for handling clicks.
   * @param event the mouse event
   */
  public abstract onMouseUp(event: MouseEvent): void;

  /**
   * If the user turns the mouse, is set to do nothing by default.
   */
  public handleWheel(_: WheelEvent) {
    // empty implementation by default
  }

  /**
   * Notifies that a new background was loaded. Update the annotation data.
   */
  public abstract onBackgroundLoaded(): void;

  /**
   * Notifies that an editing action was finished. Handle annotation data archiving.
   */
  public abstract onPointsEdited(): void;
}
