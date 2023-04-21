import React, { memo } from 'react';

const Participants = memo(({ showCtrl, setShowCtrl, rtmClient, totalMembers, participants }) => {
  const getName = async (participantId) => {

    let nameOfUser = '';
    try {
      setTimeout(async () => {
        const updateNameHTML = document.getElementById(`user-${participantId}`)

        const usernamePromise = rtmClient.getUserAttributesByKeys(participantId, ['name']);
        const username = await usernamePromise;
        const { name } = username;
        nameOfUser = name

        // return name;
        updateNameHTML.textContent = nameOfUser
      }, 100);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={`h-full border-r border-r-slate-500 overflow-hidden transition-[width] fixed left-0 ${showCtrl.showParticipants ? 'w-[90vw] md:w-[40vw] top-[10vh]' : 'w-0'} z-30 bg-slate-800 lg:relative lg:w-[20vw]`}>
      <div className="relative bg-orange-500/50 h-[10vh] font-bold flex items-center justify-center gap-4">
        <span className='text-xl'>Participants</span>
        <div className="bg-slate-950 text-white w-8 h-8 flex justify-center items-center rounded-md">{totalMembers}</div>

        <button
          className="font-bold text-2xl absolute top-[3vh] left-2 lg:hidden"
          onClick={() => setShowCtrl(prev => ({ ...prev, showParticipants: !showCtrl.showParticipants }))}
        >
          X
        </button>
      </div>
      {/* Members */}
      <div className='mt-4 px-4 flex flex-col gap-3'>
        {participants.map(participantId => {
          getName(participantId)

          return (
            <div key={participantId} className='flex items-center gap-2'>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span id={`user-${participantId}`} className="truncate">
                {participantId}
              </span>
            </div>
          )
        })}
      </div>
    </div >
  );
});

export default Participants;