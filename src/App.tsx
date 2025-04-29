import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import ForgotPassword from './pages/auth/ForgotPassword.tsx'
import DashboardPage from './pages/dashboard/Dashboard.tsx'
import MahasantriInfoPage from './pages/mahasantri/MahasantriInfo.tsx'
import AbsensiPage from './pages/absensi/AbsensiPage.tsx'
import SetoranPage from './pages/setoran/SetoranPage.tsx'
import EditMahasantriPage from './pages/mahasantri/EditMahasantriPage.tsx'
import EditMentorPage from './pages/mentor/EditMentorPage.tsx'
import AddSetoranPage from './pages/setoran/AddSetoranPage.tsx'
import EditSetoranPage from './pages/setoran/EditSetoranPage.tsx'
import NotFound from './pages/NotFound.tsx'
import DetailMahasantriPage from './pages/mahasantri/DetailMahasantri.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Main Dashboard */}
      <Route path='/dashboard' element={<DashboardPage />} />

      {/* Info Mahasantri Pages */}
      <Route path='/dashboard/info-mahasantri' element={<MahasantriInfoPage />} />
      <Route path='/dashboard/info-mahasantri/detail/:id' element={<DetailMahasantriPage />} />
      <Route path='/dashboard/info-mahasantri/edit/:id' element={<EditMahasantriPage />} />

      {/* Mentor Pages */}
      <Route path='/dashboard/mentor/edit/:id' element={<EditMentorPage />} />

      {/* Absensi Pages */}
      <Route path='/dashboard/absensi' element={<AbsensiPage />} />

      {/* Setoran Pages */}
      <Route path='/dashboard/setoran' element={<SetoranPage />} />
      <Route path='/dashboard/setoran/add' element={<AddSetoranPage />} />
      <Route path='/dashboard/setoran/edit/:id' element={<EditSetoranPage />} />

      {/* Auth Pages */}
      <Route path='auth/register' element={<RegisterPage />} />
      <Route path='auth/login' element={<LoginPage />} />
      <Route path='/auth/forgot-password' element={<ForgotPassword />} />

      {/* Not Found */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
