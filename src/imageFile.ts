/**
 * a wrapper for image files, contains the original file.
 * Also contains the calculated file hash and html data.
 */
import { calculateSHA } from '@/util/sha';

export class ImageFile {
  readonly filePointer: File;
  sha: string = '';

  static async create(file: File) {
    const sha = calculateSHA(file).then(
      (sha) => sha,
      (error) => {
        throw new Error("Failed to calculate sha for image: '" + file.name + "': " + error);
      }
    );
    return new ImageFile(file, await sha);
  }

  private constructor(file: File, sha: string) {
    this.filePointer = file;
    this.sha = sha;
  }
}
