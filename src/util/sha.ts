import jsSHA from 'jssha';

export function calculateSHA(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target?.result as ArrayBuffer;
      const shaObj = new jsSHA('SHA-256', 'ARRAYBUFFER');
      shaObj.update(new Uint8Array(data));
      const hash = shaObj.getHash('HEX');
      resolve(hash);
    };
    reader.onerror = function (err) {
      reject(new Error(`An error occurred while reading the file: ${err}`));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function checkSHA(file: File, expectedSHA: string): Promise<boolean> {
  const hash = await calculateSHA(file);
  return hash === expectedSHA;
}
