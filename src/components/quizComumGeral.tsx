import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, styled, TextField, Typography } from '@mui/material';;
import React from 'react';
import axios from "axios";

const CssTextField = styled(TextField)(() => ({
  "& label": {
      color: "#000000",
      fontSize: '14px',
      fontWeight: '400',
  },
  "& label.Mui-focused": {
      color: "#000000",
  },
  "& .MuiInput-underline:before": {
      borderColor: "#000000",
  },
  "& .MuiInput-underline:after": {
      borderColor: "#000000",
  },
  "& .MuiInput-root": {
      "& fieldset": {
          borderColor: "#000000",
      },
      "&:hover fieldset": {
          borderColor: "#000000",
      },
      "&.Mui-focused fieldset": {
          borderColor: "#000000",
      },
  }
}))

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  dificuldade: string;
}

interface Team {
  name: string;
  score: number;
  correctStreak: number;
}

interface quizGeralProps {
  onBack: () => void;
}

interface quizGeralState {
  questions: Question[];
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  showAnswer: boolean;
  quizStarted: boolean;
  checkingAnswer: boolean;
  showCheckAnswerButton: boolean;
  currentQuestionIndex: number;
  usedQuestions: Set<number>;
  teams: Team[];
  currentTeam: Team | null;
  currentTeamIndex: number;
  teamNames: string[];
  numberOfTeams: number | null;
  numQuestions: number | null;
  quizSetup: boolean;
  openSuccessDialog: boolean;
  winningTeam: Team | null;
}

class QuizComumGeral extends React.Component<quizGeralProps, quizGeralState> {
  countdownInterval: number | undefined;

  constructor(props: quizGeralProps) {
    super(props);

    this.state = {
      questions: [],
      currentQuestion: null,
      selectedAnswer: null,
      showAnswer: false,
      quizStarted: false,
      checkingAnswer: false,
      showCheckAnswerButton: false,
      currentQuestionIndex: 0,
      usedQuestions: new Set(),
      teams: [],
      currentTeamIndex: 0,
      teamNames: [],
      currentTeam: null,
      numberOfTeams: 0,
      numQuestions: 0,
      quizSetup: false,
      openSuccessDialog: false,
      winningTeam: null
    };
  }

  componentDidMount() {
    axios
    .get("http://localhost:3000/usedQuestionsGeral")
    .then((response) => {
      const usedQuestionIds = response.data || [];
      this.setState({ usedQuestions: new Set(usedQuestionIds) });
    })
    .catch((error) => {
      console.error("Error fetching used questions:", error);
    });
    
    axios
      .get("http://localhost:3000/questionsGeral")
      .then((response) => {
        this.setState({ questions: response.data });
      })
      .catch((error) => {
        console.error("There was an error fetching the questions!", error);
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
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showAnswer: false,
    }, () => {
      this.loadNewQuestion();
    });
  };

