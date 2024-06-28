import { gameDetailsInterface } from '../../interfaces/turnHistory';

function getCurrentRoundHistory(
  history: Array<gameDetailsInterface>,
  currentRound: number
): gameDetailsInterface {
  return history.filter(
    (e: gameDetailsInterface) => e.roundNo === currentRound
  )[0];
}

function replaceRoundHistory(
  history: Array<gameDetailsInterface>,
  currentRound: number,
  updatedObj: gameDetailsInterface
): Array<gameDetailsInterface> {
  const newHistory: Array<gameDetailsInterface> = history;
  const foundIndex: number = history.findIndex(
    (e: gameDetailsInterface) => e.roundNo === currentRound
  );
  newHistory[foundIndex] = updatedObj;
  return newHistory;
}

const exportObject = {
  getCurrentRoundHistory,
  replaceRoundHistory
};

export = exportObject;
