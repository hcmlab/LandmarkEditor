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
    switch (this.selected) {
      case Orientation.left:
        return this.left?.image.filePointer;
      case Orientation.center:
        return this.center?.image.filePointer;
      case Orientation.right:
        return this.right?.image.filePointer;
    }
    return undefined;
  }

  public selectedGuess(): orientationGuessResult | null {
    console.log(this.selected);
    switch (this.selected) {
      case Orientation.center:
        return this.center;
      case Orientation.left:
        return this.left;
      case Orientation.right:
        return this.right;
      case Orientation.unknown:
        return null;
    }
    return null;
  }
}
