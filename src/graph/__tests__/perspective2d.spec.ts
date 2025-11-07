import { describe, it, expect } from 'vitest';
import { Perspective2D } from '../perspective2d';
import { Point2D } from '../point2d';

const HTMLImage = new Image();
HTMLImage.height = 100;
HTMLImage.width = 100;

describe('perspective2d', () => {
  describe('project', () => {
    it('works regularly inside [0, 1]', () => {
      const point = new Point2D(1, 0.1, 0.1, []);
      const res = Perspective2D.project(HTMLImage, point);

      expect(res.x).toBeCloseTo(10);
      expect(res.y).toBeCloseTo(10);
    });
  });
  describe('distance', () => {
    it('calculates distance between two points', () => {
      const point1 = new Point2D(1, 0.1, 0.1, []);
      const point2 = new Point2D(2, 0.2, 0.2, []);
      const res = Perspective2D.distanceTo(HTMLImage, point1, point2);

      expect(res).toBeCloseTo(14.142);
    });
    it('calculates 0 between same point', () => {
      const point1 = new Point2D(1, 0.1, 0.1, []);
      const res = Perspective2D.distanceTo(HTMLImage, point1, point1);
      expect(res).toBe(0);
    });
  });
  describe('intersects', () => {
    it('successful distance checking', () => {
      const point = new Point2D(1, 0.1, 0.1, []);
      const pointCheck = new Point2D(2, 0.1, 0.11, []);
      const delta = 1;
      const res = Perspective2D.intersects(HTMLImage, point, pointCheck, delta);

      expect(res).toBe(true);
    });
    it('just right out of range', () => {
      const point = new Point2D(1, 0.1, 0.1, []);
      const pointCheck = new Point2D(2, 0.1, 0.11, []);
      const delta = 0.9;
      const res = Perspective2D.intersects(HTMLImage, point, pointCheck, delta);
      expect(res).toBe(false);
    });
  });
  describe('unproject', () => {
    it('successful distance checking', () => {
      const point = new Point2D(1, 10, 10, []);
      const zeroPoint = new Point2D(2, 0, 0, []);
      const fullPoint = new Point2D(3, 100, 100, []);
      const res = Perspective2D.unproject(HTMLImage, point);
      const zeroRes = Perspective2D.unproject(HTMLImage, zeroPoint);
      const fullRes = Perspective2D.unproject(HTMLImage, fullPoint);

      expect(res).toEqual(new Point2D(1, 0.1, 0.1, []));
      expect(zeroRes).toEqual(new Point2D(2, 0, 0, []));
      expect(fullRes).toEqual(new Point2D(3, 1, 1, []));
    });
  });
});
