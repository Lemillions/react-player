import PlayerDASH from "../Player_DASH";
import PlayerHLS from "../Player_HLS";

type VideoType = "hls" | "dash";

export default function VideoPlayer(props: {
  url: string;
  type: VideoType
}) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
    }}>
      {props.type === "hls" && <PlayerHLS url={props.url} />}
      {props.type === "dash" && <PlayerDASH url={props.url} />}
    </div>
  )
}
