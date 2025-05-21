import { UploadWidget } from "./components/upload-widget";

export function App() {
  return (
          // o vh é ruim para ambiente mobile porque as partes do mobile de ícones empurram a tela, criando um scroll
        // small viewport height (svh): o menor tamanho possível da viewport, mas pode ser ruim se o usuário der scroll, porque ele fica menor que o lvh
        // large viewport: Tamanho que sobra após scroll no mobile
        // dynamic viewport height (dvh): se a tela mudar de tamanho, ele se ajusta
        <main className="h-dvh flex flex-col items-center justify-center p-10"> 
            <UploadWidget/>
        </main>
  )
}
