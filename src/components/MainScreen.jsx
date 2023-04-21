import React, { memo } from 'react'
import VideoPlayer from './VideoPlayer'

const MainScreen = memo(({
  joined,
  setJoined,
  joinRoom,
  localTracks,
  handleScreenShare,
  users,
  UID,
  screenShareRef
}) => {

  return (
    <div id='video-holder' className="relative h-[90vh] overflow-y-auto w-full flex flex-wrap justify-center p-2 gap-4 lg:p-4 lg:w-[55vw] bg-slate-900">
      {/* Share Screen */}
      <div
        ref={screenShareRef}
        id='share-screen'
        className={`hidden sticky z-10 top-0 left-0 w-full h-[40vh] bg-slate-800`}
      >
      </div>

      {/* People */}
      {users.map(user => (
        <VideoPlayer key={user.uid} user={user} UID={UID} />
      ))}

      {/* Join Stream */}
      <div className="w-full fixed bg-slate-300/10 py-2 z-10 bottom-[10vh] flex justify-center">
        {
          joined === true ?
            <div className="flex items-center justify-center gap-4">
              <div
                id='camera'
                className={`p-2 rounded-md cursor-pointer bg-orange-800`}
                onClick={async () => {
                  const camera = document.getElementById('camera')

                  if (localTracks.video.muted) {
                    await localTracks.video.setMuted(false)
                    camera.classList.add('bg-orange-800')
                  } else {
                    await localTracks.video.setMuted(true)
                    camera.classList.remove('bg-orange-800')
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div
                id='mic'
                className="p-2 rounded-md cursor-pointer bg-orange-800"
                onClick={async () => {
                  const mic = document.getElementById('mic')

                  if (localTracks.audio.muted) {
                    await localTracks.audio.setMuted(false)
                    mic.classList.add('bg-orange-800')
                  } else {
                    await localTracks.audio.setMuted(true)
                    mic.classList.remove('bg-orange-800')
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div
                id='screen-share'
                className={`p-2 rounded-md cursor-pointer`}
                onClick={handleScreenShare}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              </div>

            </div>
            :
            <button
              className=" rounded-md bg-orange-500 px-3 py-3 font-bold"
              style={{ backgroundImage: 'linear-gradient(to right, #ff8c00, #ff2f96)' }}
              onClick={() => {
                setJoined('load')
                joinRoom()
              }}
            >
              {joined === 'load' ? 'Requesting...' : 'Join Stream'}
            </button>
        }
      </div>
    </div>
  )
})

export default MainScreen