import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { BottomNav } from './components/layout/BottomNav'
import { Footer } from './components/layout/Footer'
import { Landing } from './pages/Landing'
import { Today } from './pages/Today'
import { Suggest } from './pages/Suggest'
import { Admin } from './pages/Admin'

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg px-3 py-5 pb-28 sm:px-4 sm:py-8 md:pb-8 lg:max-w-5xl lg:px-8 lg:py-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/today" element={<Today />} />
          <Route path="/suggest" element={<Suggest />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<AppLayout />} />
    </Routes>
  )
}

export default App
