import { describe, it, expect } from 'vitest';
import { Perspective } from '../perspective';
import { Point2D } from '../point2d';
import { Point3D } from '../point3d';

const HTMLImage = new Image();
HTMLImage.height = 100;
HTMLImage.width = 100;

describe('perspective2d', () => {
  describe('project', () => {
    it('works regularly inside [0, 1]', () => {
      const point = new Point2D(1, 0.1, 0.1, []);
      const res = Perspective.project(HTMLImage, point);

      expect(res.x).toBeCloseTo(10);
      expect(res.y).toBeCloseTo(10);
    });
  });
  describe('distance', () => {
    it('calculates distance between two points', () => {
      const point1 = new Point2D(1, 0.1, 0.1, []);
      const point2 = new Point2D(2, 0.2, 0.2, []);
      const res = Perspective.distanceTo(HTMLImage, point1, point2);

      expect(res).toBeCloseTo(14.142);
    });
    it('calculates 0 between same point', () => {
      const point1 = new Point2D(1, 0.1, 0.1, []);
      const res = Perspective.distanceTo(HTMLImage, point1, point1);
      expect(res).toBe(0);
    });
  });
  describe('intersects', () => {
    it('successful distance checking', () => {
      const point = new Point2D(1, 0.1, 0.1, []);
      const pointCheck = new Point2D(2, 0.1, 0.11, []);
      const delta = 1;
      const res = Perspective.intersects(HTMLImage, point, pointCheck, delta);

      expect(res).toBe(true);
    });
    it('just right out of range', () => {
      const point = new Point2D(1, 0.1, 0.1, []);
      const pointCheck = new Point2D(2, 0.1, 0.11, []);
      const delta = 0.9;
      const res = Perspective.intersects(HTMLImage, point, pointCheck, delta);
      expect(res).toBe(false);
    });
  });
  describe('unproject', () => {
    it('successful distance checking', () => {
      const point = new Point2D(1, 10, 10, []);
      const zeroPoint = new Point2D(2, 0, 0, []);
      const fullPoint = new Point2D(3, 100, 100, []);
      const res = Perspective.unproject(HTMLImage, point);
      const zeroRes = Perspective.unproject(HTMLImage, zeroPoint);
      const fullRes = Perspective.unproject(HTMLImage, fullPoint);

      expect(res).toEqual(new Point2D(1, 0.1, 0.1, []));
      expect(zeroRes).toEqual(new Point2D(2, 0, 0, []));
      expect(fullRes).toEqual(new Point2D(3, 1, 1, []));
    });
  });

  describe('orderTrianglePoints', () => {
    it('should order points in descending z-values', () => {
      const p1 = new Point3D(1, 1, 0, 1, []);
      const p2 = new Point3D(2, 0, 1, 0, []);
      const p3 = new Point3D(3, -1, 0, -1, []);
      const orderedPoints = Perspective.orderTrianglePoints([p1, p2, p3]);
      expect(orderedPoints).toEqual([p1, p2, p3]);
    });

    it('should swap points to ensure descending z-values', () => {
      const p1 = new Point3D(1, 0, 0, 1, []);
      const p2 = new Point3D(2, 0, 1, -1, []);
      const p3 = new Point3D(3, 1, 0, 0, []);
      const orderedPoints = Perspective.orderTrianglePoints([p1, p2, p3]);
      expect(orderedPoints).toEqual([p1, p3, p2]);
    });
  });

  describe('calculateNormal', () => {
    it('should calculate the normal vector of a triangle', () => {
      const humanViewingDir = new Point3D(0, 0, 0, -0.5, []);
      const p1 = new Point3D(1, 0, 0, 0, []);
      const p2 = new Point3D(2, 1, 0, 0, []);
      const p3 = new Point3D(3, 0, 1, 0, []);
      const normal = Perspective.calculateNormal([p1, p2, p3], humanViewingDir);
      expect(normal.x).toBeCloseTo(0);
      expect(normal.y).toBeCloseTo(0);
      expect(normal.z).toBeCloseTo(-1);
    });
  });

  describe('isHidden', () => {
    it('should return false if the point is hidden', () => {
      const normal = new Point3D(1, 0, 0, 1, []);
      const viewDirection = new Point3D(2, 0, 0, -1, []);
      const hidden = Perspective.isVisible(normal, viewDirection);
      expect(hidden).toBe(false);
    });

    it('should return true if the point is not hidden', () => {
      const normal = new Point3D(1, 0, 0, 1, []);
      const viewDirection = new Point3D(2, 0, 0, 1, []);
      const hidden = Perspective.isVisible(normal, viewDirection);
      expect(hidden).toBe(true);
    });

    it('should return false if the normal is 90 degrees off axis of the viewing direction', () => {
      const normal = new Point3D(1, 0, 1, 0, []);
      const viewDirection = new Point3D(2, 0, 0, 1, []);
      const hidden = Perspective.isVisible(normal, viewDirection);
      expect(hidden).toBe(false);
    });

    it('should return true if the normal is a little bit less then 90 degrees off axis of the viewing direction', () => {
      const normal = new Point3D(1, 0, 1, 0.0000001, []);
      const viewDirection = new Point3D(2, 0, 0, 1, []);
      const hidden = Perspective.isVisible(normal, viewDirection);
      expect(hidden).toBe(true);
    });
  });
});
