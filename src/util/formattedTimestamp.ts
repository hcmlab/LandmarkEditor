export default function getFormattedTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const padMilliseconds = (n: number) => n.toString().padStart(3, '0');

  return (
    `${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}` +
    `_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}` +
    `_${padMilliseconds(now.getMilliseconds())}`
  );
}
