import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { Footer } from './components/layout/Footer'
import { Landing } from './pages/Landing'
import { Today } from './pages/Today'

function App() {
  return (
    <div className="min-h-screen bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/today" element={<Today />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
