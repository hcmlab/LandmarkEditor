import { FaceLandmarker } from '@mediapipe/tasks-vision';

/**
 * Represents a connection between two points.
 */
export class Connection {
  /**
   * Creates a new Connection instance.
   * @param {number} start - The ID of the starting point.
   * @param {number} end - The ID of the ending point.
   */
  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  /**
   * The ID of the starting point.
   */
  public start: number;

  /**
   * The ID of the ending point.
   */
  public end: number;
}

/**
 * Converts an array of connections (given as pairs of start and end point IDs) into an array of Connection instances.
 * @param {...number[][]} connections - Arrays of start and end point IDs.
 * @returns {Connection[]} - An array of Connection instances.
 */
function convertToConnections(...connections: number[][]): Connection[] {
  return connections.map(([start, end]) => new Connection(start, end));
}

/**
 * Finds neighboring point IDs recursively up to a specified depth.
 * @param {number} pointId - The ID of the starting point.
 * @param {Connection[]} connections - An array of connections.
 * @param {number} depth - The depth of neighbor search.
 * @returns {number[]} - An array of unique neighboring point IDs.
 */
export function findNeighbourPointIds(
  pointId: number,
  connections: Connection[],
  depth: number,
): number[] {
  if (depth === 0) {
    return Array.from(new Set([pointId]));
  }
  const neighbours = connections
    .filter((conn) => conn.start === pointId || conn.end === pointId)
    .map((conn) => (conn.start === pointId ? conn.end : conn.start));
  const neighbourIds = new Set(neighbours);
  for (const neighbour of neighbours) {
    const subNeighbours = findNeighbourPointIds(
      neighbour,
      connections,
      depth - 1,
    );
    for (const subNeighbour of subNeighbours) {
      neighbourIds.add(subNeighbour);
    }
  }
  return Array.from(neighbourIds);
}

/**
 * Array of unique face feature point IDs related to lips.
 */
export const FACE_FEATURE_LIPS = Array.from(
  new Set(
    FaceLandmarker.FACE_LANDMARKS_LIPS.map((con) => con.start).concat([
      62, 76, 184, 183, 42, 74, 41, 73, 38, 72, 12, 11, 268, 302, 271, 303, 272,
      304, 407, 408, 292, 306, 325, 307, 319, 320, 403, 404, 316, 315, 15, 16,
      86, 85, 179, 180, 89, 90, 96, 77, 291, 308,
    ]),
  ),
);

/**
 * We don't use the exact implementation of mediapipe. we calculate the center point
 * and ignore the rest. The "UPDATED" arrays contain the center point. The array in FaceLandmarker
 * remain untouched
 */
export const UPDATED_LEFT_IRIS = [
  FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS[1],
] as Connection[];
// 470
export const UPDATED_RIGHT_IRIS = [
  FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS[0],
] as Connection[];
// 469

UPDATED_LEFT_IRIS[0].end = UPDATED_LEFT_IRIS[0].start;
UPDATED_RIGHT_IRIS[0].end = UPDATED_RIGHT_IRIS[0].start;

/**
 * Array of unique face feature point IDs related to the left eye.
 */
export const FACE_FEATURE_LEFT_EYE = Array.from(
  new Set(
    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE.map((con) => con.start)
      .concat(FaceLandmarker.FACE_LANDMARKS_LEFT_EYE.map((con) => con.end))
      .concat(
        UPDATED_LEFT_IRIS.map((con) => con.start).concat(
          UPDATED_LEFT_IRIS.map((con) => con.end),
        ),
      ),
  ),
);

/**
 * Array of unique face feature point IDs related to the left eyebrow.
 */
export const FACE_FEATURE_LEFT_EYEBROW = Array.from(
  new Set(
    FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW.map((con) => con.start).concat(
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW.map((con) => con.end),
    ),
  ),
);

/**
 * Array of unique face feature point IDs related to the right eye.
 */
export const FACE_FEATURE_RIGHT_EYE = Array.from(
  new Set(
    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE.map((con) => con.start)
      .concat(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE.map((con) => con.end))
      .concat(
        UPDATED_RIGHT_IRIS.map((con) => con.start).concat(
          UPDATED_RIGHT_IRIS.map((con) => con.end),
        ),
      ),
  ),
);

/**
 * Array of unique face feature point IDs related to the right eyebrow.
 */
export const FACE_FEATURE_RIGHT_EYEBROW = Array.from(
  new Set(
    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW.map((con) => con.start).concat(
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW.map((con) => con.end),
    ),
  ),
);

/**
 * Array of unique face landmark point IDs related to the nose.
 */
export const FACE_LANDMARKS_NOSE = convertToConnections(
  [2, 97],
  [97, 98],
  [98, 64],
  [64, 48],
  [48, 115],
  [115, 220],
  [220, 45],
  [45, 4],
  [4, 275],
  [275, 440],
  [440, 344],
  [344, 278],
  [278, 294],
  [294, 327],
  [327, 326],
  [326, 2],
  [2, 19],
  [19, 1],
  [1, 4],
  [4, 5],
  [5, 195],
  [195, 197],
  [197, 6],
  [6, 168],
);

/**
 * Array of unique face feature point IDs related to the nose.
 */
export const FACE_FEATURE_NOSE = Array.from(
  new Set(
    FACE_LANDMARKS_NOSE.map((con) => con.start)
      .concat(FACE_LANDMARKS_NOSE.map((con) => con.end))
      .concat([
        102, 49, 209, 217, 174, 196, 6, 419, 399, 437, 429, 279, 331, 198, 131,
        134, 236, 3, 51, 248, 281, 456, 363, 420, 360, 94, 141, 125, 44, 237,
        239, 238, 241, 242, 99, 60, 75, 240, 235, 59, 166, 219, 79, 218, 370,
        354, 274, 457, 438, 439, 455, 460, 328, 462, 461, 250, 458, 290, 305,
        289, 392, 309, 459, 20,
      ]),
  ),
);
