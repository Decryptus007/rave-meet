import React from 'react'

function Home() {
  return (
    <div className="py-8 flex items-center justify-between min-h-[80vh]">
      <div className="w-full lg:w-1/2">
        <h1
          className="text-4xl text-center leading-[3rem] font-bold lg:leading-[6rem] lg:text-6xl"
          style={{ textShadow: '2px 2px 4px rgba(255,44,98,0.5), 0px 2px 4px rgba(255,140,0,0.5)' }}
        >
          Interactive Chat & Streaming
        </h1>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <img src="https://www.payetteforward.com/wp-content/uploads/2019/05/what-is-video-calling.jpg" alt="" className="rounded-full" />
      </div>
    </div>
  )
}

export default Home