import React from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar({ setShowCreateRoom }) {
  const navigate = useNavigate()

  return (
    <nav className='bg-slate-900 h-[10vh] border-b border-slate-950 flex items-center justify-between px-4 lg:px-8'>
      <b className="text-2xl cursor-pointer" onClick={() => navigate('/')}>RaveMeet</b>
      <button
        className="rounded-md bg-orange-500 px-3 py-1.5 font-bold"
        style={{ backgroundImage: 'linear-gradient(to right, #ff8c00, #ff2f96)' }}
        onClick={() => setShowCreateRoom(true)}
      >
        Create Room
      </button>

    </nav>
  )
}

export default Navbar