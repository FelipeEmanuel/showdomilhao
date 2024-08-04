export const getValorPergunta = (questionNumber: number): string => {
    const questionMap: { [key: number]: string } = {
      1: '1 mil',
      2: '2 mil',
      3: '3 mil',
      4: '4 mil',
      5: '5 mil',
      6: '10 mil',
      7: '20 mil',
      8: '30 mil',
      9: '40 mil',
      10: '50 mil',
      11: '100 mil',
      12: '200 mil',
      13: '300 mil',
      14: '400 mil',
      15: '500 mil',
      16: '1 milhão'
    };
  
    return questionMap[questionNumber] || questionNumber.toString();
};

export const getPremioAtual = (questionNumber: number): string => {
    const questionMap: { [key: number]: string } = {
      1: '0 R$',
      2: '1 mil',
      3: '2 mil',
      4: '3 mil',
      5: '4 mil',
      6: '5 mil',
      7: '10 mil',
      8: '20 mil',
      9: '30 mil',
      10: '40 mil',
      11: '50 mil',
      12: '100 mil',
      13: '200 mil',
      14: '300 mil',
      15: '400 mil',
      16: '500 mil'
    };
  
    return questionMap[questionNumber] || questionNumber.toString();
};

export enum dificuldade {
    facil = 'Fácil',
    medio = 'Média',
    dificil = 'Difícil',
    milhao = 'Milhão'
}

export const getPremioPerdedor = (questionNumber: number): string => {
    const questionMap: { [key: number]: string } = {
      1: '0 R$',
      2: '500 R$',
      3: '1 mil',
      4: '1.5 mil',
      5: '2 mil',
      6: '2.5 mil',
      7: '5 mil',
      8: '10 mil',
      9: '15 mil',
      10: '20 mil',
      11: '25 mil',
      12: '50 mil',
      13: '100 mil',
      14: '150 mil',
      15: '200 mil',
      16: '500 mil'
    };
  
    return questionMap[questionNumber] || questionNumber.toString();
};

