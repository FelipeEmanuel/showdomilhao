import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, Typography } from '@mui/material';;
import React from 'react';
import axios from "axios";
import { CssTextField } from './cssTextField';
import AudioPlayer from './audioPlayer';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

interface Musica {
  id: number;
  title: string;
  options: string[],
  url: string;
  inicial: number;
  final: number;
}

interface Team {
  name: string;
  score: number;
  correctStreak: number;
}

interface quizAberturasProps {
  onBack: () => void;
}

interface quizAberturasState {
  musicas: Musica[];
  currentMusica: Musica | null;
  showAnswer: boolean;
  quizStarted: boolean;
  checkingAnswer: boolean;
  showCheckAnswerButton: boolean;
  currentMusicaIndex: number;
  usedMusicas: Set<number>;
  teams: Team[];
  currentTeam: Team | null;
  currentTeamIndex: number;
  teamNames: string[];
  numberOfTeams: number | null;
  numMusicas: number | null;
  quizSetup: boolean;
  openSuccessDialog: boolean;
  winningTeam: Team | null;
  isPlaying: boolean
}

class QuizAberturas extends React.Component<quizAberturasProps, quizAberturasState> {
  countdownInterval: number | undefined;

  constructor(props: quizAberturasProps) {
    super(props);

    this.state = {
      musicas: [],
      currentMusica: null,
      showAnswer: false,
      quizStarted: false,
      checkingAnswer: false,
      showCheckAnswerButton: false,
      currentMusicaIndex: 0,
      usedMusicas: new Set(),
      teams: [],
      currentTeamIndex: 0,
      teamNames: [],
      currentTeam: null,
      numberOfTeams: 0,
      numMusicas: 0,
      quizSetup: false,
      openSuccessDialog: false,
      winningTeam: null,
      isPlaying: true
    };
  }

  componentDidMount() {
    axios
    .get("http://localhost:3000/usedAberturas")
    .then((response) => {
      const usedMusicasIds = response.data || [];
      this.setState({ usedMusicas: new Set(usedMusicasIds) });
    })
    .catch((error) => {
      console.error("Error fetching used musicas:", error);
    });
    
    axios
      .get("http://localhost:3000/aberturas")
      .then((response) => {
        this.setState({ musicas: response.data });
      })
      .catch((error) => {
        console.error("There was an error fetching the musicas!", error);
      });

  }

  handleSetupAndStartQuiz = () => {

    const { teamNames } = this.state
    const teams = teamNames.map((name) => ({name, score: 0, correctStreak: 0}))

    this.setState({ 
      teams,
      currentTeam: teams[0], 
      quizSetup: true, 
      quizStarted: true,
      currentMusicaIndex: 0,
      showAnswer: false,
    }, () => {
      this.loadNewMusica();
    });
  };

  togglePlayPause = (value: boolean) => {
    this.setState({isPlaying: value});
  };

  loadNewMusica = () => {
    const availableMusicas = this.state.musicas.filter(
      (q) => !this.state.usedMusicas.has(q.id)
    );

    if (availableMusicas.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableMusicas.length);
    const selectedMusica = availableMusicas[randomIndex];

    this.setState((prevState) => ({
      currentMusica: selectedMusica,
      isPlaying: true,
      usedMusicas: new Set(prevState.usedMusicas).add(selectedMusica.id),
    }));
  };

  handleCheckAnswer = () => {
    this.setState({isPlaying: false})
    setTimeout(() => {
      this.setState({ showAnswer: true });
    }, 2000);
  };

  handleNextMusica = () => {

    const { currentMusica } = this.state;
    
    if (currentMusica) {
      axios.post("http://localhost:3000/usedAberturas", { musicaId: currentMusica.id })
        .then((response) => {
          console.log(`Used musica ID ${currentMusica.id} sent successfully:`, response.data);
        })
        .catch((error) => {
          console.error(`Error sending used musica ID ${currentMusica.id}:`, error);
        });

      this.setState((prevState) => ({
        usedMusicas: new Set(prevState.usedMusicas).add(currentMusica.id),
        showAnswer: false,
        currentMusicaIndex: this.state.currentMusicaIndex + 1,
      }));
  
      this.setState((prevState) => ({
        currentTeamIndex: (prevState.currentTeamIndex + 1) % prevState.teams.length, // Muda para o próximo time
        currentTeam: prevState.teams[(prevState.currentTeamIndex + 1) % prevState.teams.length], // Atualiza o time atual
      })); 
    }
    
    this.loadNewMusica();
    
  };

