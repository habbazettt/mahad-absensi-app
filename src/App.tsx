import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import RegisterMentor from './pages/auth/RegisterMentor.tsx'
import RegisterMahasantri from './pages/auth/RegisterMahasantri.tsx'
import LoginMentor from './pages/auth/LoginMentor.tsx'
import LoginMahasantri from './pages/auth/LoginMahasantri.tsx'
import AuthMentorLayout from './layout/AuthMentorLayout.tsx'
import AuthMahasantriLayout from './layout/AuthMahasantriLayout.tsx'
import ForgotPassword from './pages/auth/ForgotPassword.tsx'
import DashboardPage from './pages/dashboard/Dashboard.tsx'
import MahasantriInfoPage from './pages/dashboard/MahasantriInfo.tsx'
import AbsensiPage from './pages/dashboard/AbsensiPage.tsx'
import SetoranPage from './pages/dashboard/SetoranPage.tsx'
import EditMahasantriPage from './pages/dashboard/EditMahasantriPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/dashboard' element={<DashboardPage />} />
      <Route path='/dashboard/info-mahasantri' element={<MahasantriInfoPage />} />
      <Route path='/dashboard/info-mahasantri/edit/:id' element={<EditMahasantriPage />} />
      <Route path='/dashboard/absensi' element={<AbsensiPage />} />
      <Route path='/dashboard/setoran' element={<SetoranPage />} />

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

      <Route path='/auth/forgot-password' element={<ForgotPassword />} />

      <Route path='*' element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

export default App
