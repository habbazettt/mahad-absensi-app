import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import RegisterMentor from './pages/auth/RegisterMentor.tsx'
import RegisterMahasantri from './pages/auth/RegisterMahasantri.tsx'
import LoginMentor from './pages/auth/LoginMentor.tsx'
import LoginMahasantri from './pages/auth/LoginMahasantri.tsx'
import AuthMentorLayout from './layout/AuthMentorLayout.tsx'
import AuthMahasantriLayout from './layout/AuthMahasantriLayout.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      {/* Grup rute untuk otentikasi Mentor */}
      <Route path="/auth/mentor" element={<AuthMentorLayout />}>
        <Route path="register" element={<RegisterMentor />} />
        <Route path="login" element={<LoginMentor />} />
      </Route>

      {/* Grup rute untuk otentikasi Mahasantri */}
      <Route path="/auth/mahasantri" element={<AuthMahasantriLayout />}>
        <Route path="register" element={<RegisterMahasantri />} />
        <Route path="login" element={<LoginMahasantri />} />
      </Route>
    </Routes>
  )
}

export default App