  resetUsedQuestions = () => {
    axios.get("http://localhost:3000/usedQuestionsAnime")
      .then((response) => {
        const usedMusicas = response.data; // Obtém todos os itens usados
        const deleteRequests = usedMusicas.map(musica => 
          axios.delete(`http://localhost:3000/usedAberturas/${musica.id}`) // Deleta cada item
        );

        // Aguarda a conclusão de todas as requisições de deleção
        return Promise.all(deleteRequests);
      })
      .then(() => {
        console.log("All used questions cleared successfully.");
        this.setState({ usedMusicas: new Set() }); // Limpa o estado local
      })
      .catch((error) => {
        console.error("Error clearing used questions:", error);
      });
  };

  endQuiz = () => {

    const maxScore = Math.max(...this.state.teams.map(team => team.score));
    const tiedTeams = this.state.teams.filter(team => team.score === maxScore);

    let winningTeam;

    if (tiedTeams.length === 1) {
      // Se houver apenas um time com a maior pontuação, ele é o vencedor
      winningTeam = tiedTeams[0];
    } else {
      // Desempate: encontra o time com a maior sequência de acertos
      const maxStreak = Math.max(...tiedTeams.map(team => team.correctStreak));
      winningTeam = tiedTeams.find(team => team.correctStreak === maxStreak);
    }

    this.setState({
      openSuccessDialog: true,
      winningTeam: winningTeam
    });

  };
  
