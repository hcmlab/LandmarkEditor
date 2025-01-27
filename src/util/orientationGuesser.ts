import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Matrix } from 'mathjs';
import { Orientation } from '@/enums/orientation';
import type { ImageFile } from '@/imageFile';
import { math, reshape } from '@/util/math';

export type orientationGuessResult = {
  image: ImageFile;
  orientation: Orientation;
  mesh: NormalizedLandmark[];
  transformationMatrix: Matrix;
  width: number;
  height: number;
};

export async function guessOrientation(images: ImageFile[]): Promise<orientationGuessResult[]> {
  const tool = await getMeshAnnotationTool();

  return await Promise.all(
    images.map(async (image) => {
      const data = await handleFile(image.filePointer);
      const res = tool.detect(data);
      const mesh = res.faceLandmarks[0];
      const orientation = orientationFromMesh(mesh);
      const transformationMatrix = math.matrix(reshape(res.facialTransformationMatrixes[0]));
      const width = data.width;
      const height = data.height;
      const result: orientationGuessResult = {
        image,
        orientation,
        mesh,
        transformationMatrix,
        width,
        height
      };
      return result;
    })
  );
}

function getMeshAnnotationTool() {
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
    console.log('error creating directional points', mesh, error);
  }

  if (!noseTip || !leftNose || !rightNose) {
    return Orientation.unknown;
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

  // Todo - check what happens [180, 360]
  if (turn < 60) {
    return Orientation.left;
  }

  if (turn > 120) {
    return Orientation.right;
  }

  if (turn >= 60 && turn <= 120) {
    return Orientation.center;
  }

  return Orientation.unknown;
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
