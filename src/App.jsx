import React, { useEffect, useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import InitRoom from "./components/InitRoom"
import Home from "./pages/Home"
import Room from "./pages/Room"

function App() {
  const location = useLocation();

  const [showCreateRoom, setShowCreateRoom] = useState(false)

  useEffect(() => {
    if (showCreateRoom) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }
  }, [showCreateRoom]);

  return (
    <>
      <main className='min-h-screen bg-slate-800'>
        <div className="3xl:container 3xl:mx-auto">
          {location.pathname.split('/').includes('room') ? null : (
            <Navbar setShowCreateRoom={setShowCreateRoom} />
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:channel" element={<Room />} />
            <Route path="*" element={<Navigate to={'/'} />} />
          </Routes>
          {location.pathname.split('/').includes('room') ? null : (
            <Footer />
          )}
        </div>
      </main>

      {showCreateRoom && <InitRoom setShowCreateRoom={setShowCreateRoom} />}
    </>
  )
}

export default App
