import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Home } from "@/pages/Home"
import { FichaPersonagem } from "@/pages/FichaPersonagemV2"
import { ListagemFichas } from "@/pages/ListagemFichas"
import { TelaMestre } from "@/pages/TelaMestre"
import { TabuleiroCombate } from "@/pages/TabuleiroCombate"
import { Bestiario } from "@/pages/Bestiario"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fichas" element={<ListagemFichas />} />
        <Route path="/ficha" element={<FichaPersonagem />} />
        <Route path="/mestre" element={<TelaMestre />} />
        <Route path="/bestiario" element={<Bestiario />} />
        <Route path="/tabuleiro" element={<TabuleiroCombate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
