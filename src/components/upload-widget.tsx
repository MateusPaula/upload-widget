import * as Collapsible from "@radix-ui/react-collapsible";
import { motion, useCycle } from 'motion/react'
import { UploadWidgetDropzone } from "./upload-widget-dropzone";
import { UploadWidgetHeader } from "./upload-widget-header";
import { UploadWidgetUploadList } from "./upload-widget-upload-list";
import { UploadWidgetMinimizedButton } from "./upload-widget-minimized-button";

export function UploadWidget() {
    const isThereAnyPendingUploads = true
    // useCycle recebe o primeiro valor como default e depois os valores que ele vai se tornar é como se fosse um switch/toggle
    const [isWidgetOpen, toggleWidgetOpen] = useCycle(false, true);

    return (
        // o 'asChild' não cria uma div nova
        <Collapsible.Root onOpenChange={() => toggleWidgetOpen()} asChild>
            {/* We're using overflow hidden to hide the border */}
            <motion.div
                data-progress={isThereAnyPendingUploads}
                className="bg-zinc-900 overflow-hidden max-w-[360px] rounded-xl data-[state=open]:shadow-shape border border-transparent animate-border data-[state=closed]:rounded-3xl data-[state=closed]:data-[progress=false]:shadow-shape data-[state=closed]:data-[progress=true]:[background:linear-gradient(45deg,#09090B,theme(colors.zinc.900)_50%,#09090B)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.zinc.700/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.zinc.600/.48))_border-box]"
                animate={isWidgetOpen ? 'open' : 'closed'}
                variants={{
                    closed: {
                        width: 'max-content', // pega o maximo de width que precisa para que todos os elementos caibam,
                        height: 44,
                        transition: {
                            type: 'inertia' // fecha direto (sem animação)
                        }
                    },
                    open: {
                        width: 360, // Ocupe o máximo possível
                        height: 'auto', // Calcular com base no conteúdo,
                        transition: {
                            duration: 0.1
                        }
                    }
                }}
            >
                {!isWidgetOpen && <UploadWidgetMinimizedButton />}

                <Collapsible.Content>
                        <UploadWidgetHeader />

                        <div className="flex flex-col gap-4 py-3">
                            <UploadWidgetDropzone/>
                            {/* box-content: colocar a borda por volta do conteúdo e não em cima do conteúdo (inset - border-box) */}
                            <div className="h-px bg-zinc-800 border-t border-black/50 box-content"></div>
                            <UploadWidgetUploadList/>
                        </div>
                </Collapsible.Content>
            </motion.div>
        </Collapsible.Root>
    )
}