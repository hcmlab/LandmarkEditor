/**
 * Parses the image data from a file
 */
export function imageFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (event) => {
      reject(event.target?.error);
    };
    reader.readAsDataURL(file);
  });
}
