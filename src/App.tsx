import { useState } from "react";
import ShowMilhaoGeral from "./components/showMilhaoGeral";
import "./index.css";
import { Box, Button, Typography } from "@mui/material";
import ShowMilhaoAnime from "./components/showMilhaoAnime";

function App() {
  const [selectedGame, setSelectedGame] = useState<
    "milhaoGeral" | "milhaoAnime" | null
  >(null);

  const handleGameSelection = (game: "milhaoGeral" | "milhaoAnime") => {
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
              width="50%"
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
              width="50%"
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
      </Box>
    </>
  );
}

export default App;
