import axios from 'axios'

interface UploadFileToStorageParms {
  file: File
  onProgress: (sizeInBytes: number) => void
}

interface UploadFileToStorageOpts {
  signal?: AbortSignal // Forma de cancelar coisas na web
}

export async function uploadFileToStorage(
  { file, onProgress }: UploadFileToStorageParms,
  opts?: UploadFileToStorageOpts
) {
  const data = new FormData()
  data.append('file', file)
  const response = await axios.post('http://localhost:3333/uploads', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal: opts?.signal,
    onUploadProgress(progressEvent) {
      onProgress(progressEvent.loaded)
    },
  })

  console.log(response)

  return { url: response.data.url }
}
