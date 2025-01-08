import { describe, expect, it } from 'vitest';
import { Graph } from '../../graph/graph';
import { Point2D } from '../../graph/point2d';
import { SaveStatus } from '../../enums/saveStatus';
import { MultipleViewImage } from '../../interface/multiple_view_image';
import { FileAnnotationHistory } from '../fileAnnotationHistory';
import { Orientation } from '../../enums/orientation';

function generateMockedGraph() {
  const x = Math.random() * 100; // Random number between 0 and 100
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
      })
    },
    mesh: []
  },
  left: null,
  right: null,
  selected: Orientation.center
} as MultipleViewImage;

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
});
