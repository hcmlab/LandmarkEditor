import { describe, expect, it } from 'vitest';
import { Graph } from '../../graph/graph';
import { Point2D } from '../../graph/point2d';
import { SaveStatus } from '../../enums/saveStatus';
import { MultipleViewImage } from '../../interface/multiple_view_image';
import { FileAnnotationHistory, GraphData } from '../fileAnnotationHistory';
import { Orientation } from '../../enums/orientation';
import { math } from '../../util/math';
import { Point3D } from '../../graph/point3d';

function generateMockedGraph() {
  const x = Math.random(); // Random number between 0 and 1
  const y = Math.random(); // Random number between 0 and 1
  const z = Math.random(); // Random number between 0 and 1
  const neighbors = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]; // Random numbers between 0 and 10

  return new Graph<Point2D>([new Point2D(x, y, z, neighbors)]);
}

const mockData = {
  center: {
    image: {
      mockDataPointer: new File([''], 'mock.png', {
        type: 'image/png'
      }),
      sha: 'mockSha'
    },
    mesh: []
  },
  left: null,
  right: null,
  selected: Orientation.center
} as MultipleViewImage;

const expandedMockData = new MultipleViewImage();
expandedMockData.center = {
  image: {
    mockDataPointer: new File([''], 'mock.png', {
      type: 'image/png'
    }),
    sha: 'mockSha'
  },
  mesh: [],
  transformationMatrix: math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]),
  revTransformationMatrix: math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ])
};
expandedMockData.left = {
  image: {
    mockDataPointer: new File([''], 'mock.png', {
      type: 'image/png'
    }),
    sha: 'mockSha'
  },
  mesh: [],
  transformationMatrix: math.matrix([
    [0, 0, -1, 0],
    [0, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 1]
  ]),
  // The reverse is set to the unit matrix, else the values from the other perspective can't be tested,
  // since the reverse projection will result in simple addition of the coordinates
  revTransformationMatrix: math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ])
};
expandedMockData.right = {
  image: {
    mockDataPointer: new File([''], 'mock.png', {
      type: 'image/png'
    }),
    sha: 'mockSha'
  },
  mesh: [],
  transformationMatrix: math.matrix([
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [-1, 0, 0, 0],
    [0, 0, 0, 1]
  ]),
  // The reverse is set to the unit matrix, else the values from the other perspective can't be tested,
  // since the reverse projection will result in simple addition of the coordinates
  revTransformationMatrix: math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ])
};
expandedMockData.selected = Orientation.center;

const newObject = (id: number, neighbors: number[]) => new Point2D(id, 0, 0, neighbors);

