import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function InitRoom({ setShowCreateRoom }) {
  const [roomLogin, setRoomLogin] = useState({
    username: sessionStorage.getItem('username') || '',
    roomName: ''
  })

  const naviagate = useNavigate()

  const closeRoomModal = () => setShowCreateRoom(false)

  const handleSubmit = () => {
    sessionStorage.setItem('username', String(roomLogin.username))

    naviagate(`/room/${roomLogin.roomName}`)
    closeRoomModal()
  }

  return (
    <>
      <div className="fixed z-20 w-screen h-screen top-0 left-0 flex items-center justify-center bg-slate-800/50">
        <div className="w-[98vw] h-auto overflow-y-auto border border-orange-500 bg-slate-900 rounded-lg md:w-[500px] md:h-[400px]">
          <div className="py-3 bg-slate-800 flex items-center justify-between">
            <b className="text-lg w-[70%] text-end font-bold">Create or Join Room</b>
            <b className='w-[30%] pe-2 text-end'>
              <span onClick={closeRoomModal} className='cursor-pointer'>X</span>
            </b>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-10 flex flex-col gap-4">
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                className="h-[44px] bg-slate-800 rounded-lg p-3 focus:outline-none focus:border focus:border-orange-500"
                value={roomLogin.username}
                onChange={e => setRoomLogin(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="name">Room Name</label>
              <input
                type="text"
                className="h-[44px] bg-slate-800 rounded-lg p-3 focus:outline-none focus:border focus:border-orange-500"
                value={roomLogin.roomName}
                onChange={e => setRoomLogin(prev => ({ ...prev, roomName: e.target.value }))}
                required
              />
            </div>
            <button
              type='submit'
              className="mt-3 rounded-md bg-orange-500 px-3 py-3 font-bold"
              style={{ backgroundImage: 'linear-gradient(to right, #ff8c00, #ff2f96)' }}
            >
              Go To Room
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default InitRoom