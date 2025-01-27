import type { orientationGuessResult } from '@/util/orientationGuesser';
import { Orientation } from '@/enums/orientation';

export class MultipleViewImage {
  public left: orientationGuessResult | null;
  public center: orientationGuessResult | null;
  public right: orientationGuessResult | null;
  public selected: Orientation;

  constructor() {
    this.left = null;
    this.center = null;
    this.right = null;
    this.selected = Orientation.center;
  }

  public get selectedFile(): File | undefined {
    if (this.selected === Orientation.left) {
      return this.left?.image.filePointer;
    }
    if (this.selected === Orientation.center) {
      return this.center?.image.filePointer;
    }
    if (this.selected === Orientation.right) {
      return this.right?.image.filePointer;
    }
    return undefined;
  }

  public get selectedGuess(): orientationGuessResult | null {
    if (this.selected === Orientation.left) {
      return this.left;
    }
    if (this.selected === Orientation.center) {
      return this.center;
    }
    if (this.selected === Orientation.right) {
      return this.right;
    }
    return null;
  }
}
