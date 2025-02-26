import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Matrix } from 'mathjs';
import { Orientation } from '@/enums/orientation';
import type { ImageFile } from '@/imageFile';
import { math, reshape, reverse } from '@/util/math';
import { Point3D } from '@/graph/point3d';

export type orientationGuessResult = {
  /** the image that was guessed */
  image: ImageFile;
  /** The orientation of the image */
  orientation: Orientation;
  /** The viewing direction of the person in the image */
  viewingDir: Point3D;
  /** The mesh of the face */
  mesh: NormalizedLandmark[];
  /** The transformation matrix from absolute pixel points to positions in 3D space */
  transformationMatrix: Matrix;
  /** The reverse of the transformation matrix, to save computation time */
  revTransformationMatrix: Matrix;
};

export async function guessOrientation(images: ImageFile[]): Promise<orientationGuessResult[]> {
  const tool = await getMeshAnnotationTool();

  return await Promise.all(
    images.map(async (image) => {
      const data = await handleFile(image.filePointer);
      const res = tool.detect(data);
      const mesh = res.faceLandmarks[0];
      const [orientation, viewingDir] = orientationFromMesh(mesh);
      const transformationMatrix = math.matrix(reshape(res.facialTransformationMatrixes[0]));
      const result: orientationGuessResult = {
        image: image,
        orientation: orientation as Orientation,
        viewingDir: viewingDir as Point3D,
        mesh: mesh,
        transformationMatrix: transformationMatrix,
        revTransformationMatrix: reverse(transformationMatrix)
      };
      return result;
    })
  );
}

async function getMeshAnnotationTool() {
  return FilesetResolver.forVisionTasks(
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
      numFaces: 1,
      outputFacialTransformationMatrixes: true
    })
  );
}

function orientationFromMesh(mesh: NormalizedLandmark[]) {
  // https://github.com/sshadmand/face-direction-detection/blob/main/src/utils/drawMesh.js
  let noseTip, leftNose, rightNose;
  try {
    noseTip = mesh[1];
    leftNose = mesh[279];
    rightNose = mesh[49];
  } catch (error) {
    console.error('error creating directional points', mesh, error);
  }

  if (!noseTip || !leftNose || !rightNose) {
    return [Orientation.unknown, new Point3D(-1, 0, 0, 0, [])];
  }

  // MIDSECTION OF NOSE IS BACK OF NOSE PERPENDICULAR
  const midpoint = {
    x: (leftNose.x + rightNose.x) / 2,
    y: (leftNose.y + rightNose.y) / 2,
    z: (leftNose.z + rightNose.z) / 2
  };
  // const perpendicularUp = { x: midpoint.x, y: midpoint.y - 50, z: midpoint.z };

  // CALC ANGLES
  // const yaw = getAngleBetweenLines(midpoint, noseTip, perpendicularUp);
  const turn = getAngleBetweenLines(midpoint, rightNose, noseTip);

  /*
  turn is an angle between 0 and 180
  0  : facing away to the LEFT from the cameras POV
  180: facing away to the RIGHT from the camera POV
  */

  const directionVector = {
    x: noseTip.x - midpoint.x,
    y: noseTip.y - midpoint.y,
    z: noseTip.z - midpoint.z
  };

  const magnitude = Math.sqrt(
    directionVector.x * directionVector.x +
      directionVector.y * directionVector.y +
      directionVector.z * directionVector.z
  );

  const normalizedVector = {
    x: directionVector.x / magnitude,
    y: directionVector.y / magnitude,
    z: directionVector.z / magnitude
  };

  const point = new Point3D(-1, normalizedVector.x, normalizedVector.y, normalizedVector.z, []);

  // Todo - check what happens [180, 360]
  if (turn < 60) {
    return [Orientation.left, point];
  }

  if (turn > 120) {
    return [Orientation.right, point];
  }

  if (turn >= 60 && turn <= 120) {
    return [Orientation.center, point];
  }

  return [Orientation.unknown, point];
}

function getAngleBetweenLines(
  midpoint: { x: number; y: number; z: number },
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
) {
  const vector1 = { x: point1.x - midpoint.x, y: point1.y - midpoint.y };
  const vector2 = { x: point2.x - midpoint.x, y: point2.y - midpoint.y };

  // Calculate the dot product of the two vectors
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  // Calculate the magnitudes of the vectors
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

  // Calculate the cosine of the angle between the two vectors
  const cosineTheta = dotProduct / (magnitude1 * magnitude2);

  // Use the arccosine function to get the angle in radians
  const angleInRadians = Math.acos(cosineTheta);

  // Convert the angle to degrees
  return (angleInRadians * 180) / Math.PI;
}

async function handleFile(file: File): Promise<ImageData> {
  const reader = new FileReader();

  const dataUrl: string = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve, reject) => {
    img.onload = () => resolve(null);
    img.onerror = () => reject(new Error('Error loading image'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}
