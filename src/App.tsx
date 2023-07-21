import './App.css'
import VideoPlayer from './components/Player'

function App() {

  return (
    <div style={{
      width: '800px',
      height: '600px',
    }}>

      <VideoPlayer
        url='https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
        type='hls'
        />
    </div>
  )
}

export default App
