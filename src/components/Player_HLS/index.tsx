import Hls from "hls.js";
import { useRef, useState, useEffect } from "react";
import { BsFillPlayFill, BsFillPauseFill, BsGearFill } from "react-icons/bs";
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

import formatterSecondsToTime from "../../utils/secondsToTime";

import "./styles.css";

type MenuType = "legenda" | "audio" | "qualidade" | "velocidade" | "default";

export default function PlayerHLS(props: { url: string }) {
  const { url } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
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
    setMenu("default");
  }, [showMenu]);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls({
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        setListaQualidades(data.levels);
        setQualidadeAtual(-1);
        if (videoRef.current) {
          videoRef.current.play();
        }
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.log("fatal network error encountered, try to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("fatal media error encountered, try to recover");
              hls.recoverMediaError();
              break;
            default:
              // cannot recover
              hls.destroy();
              break;
          }
        }
      });

      return () => hls.destroy();
    }
  }, [url]);

  const carregarDados = () => {
    if (videoRef.current) {
      const legendasMap = [];
      for (let i = 0; i < (videoRef.current.textTracks.length || 0); i++) {
        legendasMap.push({
          id: i,
          label: videoRef.current?.textTracks[i].label,
        });
      }
      setListaLegendas(legendasMap);
      desativarLegendas();
      setDuracao(videoRef.current.duration);
    }

    if (hlsRef.current) {
      const audiosMap = [];
      for (let i = 0; i < (hlsRef.current.audioTracks.length || 0); i++) {
        audiosMap.push({
          id: i,
          name: hlsRef.current.audioTracks[i].name,
        });
      }
      setListaAudios(audiosMap);
      hlsRef.current.audioTrack = audioAtual;
    }
  };

  useEffect(() => {
    console.log("listaQualidades", listaQualidades);
    console.log("listaLegendas", listaLegendas);
    console.log("listaAudios", listaAudios);
  }, [listaQualidades, listaLegendas, listaAudios]);

  const desativarLegendas = () => {
    listaLegendas.forEach((legenda) => {
      if (videoRef.current) {
        videoRef.current.textTracks[legenda.id].mode = "hidden";
      }
    });
  };
  const mudarLegenda = (id: number) => {
    desativarLegendas();
    if (videoRef.current) {
      videoRef.current.textTracks[id].mode = "showing";
      setLegendaAtual(id);
    }
  };

  const mudarAudio = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = id;
      setAudioAtual(id);
    }
  };

  const mudarQualidade = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = id;
      setQualidadeAtual(id);
    }
  };

  const mudarVelocidade = (velocidade: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = velocidade;
      setVelocidade(velocidade);
    }
  };

  const mudarTempoAtual = (tempo: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = tempo;
      setTempoAtual(tempo);
    }
  };

  const mudarPlaying = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    }
  };

  const mudarVolume = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setVolume(volume);
    }
  };

  const mudarTelacheia = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setTelacheia(false);
      } else {
        containerRef.current.requestFullscreen();
        setTelacheia(true);
      }
    }
  };

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
                {legenda.label}
              </button>
            ))}
            <button
              onClick={() => desativarLegendas()}
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
                {audio.name}
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
        onLoadedMetadata={() => {
          carregarDados();
        }}
        onProgress={(progress: any) => {
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
  );
}
