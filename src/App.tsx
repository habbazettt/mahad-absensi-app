import { Routes, Route } from 'react-router-dom'
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
import AddTargetPage from './pages/target-semester/AddTargetPage.tsx'
import EditTargetPage from './pages/target-semester/EditTarget.tsx'
import MentorInfoPage from './pages/mentor/MentorInfo.tsx'
import AddAbsensiPage from './pages/absensi/AddAbsensiPage.tsx'
import DetailAbsensiPage from './pages/absensi/DetailAbsensiPage.tsx'
import EditAbsensiPage from './pages/absensi/EditAbsensiPage.tsx'
import DashboardMahasantri from './pages/dashboard/DashboardMahasantri.tsx'
import ComingSoon from './pages/ComingSoon.tsx'

function App() {
  return (
    <Routes>

      {/* Main Dashboard */}
      <Route path='/dashboard' element={<DashboardPage />} />
      <Route path='/dashboard/mahasantri' element={<DashboardMahasantri />} />

      {/* Mahasantri Features Pages */}
      <Route path='/dashboard/mahasantri/ai-rekomendasi' element={<ComingSoon />} />
      <Route path='/dashboard/mahasantri/raport-kelulusan' element={<ComingSoon />} />

      {/* Mentor Pages */}
      <Route path='/dashboard/info-mentor' element={<MentorInfoPage />} />
      <Route path='/dashboard/mentor/edit/:id' element={<EditMentorPage />} />

      {/* Info Mahasantri Pages */}
      <Route path='/dashboard/info-mahasantri' element={<MahasantriInfoPage />} />
      <Route path='/dashboard/info-mahasantri/detail/:id' element={<DetailMahasantriPage />} />
      <Route path='/dashboard/info-mahasantri/edit/:id' element={<EditMahasantriPage />} />

      {/* Absensi Pages */}
      <Route path='/dashboard/absensi' element={<AbsensiPage />} />
      <Route path='/dashboard/absensi/add' element={<AddAbsensiPage />} />
      <Route path='/dashboard/absensi/detail' element={<DetailAbsensiPage />} />
      <Route path='/dashboard/absensi/edit/:id' element={<EditAbsensiPage />} />

      {/* Setoran Pages */}
      <Route path='/dashboard/setoran' element={<SetoranPage />} />
      <Route path='/dashboard/setoran/add' element={<AddSetoranPage />} />
      <Route path='/dashboard/setoran/edit/:id' element={<EditSetoranPage />} />

      {/* Target Semester Pages */}
      <Route path='/dashboard/target-semester/add' element={<AddTargetPage />} />
      <Route path='/dashboard/target-semester/edit/:id' element={<EditTargetPage />} />

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
