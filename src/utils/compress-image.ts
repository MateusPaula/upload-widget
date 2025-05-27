interface CompressImageParams {
  file: File
  maxWidth?: number
  maxHeight: number
  quality: number
}

function convertToWebp(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')

  if (lastDotIndex === -1) {
    return `${filename}.webp`
  }

  return `${filename.substring(0, lastDotIndex)}.webp`
}

export function compressImage({
  file,
  maxWidth = Number.POSITIVE_INFINITY,
  maxHeight = Number.POSITIVE_INFINITY,
  quality = 1,
}: CompressImageParams) {
  const allowedFileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

  if (!allowedFileTypes.includes(file.type)) {
    throw new Error('image format not supported.')
  }

  // Essa API permite que faça a leitura de um arquivo aos poucos

  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => {
      const compressed = new Image()

      compressed.onload = () => {
        const canvas = document.createElement('canvas')

        let width = compressed.width
        let height = compressed.height

        // Redimensionamento
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // 2D porque é uma imagem
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        context.drawImage(compressed, 0, 0, width, height)

        // Converte o conteúdo do Canvas em um Blob
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Blob sempre em formato de array ao utilizar
            const compressedFile = new File([blob], convertToWebp(file.name), {
              type: 'image/webp',
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          'image/webp',
          quality
        )
      }

      compressed.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
