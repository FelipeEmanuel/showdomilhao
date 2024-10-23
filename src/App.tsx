import { useState } from "react";
import ShowMilhaoGeral from "./components/showMilhaoGeral";
import "./index.css";
import { Box, Button, Typography } from "@mui/material";
import ShowMilhaoAnime from "./components/showMilhaoAnime";
import QuizComumGeral from "./components/quizComumGeral";
import QuizComumAnime from "./components/quizComumAnime";

function App() {
  const [selectedGame, setSelectedGame] = useState<
    "milhaoGeral" | "milhaoAnime" | null | "comum" | "anime"
  >(null);

  const handleGameSelection = (game: "milhaoGeral" | "milhaoAnime" | "comum" | "anime") => {
    setSelectedGame(game);
  };

  const resetGame = () => {
    setSelectedGame(null);
  };

  return (
    <>
      {selectedGame === null && (
        <>
          <Typography fontSize="40px" align="center" gutterBottom>
            Bem-vindo, escolha o que quer jogar!
          </Typography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            gap={5}
            mb={4}
            bgcolor="white"
            height={400}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={5}
              mb={4}
              width="25%"
            >
              <Typography fontSize="20px" align="center" gutterBottom>
                Show do Milhão - Versão Conhecimentos Gerais
              </Typography>
              <Box width="25%" display="flex" alignSelf="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleGameSelection("milhaoGeral")}
                >
                  Jogar
                </Button>
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={5}
              mb={4}
              width="25%"
            >
              <Typography fontSize="20px" align="center" gutterBottom>
                Show do Milhão - Versão Anime
              </Typography>
              <Box width="25%" display="flex" alignSelf="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleGameSelection("milhaoAnime")}
                >
                  Jogar
                </Button>
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={5}
              mb={4}
              width="25%"
            >
              <Typography fontSize="20px" align="center" gutterBottom>
                Quiz Comum
              </Typography>
              <Box width="25%" display="flex" alignSelf="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleGameSelection("comum")}
                >
                  Jogar
                </Button>
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={5}
              mb={4}
              width="25%"
            >
              <Typography fontSize="20px" align="center" gutterBottom>
                Quiz Anime
              </Typography>
              <Box width="25%" display="flex" alignSelf="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleGameSelection("anime")}
                >
                  Jogar
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      )}

      <Box display="flex" justifyContent="center">
        {selectedGame === "milhaoGeral" && (
          <ShowMilhaoGeral onBack={resetGame} />
        )}
        {selectedGame === "milhaoAnime" && (
          <ShowMilhaoAnime onBack={resetGame} />
        )}
        {selectedGame === "comum" && (
          <QuizComumGeral onBack={resetGame} />
        )}
        {selectedGame === 'anime' && (
          <QuizComumAnime onBack={resetGame}/>
        )}
      </Box>
    </>
  );
}

export default App;