describe('FileAnnotationHistory', () => {
  it('initializes properly', () => {
    const history = new FileAnnotationHistory(mockData, 10);

    expect(history.file).eq(mockData);
    expect(history.status).eq(SaveStatus.unedited);
  });

  it('retrieves the correct mockData', () => {
    const history = new FileAnnotationHistory(mockData, 10);

    expect(history.file).eq(mockData);
  });

  it('updates the status', () => {
    const history = new FileAnnotationHistory(mockData, 10);

    expect(history.status).eq(SaveStatus.unedited);
    history.status = SaveStatus.saved;
    expect(history.status).eq(SaveStatus.saved);
  });

  it('adds new item to history', () => {
    const history = new FileAnnotationHistory(mockData, 10);
    const graph = generateMockedGraph();

    // state before addition
    expect(history.isEmpty()).toBe(true);

    history.add(graph);

    // state after addition
    expect(!history.isEmpty()).toBe(true);
    expect(history.get()).toStrictEqual(graph);
  });

  it('moves history index correctly', () => {
    const history = new FileAnnotationHistory(mockData, 10);
    const graph1 = generateMockedGraph();
    const graph2 = generateMockedGraph();

    expect(graph1).not.toBe(undefined);
    expect(graph2).not.toBe(undefined);

    history.add(graph1);
    history.add(graph2);
    expect(history.get()).toStrictEqual(graph2);

    history.previous();
    expect(history.get()).toStrictEqual(graph1);

    history.next();
    expect(history.get()).toStrictEqual(graph2);
  });

  it('keeps limits properly', () => {
    const history = new FileAnnotationHistory(mockData, 2);
    const graph1 = generateMockedGraph();
    const graph2 = generateMockedGraph();

    expect(graph1).not.toBe(undefined);
    expect(graph2).not.toBe(undefined);

    history.add(graph1);
    history.add(graph2);
    expect(history.get()).toStrictEqual(graph2);

    history.next();

    // don't go anywhere if at end
    expect(history.get()).toStrictEqual(graph2);

    // remove last when there are more then cache size
    const graph3 = generateMockedGraph();
    history.add(graph3);
    expect(history.get()).toStrictEqual(graph3);

    history.next();
    expect(history.get()).toStrictEqual(graph3);

    history.previous();
    expect(history.get()).toStrictEqual(graph2);

    history.previous();
    expect(history.get()).toStrictEqual(graph2);
  });

  it('clears properly', () => {
    const history = new FileAnnotationHistory(mockData, 10);

    history.add(generateMockedGraph());
    history.clear();
    expect(history.get()).toBe(null);
  });

  it('marks as sent properly', () => {
    const history = new FileAnnotationHistory(mockData, 10);

    history.add(generateMockedGraph());
    history.markAsSent();
    expect(history.status).eq(SaveStatus.unedited);
  });

  it('creates from JSON with valid data', () => {
    const json: GraphData = {
      points: [[{ id: 1, x: 1, y: 2, z: 3, deleted: false }]],
      sha256: 'mockSha'
    };
    const history = FileAnnotationHistory.fromJson(json, mockData, newObject);

    expect(history).not.toBeNull();
    expect(history?.file).toBe(mockData);
  });

  it('throws error from missing SHA in fromJson', () => {
    const json: GraphData = {
      points: [[{ id: 1, x: 0, y: 0, z: 0, deleted: false }]]
    };
    expect(() => FileAnnotationHistory.fromJson(json, mockData, newObject)).toThrow(
      'Missing sha from API!'
    );
  });

  it('throws error for mismatching SHA in fromJson', () => {
    const json = {
      points: [[{ id: 1, x: 0, y: 0, z: 0, deleted: false }]],
      sha256: 'invalidSha'
    };

    expect(() => FileAnnotationHistory.fromJson(json, mockData, newObject)).toThrow(
      'Mismatching sha sent from API!'
    );
  });

  it('throws error for missing points in fromJson', () => {
    const json = {
      sha256: 'mockSha'
    };
    const newObject = (id: number, neighbors: number[]) => new Point2D(id, 0, 0, neighbors);

    expect(() => FileAnnotationHistory.fromJson(json, mockData, newObject)).toThrow(
      "Didn't get any points from API!"
    );
  });

  it('updates from matrix correctly', () => {
    const history = new FileAnnotationHistory<Point3D>(expandedMockData, 10);

    /*
    x,y and z axis on the center image are the source axis.
        7 Z-axis
       /
      /
     +-----------> X-axis
     |
     |
     |
     V negative Y-axis


     right image:

        7 negative X-axis
       /
      /
     +-----------> Z-axis
     |
     |
     |
     V negative Y-axis

    left image:

        7 X-axis
       /
      /
     +-----------> negative Z-axis
     |
     |
     |
     V negative Y-axis


     center -> right: swap (z -> -x, x -> z)
     center -> left: swap (z -> x, x -> -z)
     */

    const test_point = new Point3D(1, 1, 1, 1, []); // start
    const move_point = new Point3D(1, 2, 3, 4, []); // delta
    const dest_point_right = new Point3D(
      1,
      test_point.x + move_point.z,
      test_point.y + move_point.y,
      -test_point.z - move_point.x,
      []
    ); // dest
    const dest_point_left = new Point3D(
      1,
      -test_point.x - move_point.z,
      test_point.y + move_point.y,
      test_point.z + move_point.x,
      []
    );
    const graph = new Graph([test_point]);

    history.file.selected = Orientation.left;
    history.add(graph);

    history.file.selected = Orientation.right;
    history.add(graph);

    history.file.selected = Orientation.center;
    history.add(graph);

    history.file.selected = Orientation.center;

    history.updateOtherPerspectives([move_point]);

    history.file.selected = Orientation.right;
    expect(history.get().points[0]).toEqual(dest_point_right);

    history.file.selected = Orientation.left;
    expect(history.get().points[0]).toEqual(dest_point_left);
  });
});
