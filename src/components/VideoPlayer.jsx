import React, { memo, useEffect, useRef } from 'react'

const VideoPlayer = memo(({ user, UID }) => {
  const videoHolder = document.getElementById("video-holder");
  const shareScreen = document.getElementById("share-screen");

  const ref = useRef();

  const enLargeFrame = (event) => {
    if (
      event.target.parentNode.parentNode.parentNode.id !== shareScreen.id
    ) {
      let child = shareScreen.children[0];
      if (child) {
        videoHolder.appendChild(child);
      }

      shareScreen.appendChild(event.currentTarget);
      shareScreen.classList.remove("hidden");
    } else {
      videoHolder.appendChild(
        document.getElementById("share-screen").children[0]
      );
      shareScreen.classList.add("hidden");
    }
  };

  useEffect(() => {
    if (user.videoTrack && user.audioTrack) {
      user.videoTrack.play(ref.current);
      if (user.uid !== UID) {
        user.audioTrack.play();
      }
    }
    else if (user.screenShareTrack) {
      user.screenShareTrack.play(ref.current);
      if (user.uid !== UID) {
        user.audioTrack.play();
      }
    }
  }, []);


  if (!user.videoTrack && !user.screenShareTrack) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={user.uid}
      onClick={enLargeFrame}
      className="w-[300px] h-[300px] overflow-hidden cursor-pointer rounded-md border border-orange-500 md:w-[170px] md:h-[170px] xl:w-[250px] xl:h-[250px] bg-gradient-to-br from-orange-500 to-red-500"
    ></div>
  );
});

export default VideoPlayer