  loadNewQuestion = () => {
    const availableQuestions = this.state.questions.filter(
      (q) => !this.state.usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    this.setState((prevState) => ({
      currentQuestion: selectedQuestion,
      usedQuestions: new Set(prevState.usedQuestions).add(selectedQuestion.id)
    }));
  };

  handleCheckAnswer = () => {
    console.log('chamou o checkanswer')
    this.setState({ checkingAnswer: true });

    setTimeout(() => {
      const { selectedAnswer, currentQuestion, currentTeamIndex, teams } = this.state;

      this.setState({ showAnswer: true, showCheckAnswerButton: false, checkingAnswer: false });

      // Verifica se a resposta está correta
      if (selectedAnswer === currentQuestion?.correctAnswer) {
        console.log('chamou')
        const updatedTeams = [...teams];
        updatedTeams[currentTeamIndex].score += 1; // Incrementa a pontuação
        updatedTeams[currentTeamIndex].correctStreak += 1; // Incrementa a sequência de acertos
        this.setState({teams: updatedTeams})
      } else {
        const updatedTeams = [...teams];
          updatedTeams[currentTeamIndex].correctStreak = 0; // Incrementa a sequência de acertos
          this.setState({teams: updatedTeams})
      }

    }, 2000);
  };

  handleNextQuestion = () => {

    const { currentQuestion } = this.state;
    
    if (currentQuestion) {
      axios.post("http://localhost:3000/usedQuestionsGeral", { questionId: currentQuestion.id })
        .then((response) => {
          console.log(`Used question ID ${currentQuestion.id} sent successfully:`, response.data);
        })
        .catch((error) => {
          console.error(`Error sending used question ID ${currentQuestion.id}:`, error);
        });

      this.setState((prevState) => ({
        usedQuestions: new Set(prevState.usedQuestions).add(currentQuestion.id),
        showAnswer: false,
        selectedAnswer: null,
        currentQuestionIndex: this.state.currentQuestionIndex + 1,
      }));
  
      this.setState((prevState) => ({
        currentTeamIndex: (prevState.currentTeamIndex + 1) % prevState.teams.length, // Muda para o próximo time
        currentTeam: prevState.teams[(prevState.currentTeamIndex + 1) % prevState.teams.length], // Atualiza o time atual
      })); 
    }
    
    this.loadNewQuestion();
    
  };

  resetUsedQuestions = () => {
    axios.get("http://localhost:3000/usedQuestionsGeral")
      .then((response) => {
        const usedQuestions = response.data; // Obtém todos os itens usados
        const deleteRequests = usedQuestions.map(question => 
          axios.delete(`http://localhost:3000/usedQuestionsGeral/${question.id}`) // Deleta cada item
        );

        // Aguarda a conclusão de todas as requisições de deleção
        return Promise.all(deleteRequests);
      })
      .then(() => {
        console.log("All used questions cleared successfully.");
        this.setState({ usedQuestions: new Set() }); // Limpa o estado local
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
      quizStarted, currentQuestion, selectedAnswer, showAnswer, checkingAnswer,
      numQuestions, numberOfTeams, teamNames, openSuccessDialog, teams, currentTeam, 
      winningTeam, currentQuestionIndex
    } = this.state;

    const questionNumber = this.state.currentQuestionIndex + 1;
    const numTotal = this.state.numQuestions;

    return (
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
                  Resetar Perguntas
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
                  label="Número de Perguntas"
                  variant='standard'
                  value={numQuestions}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      this.setState({ numQuestions: value === '' ? null : Number(value) });
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
                disabled={teamNames.length !== numberOfTeams || teamNames.some((name) => !name) || numQuestions === 0 || numQuestions === null || numberOfTeams === 0 || numberOfTeams === null}>
                Iniciar quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box display="flex" flexDirection="row" width="100%">
            <Card style={{ marginTop: "50px", padding: "20px", backgroundColor: "#e1651a", width: '70%'}}>
              <CardContent>
                {currentQuestion && (
                  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Box bgcolor="white" width="100%" p="20px 0px">
                      <Typography fontSize="25px" fontWeight={700}>
                        Pergunta {questionNumber}/{numTotal} 
                      </Typography>
                      <Typography fontSize="20px" fontWeight={700}>
                        Equipe respondendo: {currentTeam?.name}
                      </Typography>
                    </Box>
                    <Box bgcolor="white" width="100%" p="20px 0px">
                      <Typography fontSize="25px" fontWeight={700}>
                        {currentQuestion?.question}
                      </Typography>
                    </Box>
                    <Box width="100%">
                      <List>
                        {currentQuestion.options.map((option, index) => (
                          <ListItem
                            key={index}
                            style={{
                              backgroundColor:
                                selectedAnswer === index && !showAnswer
                                  ? "yellow"
                                  : showAnswer &&
                                    index === currentQuestion.correctAnswer
                                  ? "green"
                                  : showAnswer && selectedAnswer === index
                                  ? "red"
                                  : "white",
                              cursor: showAnswer ? "default" : "pointer",
                              color: showAnswer &&
                                (index === currentQuestion.correctAnswer || selectedAnswer === index)
                                ? "white"
                                : "black",
                            }}
                            onClick={() => !showAnswer && this.setState({ selectedAnswer: index })}
                          >
                            {index+1}) {option}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                )}
                {showAnswer && !checkingAnswer && (
                  <Button variant="contained" onClick={currentQuestionIndex + 1 === numQuestions ? this.endQuiz : this.handleNextQuestion}>
                    {currentQuestionIndex + 1 === numQuestions ? "Ver Resultados": "Próxima Pergunta"}
                  </Button>
                )}
                {!showAnswer && selectedAnswer !== null && !checkingAnswer && (
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
                <Button onClick={() => this.setState({ openSuccessDialog: false, quizStarted: false, numberOfTeams: null, numQuestions: null, teams: [], teamNames: [] })}>Concluir</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    );
  }
}

export default QuizComumGeral;