  render() {
    const {
      quizStarted, currentMusica, showAnswer, checkingAnswer,
      numMusicas, numberOfTeams, teamNames, openSuccessDialog, teams, 
      winningTeam, currentMusicaIndex, isPlaying
    } = this.state;

    const questionNumber = this.state.currentMusicaIndex + 1;
    const numTotal = this.state.numMusicas;

    return (
      <Box width="100%">
        <Box width="100%">
          <Button variant="contained" color="success" onClick={this.props.onBack} style={{ marginBottom: "20px" }}>
            Voltar
          </Button>
          {!quizStarted ? (
            <Card style={{ marginTop: "50px", padding: "20px", backgroundColor: "#e1651a" }}>
              <CardContent>
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                  <Box width="120px"></Box>
                  <Typography fontSize="30px" gutterBottom>
                    Configurar Quiz
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{width: 120, height: 50}}
                    onClick={this.resetUsedQuestions}
                  >
                    Resetar Músicas
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column" gap="15px">
                  <CssTextField
                    label="Número de Equipes"
                    variant='standard'
                    value={numberOfTeams}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newNumberOfTeams = value === '' ? null : Number(value);

                      // Ajusta o array de nomes de times para o novo número de equipes
                      let newTeamNames = [...teamNames];
                      if (Number(newNumberOfTeams) < newTeamNames.length) {
                        // Reduz o array se o número de equipes for menor
                        newTeamNames = newTeamNames.slice(0, Number(newNumberOfTeams));
                      } else {
                        // Aumenta o array preenchendo com strings vazias
                        while (newTeamNames.length < Number(newNumberOfTeams)) {
                          newTeamNames.push('');
                        }
                      }

                      this.setState({
                        numberOfTeams: newNumberOfTeams,
                        teamNames: newTeamNames,
                      });
                    }}
                    onKeyPress={(e) => {
                      // Permitir apenas números no input
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    fullWidth
                  />
                  <CssTextField
                    label="Número de Músicas"
                    variant='standard'
                    value={numMusicas}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        this.setState({ numMusicas: value === '' ? null : Number(value) });
                      }
                    }}
                    onKeyPress={(e) => {
                      // Permitir apenas números no input
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    fullWidth
                  />
                </Box>
                
                {Number(numberOfTeams) > 0 &&
                  <Box paddingTop="20px">
                    <Typography fontSize="30px" gutterBottom>
                      Configurar Equipes
                    </Typography>
                  </Box>
                }
                {
                  Array.from({ length: Number(numberOfTeams) }).map((_, index) => (
                    <CssTextField
                      key={index}
                      variant='standard'
                      label={`Nome da Equipe ${index + 1}`}
                      value={teamNames[index] || ''}
                      onChange={(e) => {
                        const newTeamNames = [...teamNames];
                        newTeamNames[index] = e.target.value;
                        this.setState({ teamNames: newTeamNames });
                      }}
                      fullWidth
                    />  
                  ))
                }
                <Button variant="contained" 
                  onClick={this.handleSetupAndStartQuiz} 
                  style={{ marginTop: "20px", backgroundColor: "#7349AC" }} 
                  disabled={teamNames.length !== numberOfTeams || teamNames.some((name) => !name) || numMusicas === 0 || numMusicas === null || numberOfTeams === 0 || numberOfTeams === null}>
                  Iniciar quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box display="flex" flexDirection="row" width="100%">
              <Card style={{ marginTop: "50px", padding: "20px", backgroundColor: "#e1651a", width: '70%'}}>
                <CardContent>
                  {currentMusica && (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                      <Box bgcolor="white" width="100%" p="20px 0px">
                        <Typography fontSize="25px" fontWeight={700}>
                          {questionNumber}/{numTotal} 
                        </Typography>
                      </Box>
                      <Box 
                        bgcolor="#1f2124" 
                        height="200px"
                        width="100%" 
                        borderRadius="8px" 
                        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)" 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center"
                        position="relative"
                      >
                        <IconButton
                          onClick={() => this.togglePlayPause(isPlaying ? false : true)}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            color: "#e1651a"
                          }}
                        >
                          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        
                        <MusicNoteIcon
                          style={{
                            position: "absolute",
                            fontSize: "60px",
                            color: "#e1651a",
                            opacity: 0.3
                          }}
                        />
                        <AudioPlayer videoUrl={currentMusica?.url} isPlaying={isPlaying} inicial={currentMusica?.inicial} final={currentMusica?.final}/>
                      </Box>
                      <Box width="100%">
                        <List>
                          {currentMusica.options.map((option, index) => (
                            <ListItem
                              key={index}
                              style={{
                                backgroundColor: 
                                  showAnswer && option === currentMusica.title
                                    ? "green"
                                    : "white",
                                cursor: "default", // Desabilita o cursor de clique
                                color:
                                  showAnswer && option === currentMusica.title
                                    ? "white"
                                    : "black",
                              }}
                            >
                              {index + 1}) {option}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Box>
                  )}
                  {showAnswer && !checkingAnswer && (
                    <Button variant="contained" onClick={currentMusicaIndex + 1 === numMusicas ? this.endQuiz : this.handleNextMusica}>
                      {currentMusicaIndex + 1 === numMusicas ? "Ver Resultados" : "Próxima Pergunta"}
                    </Button>
                  )}
                  {!showAnswer && (
                    <Button variant="contained" onClick={this.handleCheckAnswer}>
                      Verificar Resposta
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Card style={{ marginTop: "50px", padding: "20px", backgroundColor: "#7349AC", width: '30%'}}>
                <CardContent>
                  <Typography fontSize="25px" fontWeight={700} color="white" gutterBottom>
                    Ranking das Equipes
                  </Typography>
                  <List>
                    {teams
                      .slice()
                      .sort((a, b) => b.score - a.score) // Ordena as equipes pela pontuação
                      .map((team, index) => (
                        <ListItem
                          key={index}
                          style={{
                            backgroundColor: "#ffffff",
                            marginBottom: "10px",
                            padding: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            borderRadius: "8px",
                          }}
                        >
                          <Typography fontSize="20px" fontWeight={700} color="black">
                            {index+1}) {team.name}
                          </Typography>
                          <Typography fontSize="20px" fontWeight={700} color="black">
                            {team.score} ponto(s)
                          </Typography>
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
              <Dialog open={openSuccessDialog} onClose={() => this.setState({ openSuccessDialog: false })} maxWidth="sm" fullWidth={true}>
                <DialogTitle>Parabéns {winningTeam?.name}!</DialogTitle>
                <DialogContent>Você foi o vencedor do quiz!</DialogContent>
                <DialogActions style={{ justifyContent: 'center' }}>
                  <Button onClick={() => this.setState({ openSuccessDialog: false, quizStarted: false, numberOfTeams: null, numMusicas: null, teams: [], teamNames: [] })}>Concluir</Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
        </Box>
        {quizStarted &&
          <Box display="flex" flexDirection="column" alignItems="center" width="100%" marginTop="20px" sx={{backgroundColor:"#fff"}}>
            <Typography fontSize="20px" fontWeight={700} color="black" gutterBottom>
              Adicionar Pontos
            </Typography>
            <Box display="flex" flexDirection="row" gap="10px" flexWrap="wrap" justifyContent="center">
              {teams.map((team, index) => (
                <Box key={index} display="flex" flexDirection="column" alignItems="center" width="150px" border="1px solid #000" gap="15px">
                  <Typography fontSize="18px" fontWeight={600}>
                    Equipe: {team.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{width: 120, height: 35}}
                    onClick={() => {
                      this.setState((prevState) => {
                        const updatedTeams = prevState.teams.map((team, idx) => {
                          if (idx === index) {
                            return { ...team, score: team.score + 1 }; // Incrementa o ponto corretamente
                          }
                          return team;
                        });
                        return { teams: updatedTeams };
                      });
                    }}
                    disabled={!showAnswer} // Desativa o botão até que a resposta seja verificada
                  >
                    +1 Ponto
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        }
        
      </Box>
    );
  }
}

export default QuizAberturas;
