import { create } from "zustand";
import { enableMapSet } from "immer";
import { immer } from 'zustand/middleware/immer'
import { uploadFileToStorage } from "../http/upload-file-to-storage";
import { CanceledError } from "axios";
import { useShallow } from "zustand/shallow";
import { compressImage } from "../utils/compress-image";

export type Upload = {
    name: string,
    file: File,
    abortController?: AbortController,
    status: 'progress' | 'success' | 'error' | 'canceled',
    originalSizeInBytes: number,
    compressedSizeInBytes?: number
    uploadSizeInBytes: number
    remoteUrl?: string
}

type UploadState = {
    // Map é uma estrutura javascript que permite sempre criar um objeto com estrutura [key, value]
    // Usamos o Map porque cada upload precisa ser único, e o frontend precisa gerar um id porque ele pode não ter ainda um ID no backend
    uploads: Map<string, Upload>
    addUploads: (files: File[]) => void
    cancelUpload: (uploadId: string) => void
    retryUpload: (uploadId: string) => void
}

// Permite usar map e set no estado
enableMapSet()

// Esse hook de `useUploads` devolve as funções necessárias para fazer a alteração no estado
export const useUploads = create<UploadState, [['zustand/immer', never]]>(
    immer((set, get) => {
        function updateUpload(uploadId: string, data: Partial<Upload>) {
            const upload = get().uploads.get(uploadId)

            if (!upload) {
                return
            }

            set(state => {
                state.uploads.set(uploadId, { ...upload, ...data })
            })
        }

        async function processUpload(uploadId: string) {
            const upload = get().uploads.get(uploadId)

            if (!upload) {
                return
            }

            const abortController = new AbortController()

            updateUpload(uploadId, {
                uploadSizeInBytes: 0,
                remoteUrl: undefined,
                compressedSizeInBytes: undefined,
                abortController,
                status: 'progress',
            })

            try {

                const compressedFile = await compressImage({
                    file: upload.file,
                    maxHeight: 1000,
                    maxWidth: 1000,
                    quality: 0.8
                })

                updateUpload(uploadId, { compressedSizeInBytes: compressedFile.size })


                const { url } = await uploadFileToStorage({file: compressedFile, onProgress(sizeInBytes) {
                    updateUpload(uploadId, {uploadSizeInBytes: sizeInBytes})
                },}, { signal: abortController?.signal })

                updateUpload(uploadId, { status: 'success', remoteUrl: url})
    
            } catch (err) {
                if (err instanceof CanceledError) {
                    updateUpload(uploadId, { status: 'canceled' })
                    return
                }

                updateUpload(uploadId, { status: 'error' })
            }

        }

        function cancelUpload(uploadId: string) {
            const upload = get().uploads.get(uploadId)

            if (!upload) {
                return
            }

            upload.abortController?.abort()
        }

        function retryUpload(uploadId: string) {
            processUpload(uploadId)
        }
        
        function addUploads(files: File[]) {
            for (const file of files) {
                const uploadId = crypto.randomUUID()

                const upload: Upload = {
                    name: file.name,
                    file,
                    status: 'progress',
                    originalSizeInBytes: file.size,
                    uploadSizeInBytes: 0
                }

                // Essa é a melhor forma para atualização de estado quando tem múltiplos valores sendo setados
                // porque evita problemas de clousure assim como no react
                set(state => {
                    state.uploads.set(uploadId, upload) // Não precisa retornar porque o Immer já vai calcular como deve retornar
                })

                processUpload(uploadId)
            }
        }
        
        return {
            uploads: new Map(),
            addUploads,
            cancelUpload,
            retryUpload
        }
    })
)

export const usePendingUploads = () => {
    return useUploads(useShallow(store => {
        const isThereAnyPendingUploads = Array.from(store.uploads.values()).some(upload => upload.status === 'progress')

        if (!isThereAnyPendingUploads) {
            return { isThereAnyPendingUploads, globalPercentage: 100 }
        }

        const {total, uploaded } = Array.from(store.uploads.values()).reduce(
            (acc, upload) => {
                if (upload.compressedSizeInBytes) {
                    acc.uploaded += upload.uploadSizeInBytes
                }

                acc.total += upload.compressedSizeInBytes || upload.originalSizeInBytes


                return acc
            },
            { total: 0, uploaded: 0}
        )

        const globalPercentage = Math.min(
            Math.round((uploaded * 100) / total),
            100
        )

        return {
            isThereAnyPendingUploads,
            globalPercentage
        }
    }))
}