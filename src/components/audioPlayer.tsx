import ReactPlayer from 'react-player';

const AudioPlayer = ({ videoUrl, isPlaying, inicial, final }) => {
  return (
    <div>
      <ReactPlayer 
        url={videoUrl} 
        playing={isPlaying}
        controls
        config={{
            youtube: {
              playerVars: {
                start: inicial, // Timestamp inicial em segundos
                end: final,   // Timestamp final em segundos
              },
            },
          }} 
        width="0"  // Oculta a parte visual
        height="0" // Oculta a parte visual
      />
    </div>
  );
};

export default AudioPlayer;