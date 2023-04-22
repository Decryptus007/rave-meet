import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng'
import AgoraRTM from 'agora-rtm-sdk';
import MainScreen from '../components/MainScreen';
import Participants from '../components/Participants';
import LiveChat from '../components/LiveChat';

const APP_ID = 'e66844899a044586a78c44434c81cdc5'
const TOKEN = null

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

// Main Component
function Room() {
  const { channel } = useParams();

  const navigate = useNavigate()

  useEffect(() => {
    // Check if username exists in sessionStorage
    const displayName = sessionStorage.getItem('username');
    if (!displayName) {
      const displayNamePromptResult = prompt('You do not have a display name. \nPlease enter your display name for this session.');
      if (displayNamePromptResult) {
        sessionStorage.setItem('username', displayNamePromptResult);
      } else {
        navigate('/');
      }
    }
  }, []);

  const screenShareRef = useRef()

  const [showCtrl, setShowCtrl] = useState({
    showParticipants: false,
    showLiveChat: false
  })

  useEffect(() => {
    if (showCtrl.showParticipants || showCtrl.showLiveChat) {
      const elem = document.getElementById('video-holder');
      elem.scrollTop = 0;
      elem.style.overflow = 'hidden';
    }
  }, [showCtrl.showParticipants, showCtrl.showLiveChat]);

  const [localTracks, setLocalTracks] = useState({ audio: '', video: '' })

  const [joined, setJoined] = useState(false)
  const [UID, setUID] = useState('')
  const [users, setUsers] = useState([])
  const [screenShare, setScreenShare] = useState({ elementRef: '', mode: false, track: '' })
  const [participants, setParticipants] = useState([])
  const [rtmClient, setRtmClient] = useState(null)
  const [channelRes, setChannelRes] = useState(null)
  const [totalMembers, setTotalMembers] = useState(0)
  const [chats, setChats] = useState([])

  const updateMemberTotal = async (members) => {
    setTotalMembers(members.length)
  }

  const handleMemberJoined = async (MemberId) => {
    const members = await channelRes.getMembers()
    updateMemberTotal(members)

    setParticipants(prev => [...prev, MemberId])
    const { name } = await rtmClient.getUserAttributesByKeys(String(MemberId), ['name'])
    setChats(prev => [...prev, { displayName: '🤖 RaveMeet Bot', message: `👋 Welcome to Room 123, ${name}` }])
  }

  const handleMemberLeft = async (MemberId) => {
    const nameHTML = document.getElementById(`user-${MemberId}`)

    const members = await channelRes.getMembers()
    updateMemberTotal(members)

    setChats(prev => [...prev,
    { displayName: '🤖 RaveMeet Bot', message: `${nameHTML.textContent} left the room 😔.` }
    ])

    setParticipants(prev => prev.filter(id => id !== MemberId))
  }

  const leaveRoom = async () => {
    await channelRes.leave()
    await rtmClient.logout()
  }

  const getMembers = async (channelResIn) => {
    const members = await channelResIn.getMembers()

    updateMemberTotal(members)

    for (let i = 0; i < members.length; i++) {
      const id = members[i]

      setParticipants(prev => [...prev, id])
    }
  }

  const handleChannelMessage = async (messageData, MemberId) => {
    let data = JSON.parse(messageData.text)

    if (data.type === 'chat') {
      setChats(prev => [...prev, { displayName: data.displayName, message: data.message }])
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    if (joined === true) {
      const displayName = sessionStorage.getItem('username')

      let message = e.target.message.value
      channelRes.sendMessage({ text: JSON.stringify({ type: 'chat', 'message': message, displayName: displayName }) })
      setChats(prev => [...prev, { displayName: displayName, message: message }])
    } else {
      alert('You must join the room first')
    }

    e.target.reset()
  }

  const initRTM = async (uid) => {
    try {
      let rtmClientIn = AgoraRTM.createInstance(APP_ID);
      await rtmClientIn.login({ uid: String(uid), token: TOKEN });

      await rtmClientIn.addOrUpdateLocalUserAttributes({ 'name': sessionStorage.getItem('username') })

      let channelResIn = rtmClientIn.createChannel(channel);
      await channelResIn.join();

      await Promise.all([
        setChannelRes(channelResIn),
        setRtmClient(rtmClientIn),
      ])

      const { name } = await rtmClientIn.getUserAttributesByKeys(String(uid), ['name'])
      setChats(prev => [...prev, { displayName: '🤖 RaveMeet Bot', message: `👋 Welcome to Room 123, ${name}` }])
    } catch (err) {
      console.error("Failed to initialize RTM:", err);
    }
  };

  useEffect(() => {
    if (channelRes && rtmClient) {
      channelRes.on('MemberJoined', handleMemberJoined)
      channelRes.on('MemberLeft', handleMemberLeft)
      channelRes.on('ChannelMessage', handleChannelMessage)

      getMembers(channelRes)
    }

  }, [channelRes, rtmClient])

  const joinRoom = async () => {
    client.join(APP_ID, channel, TOKEN, null)
      .then((uid) => {
        setUID(uid)
        return Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid])
      })
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks
        setUsers(prev => ([...prev, { uid, audioTrack, videoTrack }]))
        client.publish(tracks)
        setLocalTracks({ audio: audioTrack, video: videoTrack })

        setJoined(true)

        initRTM(uid)
      })
      .catch((error) => {
        console.log(error)
      })
  }


  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
      setUsers(prev => [...prev, user])
    }
  }

  const handleUserLeft = (user) => {
    setUsers(prev => prev.filter(u => u.uid !== user.uid))
  }

  const handleScreenShare = async () => {
    const screenShareBtn = document.getElementById('screen-share')
    const camera = document.getElementById('camera')

    if (!screenShare.mode) {
      setScreenShare(prev => ({ ...prev, mode: true }))

      screenShareBtn.classList.add('bg-orange-800')
      camera.classList.add('hidden')

      const screenShareTrack = await AgoraRTC.createScreenVideoTrack()

      // Unpublish video track
      await client.unpublish(localTracks.video)

      setUsers(prev => prev.map(user => {
        if (user.uid === UID) {
          return {
            ...user,
            videoTrack: undefined, // unset videoTrack when sharing screen
            screenShareTrack: screenShareTrack, // set screenShareTrack
          }
        }
        return user
      }))

      // Publish screen share track
      await client.publish(screenShareTrack)

      // Play the screen share track
      screenShareTrack.play(screenShareRef.current)

      // Make the screenShare div visible
      screenShareRef.current.classList.remove('hidden')
    } else {
      setScreenShare(prev => ({ ...prev, mode: false }))

      screenShareBtn.classList.remove('bg-orange-800')
      camera.classList.remove('hidden')

      setUsers(prev => prev.map(user => {
        if (user.uid === UID) {
          return {
            ...user,
            videoTrack: localTracks.video, // set videoTrack when not sharing screen
            screenShareTrack: undefined, // unset screenShareTrack
          }
        }
        return user
      }))

      // Unpublish screen share track
      users.forEach(user => {
        if (user.screenShareTrack) {
          client.unpublish(user.screenShareTrack)
          user.screenShareTrack.stop()
        }
      })

      // Publish video track
      await client.publish(localTracks.video)

      // Make the screenShare div hidden
      screenShareRef.current.classList.add('hidden')
    }
  }

  useEffect(() => {
    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)

    window.addEventListener('beforeunload', leaveRoom)

    return () => {
      client.off('user-published', handleUserPublished)
      client.off('user-left', handleUserLeft)

      window.removeEventListener('beforeunload', leaveRoom)
    }
  }, [])


  return (
    <div className='h-screen overflow-y-auto'>
      <nav className='relative bg-slate-900 border-b border-slate-950 flex items-center justify-between h-[10vh] px-4 lg:px-8'>
        <b className="text-2xl cursor-pointer">RM ID - {channel}</b>
        <button
          className="rounded-md bg-red-500 px-3 py-1.5 font-bold"
          onClick={async () => {
            joined && await leaveRoom()
            navigate('/')
            location.reload()
          }}
        >
          Exit Room
        </button>

        {/* Absolutes */}
        <div
          className="absolute top-[102%] z-20 left-0 flex items-center justify-center cursor-pointer h-12 w-12 rounded-sm bg-orange-500 lg:hidden"
          onClick={() => setShowCtrl(prev => ({ ...prev, showParticipants: !showCtrl.showParticipants }))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <small className="w-4 h-4 rounded-md flex items-center justify-center bg-slate-900">0</small>
        </div>

        <div
          className="absolute top-[102%] z-20 right-0 flex items-center justify-center cursor-pointer h-12 w-12 rounded-sm bg-orange-500 lg:hidden"
          onClick={() => setShowCtrl(prev => ({ ...prev, showLiveChat: !showCtrl.showLiveChat }))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        </div>
      </nav>
      <section className='h-[90vh] flex justify-between overflow-hidden'>
        {/* Participants */}
        <Participants
          showCtrl={showCtrl}
          setShowCtrl={setShowCtrl}
          rtmClient={rtmClient}
          totalMembers={totalMembers}
          participants={participants}
        />

        {/* Main Screen */}
        <MainScreen
          joined={joined}
          setJoined={setJoined}
          joinRoom={joinRoom}
          localTracks={localTracks}
          setLocalTracks={setLocalTracks}
          users={users}
          UID={UID}
          screenShareRef={screenShareRef}
          handleScreenShare={() => handleScreenShare(screenShareRef)}
        />

        {/* Live Chat */}
        <LiveChat showCtrl={showCtrl} sendMessage={sendMessage} chats={chats} />
      </section>

      {
        (showCtrl.showLiveChat || showCtrl.showParticipants) &&
        <div
          className='fixed z-[22] h-[90vh] w-full top-[10vh] left-0 bg-slate-400/50'
          onClick={() => setShowCtrl(prev => ({ ...prev, showLiveChat: false, showParticipants: false }))}
        >
        </div>
      }
    </div>
  )
}

export default Room