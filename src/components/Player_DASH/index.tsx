import dashjs from "dashjs";
import { useRef, useState, useEffect } from "react";
import { BsFillPlayFill, BsFillPauseFill, BsGearFill } from "react-icons/bs";
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

import formatterSecondsToTime from "../../utils/secondsToTime";

import "./styles.css";

type MenuType = "legenda" | "audio" | "qualidade" | "velocidade" | "default";

export default function PlayerDASH(props: { url: string }) {
  const { url } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dashRef = useRef<dashjs.MediaPlayerClass>();
  const duracaoRef = useRef<HTMLInputElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState<MenuType>("default");
  const [listaQualidades, setListaQualidades] = useState<any[]>([]);
  const [qualidadeAtual, setQualidadeAtual] = useState(-1);
  const [listaLegendas, setListaLegendas] = useState<any[]>([]);
  const [legendaAtual, setLegendaAtual] = useState<number>();
  const [listaAudios, setListaAudios] = useState<any[]>([]);
  const [audioAtual, setAudioAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [velocidade, setVelocidade] = useState(1);
  const [telacheia, setTelacheia] = useState(false);

  useEffect(() => {
    if (containerRef.current && videoRef.current) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, url, true);
      dashRef.current = player;
      player.on("error", (e: any) => {
        console.log("Erro no player", e);
      });
      player.on("playbackMetaDataLoaded", () => {
        const qualidades = player.getBitrateInfoListFor("video");
        setListaQualidades(qualidades);
        const legendas = player.getTracksFor("text");
        setListaLegendas(legendas);
        const audios = player.getTracksFor("audio");
        setListaAudios(audios);
        setQualidadeAtual(player.getQualityFor("video"));
        setDuracao(player.duration());
        setTempoAtual(player.time());
        setVolume(player.getVolume());
        setMuted(player.isMuted());
        setPlaying(!player.isPaused());
        setVelocidade(player.getPlaybackRate());
      });
      player.on("playbackTimeUpdated", () => {
        setTempoAtual(player.time());
      });
    }}, [url]);

  console.log("listaQualidades", listaQualidades);
  console.log("listaLegendas", listaLegendas);
  console.log("listaAudios", listaAudios);

  const mudarLegenda = (index: number) => {
    dashRef.current?.setTextTrack(index);
    setLegendaAtual(index);
  }

  const mudarAudio = (index: number) => {
    dashRef.current?.setCurrentTrack(listaAudios[index]);
    setAudioAtual(index);
  }

  const mudarQualidade = (index: number) => {
    dashRef.current?.setQualityFor("video", index, true);
    setQualidadeAtual(index);
  }

  const mudarVelocidade = (velocidade: number) => {
    dashRef.current?.setPlaybackRate(velocidade);
    setVelocidade(velocidade);
  }

  const mudarPlaying = () => {
    dashRef.current?.isPaused() ? dashRef.current?.play() : dashRef.current?.pause();
  }

  const mudarVolume = (volume: number) => {
    dashRef.current?.setVolume(volume);
    setVolume(volume);
  }

  const mudarTempoAtual = (tempo: number) => {
    dashRef.current?.seek(tempo);
    setTempoAtual(tempo);
  }

  const mudarTelacheia = () => {
    if (telacheia) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
    setTelacheia(!telacheia);
  }

  const returnMenu = () => {
    switch (menu) {
      case "legenda":
        return (
          <>
            <button onClick={() => setMenu("default")}>Voltar</button>
            <span>Legendas:</span>
            {listaLegendas.map((legenda: any, index: number) => (
              <button
                key={index}
                onClick={() => mudarLegenda(index)}
                style={legendaAtual == index ? { background: "blue" } : {}}
              >
                {legenda.lang}
              </button>
            ))}
            <button
              onClick={() => mudarLegenda(-1)}
              style={legendaAtual == -1 ? { background: "blue" } : {}}
            >
              Desativar Legendas
            </button>
          </>
        );
      case "audio":
        return (
          <>
            <button onClick={() => setMenu("default")}>Voltar</button>
            <span>Áudios:</span>
            {listaAudios.map((audio: any, index: number) => (
              <button
                key={index}
                onClick={() => mudarAudio(index)}
                style={audioAtual == index ? { background: "blue" } : {}}
              >
                {audio.lang}
              </button>
            ))}
          </>
        );
      case "qualidade":
        return (
          <>
            <button onClick={() => setMenu("default")}>Voltar</button>
            <span>Qualidades:</span>
            <button
              key={-1}
              onClick={() => mudarQualidade(-1)}
              style={qualidadeAtual == -1 ? { background: "blue" } : {}}
            >
              Auto
            </button>
            {listaQualidades.map((qualidade: any, index: number) => (
              <button
                key={index}
                onClick={() => mudarQualidade(index)}
                style={qualidadeAtual == index ? { background: "blue" } : {}}
              >
                {qualidade.height}p
              </button>
            ))}
          </>
        );
      case "velocidade":
        return (
          <>
            <button onClick={() => setMenu("default")}>Voltar</button>
            <span>Velocidades:</span>
            <button
              onClick={() => mudarVelocidade(0.5)}
              style={velocidade == 0.5 ? { background: "blue" } : {}}
            >
              0.5x
            </button>
            <button
              onClick={() => mudarVelocidade(1)}
              style={velocidade == 1 ? { background: "blue" } : {}}
            >
              1x
            </button>
            <button
              onClick={() => mudarVelocidade(1.5)}
              style={velocidade == 1.5 ? { background: "blue" } : {}}
            >
              1.5x
            </button>
            <button
              onClick={() => mudarVelocidade(2)}
              style={velocidade == 2 ? { background: "blue" } : {}}
            >
              2x
            </button>
          </>
        );
      case "default":
        return (
          <>
            <span>Menu:</span>
            <button onClick={() => setMenu("legenda")}>Legenda</button>
            <button onClick={() => setMenu("audio")}>Áudio</button>
            <button onClick={() => setMenu("qualidade")}>Qualidade</button>
            <button onClick={() => setMenu("velocidade")}>Velocidade</button>
          </>
        );
      default:
        return <></>;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
      ref={containerRef}
    >
      <video
        id="video"
        style={{
          width: "100%",
        }}
        controls={false}
        ref={videoRef}
        autoPlay={true}
        muted={muted}
        onProgress={(progress: any) => {
          console.log("progress", progress);
          if (duracaoRef.current) {
            duracaoRef.current.value = progress.target.currentTime;
          }
          setTempoAtual(progress.target.currentTime);
        }}
      />
      <div id="controles-container">
        <div className="controles-linha">
          <div className="flex-centralizada">
            <span
              style={{
                color: "#fff",
                fontSize: "12px",
                padding: "0 5px",
              }}
            >
              {formatterSecondsToTime(tempoAtual, duracao)}
            </span>
            <input
              type="range"
              min={0}
              max={duracao}
              ref={duracaoRef}
              style={{
                background: `linear-gradient(to right, #f50 ${(
                  (tempoAtual / duracao) *
                  100
                ).toFixed(2)}%, #ccc ${(tempoAtual / duracao) * 100}%)`,
                transition: "background-color 0.3s ease",
              }}
              onChange={(e) => {
                mudarTempoAtual(parseInt(e.target.value));
              }}
            />
            <span
              style={{
                color: "#fff",
                fontSize: "12px",
                padding: "0 5px",
              }}
            >
              {formatterSecondsToTime(duracao, duracao)}
            </span>
          </div>
        </div>
        <div className="controles-linha">
          <div className="flex-centralizada">
            <div className="controle">
              {playing ? (
                <BsFillPauseFill
                  color="#fff"
                  size={26}
                  onClick={() => mudarPlaying()}
                />
              ) : (
                <BsFillPlayFill
                  color="#fff"
                  size={26}
                  onClick={() => mudarPlaying()}
                />
              )}
            </div>
            <div className="controle">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "140px",
                }}
              >
                {
                  muted ? (
                    <HiVolumeOff
                      color="#fff"
                      size={28}
                      onClick={() => setMuted(false)}
                    />
                  ) : (
                    <HiVolumeUp
                      color="#fff"
                      size={28}
                      onClick={() => setMuted(true)}
                    />
                  ) // <BsFillVolumeUpFill
                }
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume * 100}
                  style={{
                    background: `linear-gradient(to right, #f50 ${(
                      volume * 100
                    ).toFixed(2)}%, #ccc ${volume * 100}%)`,
                    transition: "background-color 0.3s ease",
                  }}
                  onChange={(e) => {
                    mudarVolume(Number(e.target.value) / 100);
                  }}
                />
              </div>
            </div>
          </div>
          <div
            className="flex-centralizada"
            style={{
              justifyContent: "flex-end",
            }}
          >
            <div className="controle">
              <BsGearFill
                color="#fff"
                size={16}
                onClick={() => setShowMenu(!showMenu)}
              />
              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "30px",
                    right: "40px",
                    background: "#000000d7",
                    padding: "10px",
                    borderRadius: "5px",
                    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    {returnMenu()}
                  </div>
                </div>
              )}
            </div>
            <div className="controle">
              {!telacheia ? (
                <BiFullscreen
                  color="#fff"
                  size={22}
                  onClick={() => mudarTelacheia()}
                />
              ) : (
                <BiExitFullscreen
                  color="#fff"
                  size={22}
                  onClick={() => mudarTelacheia()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}