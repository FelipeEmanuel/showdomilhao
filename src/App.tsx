import { useState } from "react";
import "./index.css";
import { Box, Button, Typography } from "@mui/material";
import QuizComumGeral from "./components/quizComumGeral";
import QuizComumAnime from "./components/quizComumAnime";
import { GameType } from "./types/quiz.type";
import QuizComumSeries from "./components/quizComumSeries";
import QuizAberturas from "./components/quizAberturas";
import QuizImagens from "./components/quizImagens";

function App() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const handleGameSelection = (game: GameType) => {
    setSelectedGame(game);
  };

  const resetGame = () => {
    setSelectedGame(null);
  };

  return (
    <>
      {selectedGame === null && (
        <>
          <Typography fontSize="40px" align="center" gutterBottom color="#e1651a" fontWeight={700}>
            BEM-VINDO, ESCOLHA O QUE QUER JOGAR!
          </Typography>
          <Box display="flex" flexDirection="row" justifyContent="center" gap="10px" mb={4} bgcolor="#e1651a" height="100%" flexWrap="wrap" padding="10px 0px">
            {/* Quiz de Anime */}
            <Box display="flex" flexDirection="column" justifyContent="center" gap="15px" mb={4} width="calc(33.33% - 15px)" border="2px solid #7349ac">
              <Typography fontSize="20px" align="center" gutterBottom color="#7349ac" fontWeight={1000} paddingTop="20px">
                Quiz de Anime
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img src="../src/assets/luffy2.jpg" alt="Anime" style={{ width: '350px', height: '200px' }} />
              </Box>
              <Box width="100%" display="flex" justifyContent="center" alignItems="center" padding="20px 10px">
                <Button variant="contained" sx={{backgroundColor: "#7349AC"}} onClick={() => handleGameSelection(GameType.quizAnime)}>
                  Jogar
                </Button>
              </Box>
            </Box>

            {/* Quiz de Séries/Filmes */}
            <Box display="flex" flexDirection="column" justifyContent="center" gap="15px" mb={4} width="calc(33.33% - 15px)" border="2px solid #7349ac">
              <Typography fontSize="20px" align="center" gutterBottom color="#7349ac" fontWeight={1000} paddingTop="20px">
                Quiz de Séries/Filmes
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img src="../src/assets/got2.webp" alt="Séries" style={{ width: '350px', height: '200px' }} />
              </Box>
              <Box width="100%" display="flex" justifyContent="center" alignItems="center" padding="20px 10px">
                <Button variant="contained" sx={{backgroundColor: "#7349AC"}} onClick={() => handleGameSelection(GameType.quizSeries)}>
                  Jogar
                </Button>
              </Box>
            </Box>

            {/* Quiz de Conhecimentos Gerais*/}
            <Box display="flex" flexDirection="column" justifyContent="center" gap="15px" mb={4} width="calc(33.33% - 15px)" border="2px solid #7349ac">
              <Typography fontSize="20px" align="center" gutterBottom color="#7349ac" fontWeight={1000} paddingTop="20px">
                Quiz de Conhecimentos Gerais
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img src="../src/assets/conhecimentosgerais.webp" alt="Conhecimentos" style={{ width: '350px', height: '200px' }} />
              </Box>
              <Box width="100%" display="flex" justifyContent="center" alignItems="center" padding="20px 10px">
                <Button variant="contained" sx={{backgroundColor: "#7349AC"}} onClick={() => handleGameSelection(GameType.quizGeral)}>
                  Jogar
                </Button>
              </Box>
            </Box>

            {/* Quiz de Aberturas de anime */}
            <Box display="flex" flexDirection="column" justifyContent="center" gap="15px" mb={4} width="calc(33.33% - 15px)" border="2px solid #7349ac">
              <Typography fontSize="20px" align="center" gutterBottom color="#7349ac" fontWeight={1000} paddingTop="20px">
                Quiz Aberturas de Anime
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img src="../src/assets/aberturas.jpg" alt="Aberturas" style={{ width: '350px', height: '200px' }} />
              </Box>
              <Box width="100%" display="flex" justifyContent="center" alignItems="center" padding="20px 10px">
                <Button variant="contained" sx={{backgroundColor: "#7349AC"}} onClick={() => handleGameSelection(GameType.quizAberturas)}>
                  Jogar
                </Button>
              </Box>
            </Box>

            {/* Quiz de Imagens */}
            <Box display="flex" flexDirection="column" justifyContent="center" gap="15px" mb={4} width="calc(33.33% - 15px)" border="2px solid #7349ac">
              <Typography fontSize="20px" align="center" gutterBottom color="#7349ac" fontWeight={1000} paddingTop="20px">
                Quiz de Imagens
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img src="../src/assets/guess_what.jpg" alt="Imagens" style={{ width: '350px', height: '200px' }} />
              </Box>
              <Box width="100%" display="flex" justifyContent="center" alignItems="center" padding="20px 10px">
                <Button variant="contained" sx={{backgroundColor: "#7349AC"}} onClick={() => handleGameSelection(GameType.quizImagens)}>
                  Jogar
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      )}

      <Box display="flex" justifyContent="center" width="100%">
        {selectedGame === GameType.quizAnime && (
          <QuizComumAnime onBack={resetGame}/>
        )}
        {selectedGame === GameType.quizGeral && (
          <QuizComumGeral onBack={resetGame} />
        )}
        {selectedGame === GameType.quizSeries && (
          <QuizComumSeries onBack={resetGame} />
        )}
        {selectedGame === GameType.quizAberturas && (
          <QuizAberturas onBack={resetGame}/>
        )}
        {selectedGame === GameType.quizImagens && (
          <QuizImagens onBack={resetGame}/> 
        )}
      </Box>
    </>
  );
}

export default App;
