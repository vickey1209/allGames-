import { NUMERICAL, PLAYER_STATE } from '../../../constants';
import { seatsInterface } from '../../../interfaces/signup';
import Logger from "../../../logger";

function getNextPlayer(
  activePlayerData: seatsInterface[],
  currentTurn: string,
  tableId: string,
): seatsInterface {
  let currentIndex: number = NUMERICAL.ZERO;
  activePlayerData.map((ele, ind) => {
    if (ele.userId == currentTurn) {
      currentIndex = ind;
    }
  })

  Logger.info(tableId," current turn seatIndex :: ", currentIndex);

  let nextPlayer: Array<seatsInterface> = [];

  if (currentIndex == activePlayerData.length - NUMERICAL.ONE) {
    for (let i = 0; i < activePlayerData.length; i++) {
      const ele = activePlayerData[i];
      if (ele.userState == PLAYER_STATE.PLAYING) {
        nextPlayer.push(activePlayerData[i]);
        break;
      }
    }
  } else {
    for (let i = currentIndex + NUMERICAL.ONE; i < activePlayerData.length; i++) {
      const ele = activePlayerData[i];
      if (ele.userState == PLAYER_STATE.PLAYING) {
        nextPlayer.push(activePlayerData[i]);
        break;
      }
      else {
        if(i+NUMERICAL.ONE == activePlayerData.length){
          i = NUMERICAL.MINUS_ONE;
        }
        for (let j = i+NUMERICAL.ONE; j < activePlayerData.length; j++) {
          const ele = activePlayerData[j];
          if (ele.userState == PLAYER_STATE.PLAYING) {
            nextPlayer.push(activePlayerData[j]);
            break;
          }
        }
      }
    }
  }
  Logger.info(tableId,"nextPlayer turn :: seatIndex :  ", nextPlayer[0].si, "nextPlayer", nextPlayer);
  return nextPlayer[0];

}

export = getNextPlayer ;











    // const currentPlayer = activePlayerData.filter(
    //   (x) => x.userId === currentTurn
    // )[0];
    // const currentIndex = currentPlayer.seatIndex;
    // const totalPlayers = activePlayerData.length;
    // let nextPlayer: defaulPlayerGamePlayInterface;
    // // let newTotalPlayers: number = NUMERICAL.ZERO;
    // // let newActiveplayerArray: Array<defaulPlayerGamePlayInterface> = [];
    // activePlayerData.map((ele, ind) => {
    //   if(ele.seatIndex == currentIndex){

    //   }
    //     // newActiveplayerArray.push(ele);
    //     // newTotalPlayers++;

    // })

    // Logger.info("==== currentIndex ===", currentIndex, "=== activePlayerData ===", activePlayerData);
    // Logger.info("====newTotalPlayers====", newTotalPlayers);




    // let arrayIndex = NUMERICAL.ZERO;
    // activePlayerData.map((ele, ind) => {
    //   if (ele.seatIndex == currentIndex) {
    //     arrayIndex = ind;
    //   }
    // })
    // Logger.info("=== arrayIndex ===", arrayIndex);

    // if(arrayIndex == newTotalPlayers-NUMERICAL.ONE){
    //   const nextIndex = NUMERICAL.ZERO;
    //   nextPlayer = newActiveplayerArray[nextIndex]
    // }
    // else if(arrayIndex > newTotalPlayers-NUMERICAL.ONE){

    //   let currentUserData = activePlayerData[arrayIndex];
    //   let nextIndex = NUMERICAL.ZERO;
    //   newActiveplayerArray.map((ele, ind) => {
    //     if(currentUserData.seatIndex + NUMERICAL.ONE == ele.seatIndex){
    //       nextIndex = ind;
    //     }
    //   })
    //   nextPlayer = newActiveplayerArray[nextIndex];
    // }
    // else{
    //   const nextIndex = arrayIndex + NUMERICAL.ONE;
    //   nextPlayer = newActiveplayerArray[nextIndex]
    // }




    // if (currentIndex ) {

    // }

    // if (currentIndex !== 0) {
    //   const nextIndex = currentIndex - 1;
    //   nextPlayer = activePlayerData.filter(
    //     (player) => player.seatIndex === nextIndex
    //   )[0];
    // } else {
    //   const nextIndex = totalPlayers - 1;
    //   nextPlayer = activePlayerData.filter(
    //     (player) => player.seatIndex === nextIndex
    //   )[0];
    // }