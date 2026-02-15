import { BrowserRouter, Routes, Route } from "react-router-dom"
import { FichaPersonagem } from "@/pages/FichaPersonagem"
import { TelaMestre } from "@/pages/TelaMestre"
import { TabuleiroCombate } from "@/pages/TabuleiroCombate"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FichaPersonagem />} />
        <Route path="/mestre" element={<TelaMestre />} />
        <Route path="/tabuleiro" element={<TabuleiroCombate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
