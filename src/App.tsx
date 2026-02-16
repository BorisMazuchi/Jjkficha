import { BrowserRouter, Routes, Route } from "react-router-dom"
import { FichaPersonagem } from "@/pages/FichaPersonagem"
import { TelaMestre } from "@/pages/TelaMestre"
import { TabuleiroCombate } from "@/pages/TabuleiroCombate"
import { Bestiario } from "@/pages/Bestiario"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FichaPersonagem />} />
        <Route path="/mestre" element={<TelaMestre />} />
        <Route path="/bestiario" element={<Bestiario />} />
        <Route path="/tabuleiro" element={<TabuleiroCombate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
