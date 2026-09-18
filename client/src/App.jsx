import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/common/Navbar'
import { Footer } from './components/common/Footer'
import { PortfolioPage } from './pages/PortfolioPage'
import { BioLinkPage } from './pages/BioLinkPage'
import { AdminPortalPage } from './pages/AdminPortalPage'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between py-6">
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<PortfolioPage />} />
              <Route path="/links" element={<BioLinkPage />} />
              <Route path="/admin-portal" element={<AdminPortalPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  )
}
