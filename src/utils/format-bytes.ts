export function formatBytes(bytes: number): string {
  let currentBytes = bytes
  if (currentBytes < 0) {
    throw new Error('Size in bytes cannot be negative')
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let index = 0

  while (currentBytes >= 1024 && index < units.length - 1) {
    currentBytes /= 1024
    index++
  }

  return `${currentBytes.toFixed(2)} ${units[index]}`
}
