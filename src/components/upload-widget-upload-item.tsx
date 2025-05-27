import * as Progress from '@radix-ui/react-progress'
import { Download, ImageUp, Link2, RefreshCcw, X } from 'lucide-react'
import { motion } from 'motion/react'
import { type Upload, useUploads } from '../store/uploads'
import { downloadUrl } from '../utils/download-url'
import { formatBytes } from '../utils/format-bytes'
import { Button } from './ui/button'

interface UploadWidgetUploadItemProps {
  uploadId: string
  upload: Upload
}

export function UploadWidgetUploadItem({
  uploadId,
  upload,
}: UploadWidgetUploadItemProps) {
  const cancelUpload = useUploads(store => store.cancelUpload)
  const retryUpload = useUploads(store => store.retryUpload)

  // Bom usar o Math.min para deixar o maximo em 100%
  const progress = Math.min(
    upload.compressedSizeInBytes
      ? Math.round((upload.uploadSizeInBytes * 100) / upload.compressedSizeInBytes)
      : 0,
    100
  )

  return (
    <motion.div
      className="p-3 rounded-lg flex flex-col gap-3 shadow-shape-content bg-white/2 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium flex items-center gap-1">
          <ImageUp className="size-3 text-zinc-300" strokeWidth={1.5} />
          <span className="max-w-[180px] truncate">{upload.name}</span>
        </span>

        <span className="text-xxs text-zinc-400 flex gap-1.5 items-center">
          {/* line-through: indica que é um tamanho passado (valor riscado) */}
          <span className="line-through">
            {formatBytes(upload.originalSizeInBytes)}
          </span>
          <div className="size-1 rounded-full bg-zinc-700" />
          <span>
            {formatBytes(upload.compressedSizeInBytes ?? 0)}
            {upload.compressedSizeInBytes && (
              <span className="text-green-400 ml-1">
                -
                {Math.round(
                  ((upload.originalSizeInBytes - upload.compressedSizeInBytes) * 100) /
                    upload.originalSizeInBytes
                )}
                %
              </span>
            )}
          </span>
          <div className="size-1 rounded-full bg-zinc-700" />

          {upload.status === 'success' && <span>100%</span>}
          {upload.status === 'progress' && <span>{progress}%</span>}
          {upload.status === 'error' && <span className="text-red-400">Error</span>}
          {upload.status === 'canceled' && (
            <span className="text-yellow-400">Canceled</span>
          )}
        </span>
      </div>

      <Progress.Root
        className="group bg-zinc-800 rounded-full h-1 overflow-hidden"
        data-status={upload.status}
      >
        {/* Quando a gente precisa passar um valor para um css que vem de uma variável que não é um boolean, por exemplo um calculo,
                a gente não usa classes do tailwind e sim css normal */}
        <Progress.Indicator
          className="group-data-[status=success]:bg-green-400 group-data-[status=error]:bg-red-400 group-data-[status=canceled]:bg-yellow-400 bg-indigo-500 h-1 transition-all"
          style={{ width: upload.status === 'progress' ? `${progress}%` : '100%' }}
        />
      </Progress.Root>

      <div className="absolute top-2 right-2 flex items-center gap-1">
        <Button
          size="icon-sm"
          aria-disabled={!upload.remoteUrl}
          onClick={() => {
            if (upload.remoteUrl) {
              downloadUrl(upload.remoteUrl)
            }
          }}
        >
          <Download className="size-4" strokeWidth={1.5} />
          {/* sr-only: serve apenas para o leitor de tela ler essa imagem (acessibilidade) */}
          <span className="sr-only">Download compressed image</span>
        </Button>

        <Button
          size="icon-sm"
          disabled={!upload.remoteUrl}
          onClick={() =>
            upload.remoteUrl && navigator.clipboard.writeText(upload.remoteUrl)
          }
        >
          <Link2 className="size-4" strokeWidth={1.5} />
          {/* sr-only: serve apenas para o leitor de tela ler essa imagem (acessibilidade) */}
          <span className="sr-only">Copy remote URL</span>
        </Button>

        <Button
          disabled={!['canceled', 'error'].includes(upload.status)}
          size="icon-sm"
          onClick={() => retryUpload(uploadId)}
        >
          <RefreshCcw className="size-4" strokeWidth={1.5} />
          {/* sr-only: serve apenas para o leitor de tela ler essa imagem (acessibilidade) */}
          <span className="sr-only">Retry upload</span>
        </Button>

        <Button
          disabled={upload.status !== 'progress'}
          size="icon-sm"
          onClick={() => cancelUpload(uploadId)}
        >
          <X className="size-4" strokeWidth={1.5} />
          {/* sr-only: serve apenas para o leitor de tela ler essa imagem (acessibilidade) */}
          <span className="sr-only">Cancel upload</span>
        </Button>
      </div>
    </motion.div>
  )
}
