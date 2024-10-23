import { Box, Button, Card, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import axios from "axios";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    dificuldade: string;
}

interface showMilhaoGeralProps {
    onBack: () => void;
}

export default function QuizComumAnime({onBack}: showMilhaoGeralProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [showCheckAnswerButton, setShowCheckAnswerButton] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(
    new Set()
  );
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const numTotal = 30
  const questionNumber = currentQuestionIndex + 1;

  const getRandomQuestionByDifficulty = (): Question | null => {

    const availableQuestions = questions.filter(
      (q) => !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    return selectedQuestion;
  };

  useEffect(() => {
    if (timer === 0) {
      setTimeUp(true);
      setShowCheckAnswerButton(true);
    }
  }, [timer]);

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

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setTimer(30);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeUp(false);
    setEliminatedOptions(new Set());
    const newQuestion = getRandomQuestionByDifficulty();
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setUsedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(newQuestion.id);
        return newSet;
      });
    }
  };

  const handleCheckAnswer = () => {
    setCheckingAnswer(true);
    setTimeout(() => {
      setShowAnswer(true);
      setShowCheckAnswerButton(false);
      setCheckingAnswer(false);

      // Verifica se a resposta está correta
    if (questionNumber === numTotal) {
        setOpenSuccessDialog(true);
      }
    }, 2000);
  };

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

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setTimer(30);
    setTimeUp(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setEliminatedOptions(new Set());
    const newQuestion = getRandomQuestionByDifficulty();
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setUsedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(newQuestion.id);
        return newSet;
      });
    }
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
                Bem-vindo ao Quiz - Animes
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={startQuiz}
              style={{ marginTop: "20px", marginRight: "20px" }}
            >
              Iniciar Quiz
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
            {currentQuestion && (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <Box bgcolor="white" width="100%" p="20px 0px">
                  <Typography fontSize="25px" fontWeight={700}>
                    Pergunta {questionNumber}/{numTotal}
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
                        button
                        //onClick={() => handleAnswerClick(index)}
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
                
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCheckAnswer}
                    style={{ marginTop: "20px" }}
                    disabled={checkingAnswer}
                  >
                    
                      "Verificar Resposta"
                    
                  </Button>
                
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
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de sucesso */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
      >
        <DialogTitle>Fim do quiz!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Parabéns ao vencedor!</Typography>
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
  )
}

