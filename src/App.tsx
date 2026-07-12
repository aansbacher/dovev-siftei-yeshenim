import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { Footer } from './components/layout/Footer'
import { Landing } from './pages/Landing'
import { Today } from './pages/Today'
import { Admin } from './pages/Admin'

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg px-3 py-5 sm:px-4 sm:py-8 lg:max-w-5xl lg:px-8 lg:py-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/today" element={<Today />} />
        </Routes>
      </main>
      <Footer />
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
