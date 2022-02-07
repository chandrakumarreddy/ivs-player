// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import playerStyles from "~/styles/player.css";
import Placeholder, {
  links as placeholderLinks,
} from "~/base/Placeholder/Placeholder";
import { isElementInViewport } from "~/utils/isElementInViewport";
import { CONTROLS, POSITION } from "~/base/Player/config";
import PlayerControls from "~/base/Player/MiniPlayerControls";

export const links = () => {
  return [
    ...placeholderLinks(),
    { rel: "stylesheet", href: playerStyles },
    {
      rel: "preload",
      href: "https://player.live-video.net/1.1.2/amazon-ivs-player.min.js",
      as: "script",
    },
  ];
};

export const handle = {
  scripts: () => (
    <script src="https://player.live-video.net/1.1.2/amazon-ivs-player.min.js" />
  ),
};

const height = 154;
const width = 274;
const CORNER_SPACE = 32;
const DEFAULT_POSITION = "auto";
const TRANSITION = "200ms ease-in-out";
const position = POSITION.bottomRight;

export default function Player() {
  const [loading, setLoading] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({});
  const [playerSize, setPlayerSize] = useState({});
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const player = useRef(null);
  const playerBaseEl = useRef(null);
  const videoPlayer = useRef(null);
  const playerOverlay = useRef(null);
  const playerControls = useRef(null);
  const btnPlay = useRef(null);
  const btnMute = useRef(null);
  const btnSettings = useRef(null);
  const settingsMenu = useRef(null);
  const seekBar = useRef(null);
  const seekSlide = useRef(null);
  const visibleRef = useRef(null);
  const playbackUrl =
    "https://3d26876b73d7.us-west-2.playback.live-video.net/api/video/v1/us-west-2.913157848533.channel.xJ2tVekwmMGd.m3u8";
  useEffect(() => {
    const IVSPlayer = window.IVSPlayer;
    const { ENDED, PLAYING, READY, BUFFERING, IDLE } = IVSPlayer.PlayerState;
    const PlayerEventType = IVSPlayer.PlayerEventType;

    // Initialize player
    player.current = IVSPlayer.create();
    player.current.attachHTMLVideoElement(videoPlayer.current);

    // Setup stream and play
    player.current.setAutoplay(false);
    player.current.load(playbackUrl);
    player.current.setMuted(true);
    // Setvolume
    player.current.setVolume(1);
    player.current.setMuted(true);

    // seek bar
    seekBar.current.addEventListener(
      "change",
      function () {
        const n = seekBar.current.value;
        const seekTo = videoPlayer.current.duration * (n / 100);
        videoPlayer.current.currentTime = seekTo;
        player.current.seekTo(seekTo);
      },
      false
    );

    videoPlayer.current.addEventListener(
      "timeupdate",
      function () {
        const n = Math.ceil(this.currentTime * (100 / this.duration));
        // seek.current.value = n;
        seekSlide.current.style.width = `${n}%`;
      },
      false
    );

    const onStateChange = () => {
      const playerState = player.current.getState();
      console.log(playerState);
      setLoading(playerState !== PLAYING);
    };

    // Attach event listeners
    // player.addEventListener(READY, onStateChange);
    player.current.addEventListener(PLAYING, onStateChange);
    player.current.addEventListener(BUFFERING, onStateChange);
    player.current.addEventListener(IDLE, () => {
      console.log(player.current.getState());
    });
    // player.addEventListener(ENDED, onStateChange);

    player.current.addEventListener(
      PlayerEventType.TEXT_METADATA_CUE,
      function (cue) {
        const metadataText = cue.text;
        const position = player.current.getPosition().toFixed(2);
        console.log(
          `Player Event - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`
        );
      }
    );

    if (playerOverlay.current) {
      window.addEventListener("click", function (e) {
        if (playerOverlay.current?.contains(e.target)) {
        } else {
          closeSettingsMenu();
        }
      });

      // Show/Hide player controls
      playerOverlay.current.addEventListener(
        "mouseover",
        function (e) {
          playerOverlay.current.classList.add("player--hover");
        },
        false
      );
      playerOverlay.current.addEventListener("mouseout", function (e) {
        playerOverlay.current.classList.remove("player--hover");
      });
    }
    btnPlay.current.addEventListener("click", togglePlayPause, false);

    function togglePlayPause(e) {
      e.stopPropagation();
      if (btnPlay.current.classList.contains("btn--play")) {
        // change to pause
        btnPlay.current.classList.remove("btn--play");
        btnPlay.current.classList.add("btn--pause");
        if (player.current) {
          player.current.pause();
        }
      } else {
        // change to play
        btnPlay.current.classList.remove("btn--pause");
        btnPlay.current.classList.add("btn--play");
        player.current.play();
      }
    }

    btnMute.current.addEventListener(
      "click",
      function (e) {
        e.stopPropagation();
        if (btnMute.current.classList.contains("btn--mute")) {
          btnMute.current.classList.remove("btn--mute");
          btnMute.current.classList.add("btn--unmute");
          player.current.setMuted(1);
        } else {
          btnMute.current.classList.remove("btn--unmute");
          btnMute.current.classList.add("btn--mute");
          player.current.setMuted(0);
        }
      },
      false
    );

    // Create Quality Options
    const createQualityOptions = function (obj, i) {
      let q = document.createElement("a");
      let qText = document.createTextNode(obj.name);
      settingsMenu.current.appendChild(q);
      q.classList.add("settings-menu-item");
      q.appendChild(qText);

      q.addEventListener("click", (event) => {
        player.current.setQuality(obj);
        return false;
      });
    };

    // Close Settings menu
    const closeSettingsMenu = function () {
      btnSettings.current.classList?.remove?.("btn--settings-on");
      btnSettings.current.classList.add("btn--settings-off");
      settingsMenu.current.classList.remove("open");
    };

    // Settings
    btnSettings.current.addEventListener(
      "click",
      function (e) {
        let qualities = player.current.getQualities();
        const currentQuality = player.current.getQuality();

        // Empty Settings menu
        while (settingsMenu.current.firstChild)
          settingsMenu.current.removeChild(settingsMenu.current.firstChild);

        if (btnSettings.current.classList.contains("btn--settings-off")) {
          for (var i = 0; i < qualities.length; i++) {
            createQualityOptions(qualities[i], i);
          }
          btnSettings.current.classList.remove("btn--settings-off");
          btnSettings.current.classList.add("btn--settings-on");
          settingsMenu.current.classList.add("open");
        } else {
          closeSettingsMenu();
        }
      },
      false
    );
    function toggle(e) {
      togglePlayPause(e);
    }
    playerBaseEl.current.addEventListener("click", toggle);
    return () => {
      return () => {
        player.current.removeEventListener(READY, onStateChange);
        player.current.removeEventListener(PLAYING, onStateChange);
        player.current.removeEventListener(ENDED, onStateChange);
      };
    };
  }, []);
  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = isElementInViewport(playerBaseEl.current);
      if (visible === visibleRef.current) return;

      visibleRef.current = visible;

      if (visible && player.current.isPaused()) {
        player.current.play();
      }

      if (!visible) {
        const playerRect = playerBaseEl.current.getBoundingClientRect();
        setPlayerSize({
          height: `${playerRect.height}px`,
          width: `${playerRect.width - CORNER_SPACE}px`,
        });
      }

      setTimeout(() => {
        setIsMiniPlayer(!visible);
      }, 100);
    };
    onVisibilityChange();
    updatePlayer(visibleRef.current);
    window.addEventListener("scroll", onVisibilityChange);
    return () => {
      window.removeEventListener("scroll", onVisibilityChange);
    };
  }, []);
  const updatePlayer = useCallback(
    (isMini) => {
      let top = DEFAULT_POSITION;
      let right = DEFAULT_POSITION;
      let bottom = DEFAULT_POSITION;
      let left = DEFAULT_POSITION;

      let targetPosition = 0;
      let targetHeight = "100%";
      let targetWidth = "100%";

      if (isMini) {
        targetPosition = `${CORNER_SPACE}px`;
        targetHeight = `${height}px`;
        targetWidth = `${width}px`;
      }

      switch (position) {
        case POSITION.topLeft:
          top = targetPosition;
          left = targetPosition;

          break;
        case POSITION.topRight:
          top = targetPosition;
          right = targetPosition;

          break;
        case POSITION.bottomLeft:
          bottom = targetPosition;
          left = targetPosition;

          break;
        default:
          bottom = targetPosition;
          right = targetPosition;
      }

      setPlayerSize({
        height: targetHeight,
        width: targetWidth,
      });
      setPlayerPosition({
        top,
        right,
        bottom,
        left,
      });
    },
    [height, width, position]
  );
  useEffect(() => {
    updatePlayer(isMiniPlayer);
  }, [isMiniPlayer, updatePlayer]);
  const { top, right, bottom, left } = playerPosition;
  const miniPlayerStyles = {
    top,
    right,
    bottom,
    left,
    position: "fixed",
    width: `${playerSize.width}`,
    height: `${playerSize.height}`,
    transition: isMiniPlayer
      ? `height ${TRANSITION}, width ${TRANSITION}`
      : "none",
  };
  return (
    <>
      <div
        className={`player-wrapper${isMiniPlayer ? " mini" : ""}`}
        ref={playerBaseEl}
      >
        <Placeholder loading={loading} />
        <div className="aspect-spacer"></div>
        <div
          className="pos-absolute full-width full-height top-0"
          style={miniPlayerStyles}
        >
          {isMiniPlayer ? (
            <PlayerControls
              muted={true}
              // onClose={close}
              // onResize={resize}
              // onMute={toggleMute}
            />
          ) : null}

          <div
            ref={playerOverlay}
            id="overlay"
            className={isMiniPlayer ? "display-none" : ""}
          >
            <div ref={playerControls} id="player-controls">
              <div className="player-controls__inner">
                <div className="seekbar">
                  <input
                    type="range"
                    id="seek"
                    defaultValue="0"
                    min="0"
                    max="100"
                    ref={seekBar}
                  />
                  <div className="seek-value" ref={seekSlide} />
                </div>
                <button
                  id="play"
                  ref={btnPlay}
                  className="btn btn--icon btn--play"
                >
                  <svg
                    className="icon icon--play"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                  </svg>
                  <svg
                    className="icon icon--pause"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z" />
                  </svg>
                </button>
                <button
                  id="mute"
                  ref={btnMute}
                  className="btn btn--icon btn--mute"
                >
                  <svg
                    className="icon icon--volume_up"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z" />
                  </svg>
                  <svg
                    className="icon icon--volume_off"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M3.63 3.63c-.39.39-.39 1.02 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
                  </svg>
                </button>
                <button className="btn btn--live">Live</button>
                <button className="btn btn--backward">
                  <svg
                    id="SvgjsSvg1001"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                  >
                    <defs id="SvgjsDefs1002"></defs>
                    <g id="SvgjsG1008" transform="matrix(1,0,0,1,0,0)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                      >
                        <path
                          d="M4,18A12,12,0,1,0,16,6H12V1L6,7l6,6V8h4A10,10,0,1,1,6,18Z"
                          fill="#ffffff"
                          className="color000 svgShape"
                        ></path>
                        <path
                          d="M19.63 22.13a2.84 2.84 0 01-1.28-.27 2.44 2.44 0 01-.89-.77 3.57 3.57 0 01-.52-1.25 7.69 7.69 0 01-.17-1.68 7.83 7.83 0 01.17-1.68 3.65 3.65 0 01.52-1.25 2.44 2.44 0 01.89-.77 2.84 2.84 0 011.28-.27 2.44 2.44 0 012.16 1 5.23 5.23 0 01.7 2.93 5.23 5.23 0 01-.7 2.93A2.44 2.44 0 0119.63 22.13zm0-1.22a1.07 1.07 0 001-.55A3.38 3.38 0 0021 18.85V17.47a3.31 3.31 0 00-.29-1.5 1.23 1.23 0 00-2.06 0 3.31 3.31 0 00-.29 1.5v1.38a3.38 3.38 0 00.29 1.51A1.06 1.06 0 0019.63 20.91zM10.63 22V20.82h2V15.63l-1.86 1-.55-1.06 2.32-1.3H14v6.5h1.78V22z"
                          fill="#ffffff"
                          className="color000 svgShape"
                        ></path>
                        <rect
                          width="32"
                          height="32"
                          fill="none"
                          data-name="&amp;lt;Transparent Rectangle&amp;gt;"
                        ></rect>
                      </svg>
                    </g>
                  </svg>
                </button>
                <button className="btn btn--forward">
                  <svg
                    id="SvgjsSvg1020"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                  >
                    <defs id="SvgjsDefs1021"></defs>
                    <g id="SvgjsG1022">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                      >
                        <path
                          d="M26,18A10,10,0,1,1,16,8h4v5l6-6L20,1V6H16A12,12,0,1,0,28,18Z"
                          fill="#ffffff"
                          className="color000 svgShape"
                        ></path>
                        <path
                          d="M19.63 22.13a2.84 2.84 0 01-1.28-.27 2.44 2.44 0 01-.89-.77 3.57 3.57 0 01-.52-1.25 7.69 7.69 0 01-.17-1.68 7.83 7.83 0 01.17-1.68 3.65 3.65 0 01.52-1.25 2.44 2.44 0 01.89-.77 2.84 2.84 0 011.28-.27 2.44 2.44 0 012.16 1 5.23 5.23 0 01.7 2.93 5.23 5.23 0 01-.7 2.93A2.44 2.44 0 0119.63 22.13zm0-1.22a1.07 1.07 0 001-.55A3.38 3.38 0 0021 18.85V17.47a3.31 3.31 0 00-.29-1.5 1.23 1.23 0 00-2.06 0 3.31 3.31 0 00-.29 1.5v1.38a3.38 3.38 0 00.29 1.51A1.06 1.06 0 0019.63 20.91zM10.63 22V20.82h2V15.63l-1.86 1-.55-1.06 2.32-1.3H14v6.5h1.78V22z"
                          fill="#ffffff"
                          className="color000 svgShape"
                        ></path>
                        <rect
                          width="32"
                          height="32"
                          fill="none"
                          data-name="&amp;lt;Transparent Rectangle&amp;gt;"
                        ></rect>
                      </svg>
                    </g>
                  </svg>
                </button>
                <button
                  ref={btnSettings}
                  id="settings"
                  className="btn btn--icon btn--settings-off"
                >
                  <svg
                    className="icon icon--settings"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m0 0h24v24h-24z" fill="none" />
                    <path d="m19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65c-.03-.24-.24-.42-.49-.42h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64zm-7.43 2.52c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                </button>
              </div>
            </div>
            <div ref={settingsMenu} id="settings-menu"></div>
          </div>

          <video
            ref={videoPlayer}
            playsInline
            width="100%"
            height="100%"
            id="video-player"
            poster="https://stage1.loco.gg/_next/image?url=https://static.easyvideo.in/default_thumb/e7d6082e-eece-4a33-9655-3685aa34f8dd.jpg&w=640&q=25"
          ></video>
        </div>
      </div>
      <div className="box" />
      <div className="box" />
      <div className="box" />
    </>
  );
}
