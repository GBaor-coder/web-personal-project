import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/common/Navbar'
import { Footer } from './components/common/Footer'
import { PortfolioPage } from './pages/PortfolioPage'
import { BioLinkPage } from './pages/BioLinkPage'
import { AdminPortalPage } from './pages/AdminPortalPage'

// Public layout: Navbar + Footer wrapper
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col justify-between py-6">
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
    <Footer />
  </div>
)

// Admin layout: No Navbar, No Footer — full-screen control panel
const AdminLayout = ({ children }) => (
  <div className="min-h-screen" style={{ background: '#e0e5ec' }}>
    <main>{children}</main>
  </div>
)

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <PortfolioPage />
            </PublicLayout>
          }
        />
        <Route
          path="/links"
          element={
            <PublicLayout>
              <BioLinkPage />
            </PublicLayout>
          }
        />

        {/* Admin Route — hidden, no Navbar/Footer */}
        <Route
          path="/admin-portal"
          element={
            <AdminLayout>
              <AdminPortalPage />
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  )
}

