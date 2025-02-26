import {
  FaceLandmarker,
  type FaceLandmarkerResult,
  FilesetResolver
} from '@mediapipe/tasks-vision';
import type { AnnotationData, ModelApi } from './modelApi';
import { findNeighbourPointIds } from '@/graph/face_landmarks_features';
import { Graph } from '@/graph/graph';
import { Point3D } from '@/graph/point3d';
import { ModelType } from '@/enums/modelType';
import { FileAnnotationHistory } from '@/cache/fileAnnotationHistory';
import { imageFromFile } from '@/util/imageFromFile';
import type { MultipleViewImage } from '@/interface/multiple_view_image';
import { Perspective } from '@/graph/perspective';

/**
 * Represents a model using MediaPipe for face landmark detection.
 * Implements the ModelApi interface for working with Point3D graphs.
 */
export class MediapipeModel implements ModelApi<Point3D> {
  private meshLandmarker: FaceLandmarker | null = null;
  private readonly imageContainer = new Image();

  static processResult(
    result: FaceLandmarkerResult,
    humanViewingDir?: Point3D
  ): Graph<Point3D> | null {
    const graphs = result.faceLandmarks
      .map((landmarks) =>
        landmarks
          .map((dict, idx) => {
            const ids = Array.from(
              findNeighbourPointIds(idx, FaceLandmarker.FACE_LANDMARKS_TESSELATION, 1)
            );
            return new Point3D(idx, dict.x, dict.y, dict.z, ids);
          })
          .map((point) => point as Point3D)
      )
      // filter out the iris markings
      .map((landmarks) => {
        landmarks = landmarks.filter((point) => {
          return ![
            ...FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.map((con) => con.start),
            ...FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.map((con) => con.start)
          ].includes(point.id);
        });
        const g = new Graph(landmarks);
        landmarks = landmarks.map((value) => {
          const viewingDir = new Point3D(-1, 0, 0, 1, []);
          if (!humanViewingDir) return value;

          const neighbourIds = value.getNeighbourIds();
          const neighbours: (Point3D | undefined)[] = neighbourIds.map((idx) => g.getById(idx));
          const triangles: [Point3D, Point3D, Point3D][] = [];

          if (neighbours.length === 0) {
            value.visible = true;
            return value;
          }

          neighbours.forEach((neighbour) => {
            if (!neighbour) return;
            const sharedNeighborIds = neighbour
              .getNeighbourIds()
              .filter(
                (possibleSharedId) =>
                  value.getNeighbourIds().includes(possibleSharedId) &&
                  possibleSharedId !== value.id
              );
            sharedNeighborIds.forEach((sharedNeighborId) => {
              const sharedNeighbor = g.getById(sharedNeighborId);
              if (!sharedNeighbor) return;
              triangles.push([value, neighbour, sharedNeighbor]);
            });
          });

          // Hide points, where all triangles are not visible
          let visible = false;
          triangles.forEach((points) => {
            const normal = Perspective.calculateNormal(points, humanViewingDir);
            visible = visible || !Perspective.isVisible(normal, viewingDir);
          });

          value.visible = visible;
          return value;
        });
        return new Graph(landmarks);
      });
    if (graphs) {
      return graphs[0];
    }
    return null;
  }

  async detect(imageFile: MultipleViewImage): Promise<FileAnnotationHistory<Point3D> | null> {
    if (!imageFile.center) {
      console.error('Tried to run detection on nonexistent view');
      return null;
    }

    const file = imageFile.selectedFile;
    if (!file) {
      console.error('Tried to run detection on nonexistent view');
      return null;
    }

    const left_file = imageFile.left?.image.filePointer;
    const center_file = imageFile.center.image.filePointer;
    const right_file = imageFile.right?.image.filePointer;

    let left_graph = undefined,
      center_graph = undefined,
      right_graph = undefined;

    if (left_file) {
      left_graph = await this.graphFromImage(left_file);
    }
    if (center_file) {
      center_graph = await this.graphFromImage(center_file);
    }
    if (right_file) {
      right_graph = await this.graphFromImage(right_file);
    }
    return FileAnnotationHistory.FromDetection(imageFile, left_graph, center_graph, right_graph);
  }

  private async graphFromImage(imageFile: File): Promise<Graph<Point3D> | undefined> {
    if (this.meshLandmarker === null) {
      await this.getModelData();
      if (!this.meshLandmarker) {
        console.error('Failed to obtain model data');
        return undefined;
      }
    }
    return new Promise<Graph<Point3D>>((resolve, reject) => {
      this.imageContainer.onload = (_) => {
        const result = this.meshLandmarker?.detect(this.imageContainer);
        if (!result) {
          reject(new Error('Face(s) could not be detected!'));
          return;
        }
        const graph = MediapipeModel.processResult(result);
        if (!graph) {
          reject(new Error('Face(s) could not be detected!'));
          return;
        }
        resolve(graph);
      };
      imageFromFile(imageFile).then((img) => {
        this.imageContainer.src = img;
      });
    });
  }

  private async getModelData() {
    this.meshLandmarker = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    ).then((filesetResolver) =>
      FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          // When adding user model of same type -> modelAssetBuffer
          delegate: 'CPU'
        },
        minFaceDetectionConfidence: 0.3,
        minFacePresenceConfidence: 0.3,
        runningMode: 'IMAGE',
        numFaces: 1
      })
    );
  }

  async uploadAnnotations(_: AnnotationData): Promise<void | Response> {
    return Promise.resolve();
  }

  type(): ModelType {
    return ModelType.mediapipe;
  }
}
