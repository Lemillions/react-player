import './App.css'
import VideoPlayer from './components/Player'

function App() {

  return (
    <div className="w-[800px] h-[600px]">

      <VideoPlayer
        url='https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
        type='hls'
        />
    </div>
  )
}

export default App
