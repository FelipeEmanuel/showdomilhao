import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  dificuldade,
  getPremioAtual,
  getPremioPerdedor,
  getValorPergunta,
} from "../types/quiz.type";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  dificuldade: string;
}

interface showMilhaoAnimeProps {
  onBack: () => void;
}

export default function ShowMilhaoAnime({ onBack }: showMilhaoAnimeProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(45);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [showCheckAnswerButton, setShowCheckAnswerButton] = useState(false);
  const [helpUsed, setHelpUsed] = useState({
    skip: false,
    eliminate: false,
    consult: false,
    hint: false,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(
    new Set()
  );

  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [finalPrize, setFinalPrize] = useState("");
  const [playerName, setPlayerName] = useState("");

  const questionNumber = currentQuestionIndex + 1;
  const phase =
    questionNumber <= 4
      ? dificuldade.facil
      : questionNumber <= 9
      ? dificuldade.medio
      : questionNumber <= 14
      ? dificuldade.dificil
      : dificuldade.milhao;

  const getRandomQuestionByDifficulty = (
    difficulty: string
  ): Question | null => {
    const filteredQuestions = questions.filter(
      (q) => q.dificuldade === difficulty
    );
    const availableQuestions = filteredQuestions.filter(
      (q) => !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    return selectedQuestion;
  };

  console.log(questionNumber);

  useEffect(() => {
    // Fetch questions from the API
    axios
      .get("http://localhost:3000/questionsAnime")
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the questions!", error);
      });
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setTimeUp(true);
      setShowCheckAnswerButton(true);
    }
  }, [timer]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentQuestionIndex]);

  const handleAnswerClick = (index: number) => {
    if (!showAnswer) {
      setSelectedAnswer(index);
      setShowCheckAnswerButton(true);
    }
  };

  const handleCheckAnswer = () => {
    setCheckingAnswer(true);
    setTimeout(() => {
      setShowAnswer(true);
      setShowCheckAnswerButton(false);
      setCheckingAnswer(false);

      // Verifica se a resposta está correta
      if (selectedAnswer !== currentQuestion?.correctAnswer) {
        // Se o jogador errou a pergunta
        setFinalPrize(getPremioPerdedor(questionNumber));
        setOpenErrorDialog(true);
        postRanking(questionNumber);
      } else if (questionNumber === 16) {
        // Se a pergunta é a última e foi acertada
        setFinalPrize(getValorPergunta(questionNumber));
        setOpenSuccessDialog(true);
        postRanking(questionNumber);
      }
    }, 2000);
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setTimer(45);
    setTimeUp(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setEliminatedOptions(new Set());
    const newQuestion = getRandomQuestionByDifficulty(phase);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setUsedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(newQuestion.id);
        return newSet;
      });
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setTimer(45);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeUp(false);
    setHelpUsed({ skip: false, eliminate: false, consult: false, hint: false });
    setEliminatedOptions(new Set());
    const newQuestion = getRandomQuestionByDifficulty(phase);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setUsedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(newQuestion.id);
        return newSet;
      });
    }
  };

  const handleSkipQuestion = () => {
    const newQuestion = getRandomQuestionByDifficulty(phase);
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setUsedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(newQuestion.id);
        return newSet;
      });
      setHelpUsed({ ...helpUsed, skip: true });
    }
  };

  const handleEliminateOptions = () => {
    if (currentQuestion) {
      const incorrectOptions = currentQuestion.options
        .map((_, index) => index)
        .filter((index) => index !== currentQuestion.correctAnswer);

      const optionsToEliminate = new Set<number>();
      while (
        optionsToEliminate.size < 2 &&
        optionsToEliminate.size < incorrectOptions.length
      ) {
        const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
        optionsToEliminate.add(incorrectOptions[randomIndex]);
      }
      setEliminatedOptions(optionsToEliminate);
      setHelpUsed({ ...helpUsed, eliminate: true });
    }
  };

  const useHelp = (helpType: string) => {
    if (helpType === "skip" && !helpUsed.skip) {
      handleSkipQuestion();
    } else if (helpType === "eliminate" && !helpUsed.eliminate) {
      handleEliminateOptions();
    } else if (helpType === "consult" && !helpUsed.consult) {
      setHelpUsed({ ...helpUsed, consult: true });
    } else if (helpType === "hint" && !helpUsed.hint) {
      setHelpUsed({ ...helpUsed, hint: true });
    }
  };

  const postRanking = (index: number) => {
    axios
      .post("http://localhost:3000/rankingMilhaoAnime", {
        nome: playerName,
        index: index,
      })
      .then((response) => {
        console.log("Ranking posted successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error posting the ranking!", error);
      });
  };

  return (
    <Container maxWidth="lg">
      <Button
        variant="contained"
        color="success"
        onClick={onBack}
        style={{ marginBottom: "20px" }}
      >
        Voltar
      </Button>
      {!quizStarted ? (
        <Card
          style={{
            marginTop: "50px",
            padding: "20px",
          }}
        >
          <CardContent>
            <Typography fontSize="30px" gutterBottom>
              Bem-vindo ao Quiz Show do Milhão - Conhecimentos Gerais
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Nome do Jogador"
              type="text"
              fullWidth
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={startQuiz}
              disabled={playerName === ""}
              style={{ marginTop: "20px", marginRight: "20px" }}
            >
              Iniciar Quiz
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: "20px" }}
            >
              Ver Rankings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          style={{
            marginTop: "50px",
            padding: "20px",
            backgroundColor: "#00008b",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box bgcolor="yellow" p="10px 30px" border="10px solid white">
                <Typography variant="h6" fontWeight={700}>
                  Parar: {getPremioAtual(questionNumber)}
                </Typography>
              </Box>
              <Box bgcolor="green" p="10px 30px" border="10px solid white">
                <Typography variant="h5" fontWeight={700}>
                  Acertar: {getValorPergunta(questionNumber)}
                </Typography>
              </Box>
              <Box bgcolor="red" p="10px 30px" border="10px solid white">
                <Typography variant="h6" fontWeight={700}>
                  Errar: {getPremioPerdedor(questionNumber)}
                </Typography>
              </Box>
            </Box>
            {currentQuestion && (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
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
                        button
                        onClick={() => handleAnswerClick(index)}
                        style={{
                          backgroundColor:
                            selectedAnswer === index && !showAnswer
                              ? "yellow"
                              : showAnswer &&
                                index === currentQuestion.correctAnswer
                              ? "green"
                              : showAnswer && selectedAnswer === index
                              ? "red"
                              : eliminatedOptions.has(index)
                              ? "grey"
                              : "white",
                          cursor: showAnswer ? "default" : "pointer",
                          color:
                            showAnswer &&
                            (index === currentQuestion.correctAnswer ||
                              selectedAnswer === index)
                              ? "white"
                              : "black",
                        }}
                        disabled={checkingAnswer}
                      >
                        <Typography p={1} fontWeight={700}>
                          {index + 1}) {option}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                {!checkingAnswer && !showAnswer && (
                  <Box
                    bgcolor="white"
                    p={4}
                    width={200}
                    display="flex"
                    justifyContent="center"
                  >
                    <Typography variant="body1" fontSize="40px">
                      <AccessAlarmIcon sx={{ fontSize: "40px" }} /> {timer}
                    </Typography>
                  </Box>
                )}
                {showCheckAnswerButton && !showAnswer && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCheckAnswer}
                    style={{ marginTop: "20px" }}
                    disabled={checkingAnswer}
                  >
                    {checkingAnswer ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Verificar Resposta"
                    )}
                  </Button>
                )}
                {showAnswer && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextQuestion}
                    style={{ marginTop: "20px" }}
                  >
                    Próxima Pergunta
                  </Button>
                )}
                <div style={{ marginTop: "20px" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => useHelp("skip")}
                    disabled={helpUsed.skip}
                    style={{ marginRight: "10px", marginBottom: "10px" }}
                  >
                    Pular pergunta
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => useHelp("eliminate")}
                    disabled={helpUsed.eliminate}
                    style={{ marginRight: "10px", marginBottom: "10px" }}
                  >
                    Eliminar alternativas
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => useHelp("consult")}
                    disabled={helpUsed.consult}
                    style={{ marginRight: "10px", marginBottom: "10px" }}
                  >
                    Consultar alguém
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => useHelp("hint")}
                    disabled={helpUsed.hint}
                    style={{ marginRight: "10px", marginBottom: "10px" }}
                  >
                    Opinião dos Jogadores
                  </Button>
                </div>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de erro */}
      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
        <DialogTitle>Você Errou!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Você errou a pergunta.</Typography>
          <Typography variant="body1">
            Seu prêmio atual é: {finalPrize}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenErrorDialog(false);
              setQuizStarted(false);
              setUsedQuestions(new Set());
            }}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de sucesso */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
      >
        <DialogTitle>Parabéns!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Você ganhou o Quiz!</Typography>
          <Typography variant="body1">Seu prêmio é: {finalPrize}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSuccessDialog(false);
              setQuizStarted(false);
              setUsedQuestions(new Set());
            }}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
