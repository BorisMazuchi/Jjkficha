import { BrowserRouter, Routes, Route } from "react-router-dom"
import { FichaPersonagem } from "@/pages/FichaPersonagem"
import { TelaMestre } from "@/pages/TelaMestre"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FichaPersonagem />} />
        <Route path="/mestre" element={<TelaMestre />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
