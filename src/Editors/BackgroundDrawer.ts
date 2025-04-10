/**
 * Clears the canvas and draws the background image.
 */

import { Editor } from '@/Editors/Editor';
import { useAnnotationHistoryStore } from '@/stores/annotationHistoryStore';
import { imageFromFile } from '@/util/imageFromFile';
import { type FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { type Point2D } from '@/graph/point2d';
import { AnnotationTool } from '@/enums/annotationTool';

export class BackgroundDrawer extends Editor {
  private readonly annotationHistoryStore = useAnnotationHistoryStore();

  constructor() {
    super();

    this.annotationHistoryStore.$subscribe(() => {
      const selected = this.annotationHistoryStore.selected();
      if (!selected) return;
      BackgroundDrawer.setBackgroundSource(selected);
    });
  }

  get tool(): AnnotationTool {
    return AnnotationTool.BackgroundDrawer;
  }

  private static setBackgroundSource(source: FileAnnotationHistory<Point2D>) {
    if (!source) return;
    const file = source.file.selectedFile;
    if (!file) return;
    imageFromFile(file)
      .then((s) => {
        Editor.image.src = s;
      })
      .catch((e) => {
        throw e;
      });
  }

  draw() {
    // Set Transformations
    Editor.fitToWindow();
    Editor.ctx.translate(Editor.offsetX, Editor.offsetY);
    Editor.ctx.scale(Editor.zoomScale, Editor.zoomScale);
    Editor.ctx.clearRect(0, 0, Editor.canvas.width, Editor.canvas.height);
    Editor.ctx.drawImage(Editor.image, 0, 0);
  }

  onBackgroundLoaded(): void {}

  onMouseDown(_: MouseEvent): void {}

  onMouseMove(_: MouseEvent, __: number, ___: number): void {}

  onMouseUp(_: MouseEvent): void {}

  onMove(_: number, __: number): void {}

  onPan(_: number, __: number): void {}

  onPointsEdited(): void {}
}
