import { defaultTableGamePlayInterface } from "./tableGamePlay";
export interface RoundStartInterface {
  tableId: string;
  currentRound: number;
  tableGamePlay: defaultTableGamePlayInterface;
}
