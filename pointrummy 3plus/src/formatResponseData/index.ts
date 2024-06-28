import { defaultTableConfig, scoreBoardResponse, userResDataInterface, winnerResponse } from "../interfaces/tableConfig";
import { defaulPlayerGamePlayInterface } from "../interfaces/playerGamePlay";
import { defaultTableGamePlayInterface, GTIResponse } from "../interfaces/tableGamePlay";
import { UserProfileOutput } from "../interfaces/userProfile";
import { seatsInterface, SignupResponse } from "../interfaces/signup";
import { JTResponse, BootCollectResponse } from "../interfaces/tableConfig";
import { formateProvidedCardsIF, setDealerInterface, tosscardI, tossCardInterface, tossWinnerDataI } from "../interfaces/round";
import { NewGTIResponse } from "../interfaces/tableConfig";
import { StartUserTurnResponse } from "../interfaces/userTurn";
import { getPlayerGamePlay } from "../cache/playerGamePlay";
import { getUserProfile } from "../cache/userProfile";
import {
  CardSortsResponse,
  pickCardFormCloseDackResponse,
  pickCardFormOpenDackResponse,
  discardCardResponse,
  groupCardResponse,
  endDragCardResponse,
  openDeckCardsResponse,
  finishResponse,
  declareDataResponse,
  dropResponse,
  leaveTableResponse,
  gameTableInfoResponse,
  ResuffalDataResponse,
} from "../interfaces/inputOutputDataFormator";
import { EMPTY, GAMETYPE, GTI, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import Logger from "../logger";
import {
  gtiResponseFormator,
  bootCollectFormator,
  providedCardResponseFormator,
  userTurnResponseFormator,
  cardSortsResponseFormator,
  pickCardResponseFormator,
  discardCardResponseFormator,
  groupCardResponseFormator,
  endDragCardResponseFormator,
  openDeckCardsResponseFormator,
  FinishStartUserTurnResponseFormator,
  declareResponseFormator,
  winnerFormator,
  scoreBoardFormator,
  dropFormator,
  leaveTableFormator,
  SettingMenuGameTableFormator,
  tossCardResponseFormator,
  resuffalResponseFormator,
  lastDealDataFormator
} from "../validateResponse";
import { joinTableResponseFormator, setDealerResponseFormator } from "../validateResponse";
import { cards } from "../interfaces/inputOutputDataFormator";
import { userObjInterface } from "../interfaces/winner";
import { diffSeconds } from "../common";
import manageAndUpdateData from "../utils/manageCardData";
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import { getConfig } from "../config";
import formatJoinTableSeats from "../services/nextRound/helper/formatJoinTableSeats";
const { GAME_START_TIMER, LOCK_IN_TIMER, WAIT_FOR_OTHER_PLAYER_TIMER, MAXIMUM_TABLE_CREATE_LIMIT, NEXT_GAME_START_TIMER } = getConfig();

async function formatSignUpData(
  userProfileData: UserProfileOutput
): Promise<SignupResponse> {
  const tableId = userProfileData.tableId;
  try {
    const data = {
      _id: userProfileData.id,
      un: userProfileData.username,
      pp: userProfileData.profilePic,
      // isRejoin: userProfileData.isRejoin,
      socketid: userProfileData.socketId,
      tableId: userProfileData.tableId,
      gameId: userProfileData.gameId,
      lobbyId: userProfileData.lobbyId,
      chips: String(userProfileData.balance.toFixed(2)),
      isPlay: userProfileData?.isPlay,
      isRobot: userProfileData.isRobot,
      latitude: userProfileData.latitude,
      longitude: userProfileData.longitude,
      entryFee: String(userProfileData.entryFee),
      maximumSeat: userProfileData.noOfPlayer,
      maxTableCreateLimit: Number(MAXIMUM_TABLE_CREATE_LIMIT)
    };
    return data;
  } catch (error: any) {
    Logger.error(tableId, 'formatSignUpData error', error);
    throw new Error(error);
  }
}

async function formatGameTableData(
  userProfile: UserProfileOutput,
  tableConfig: defaultTableConfig,
  tableGamePlay: defaultTableGamePlayInterface,
  playerData: defaulPlayerGamePlayInterface,
  reconnect?: boolean
): Promise<GTIResponse> {
  const tableId = userProfile.tableId;
  try {
    const GAME_START: number = Number(GAME_START_TIMER);
    const NEXT_GAME_START: number = Number(NEXT_GAME_START_TIMER);
    const LOCK_TIMER: number = Number(LOCK_IN_TIMER);
    const tablePlayers: Array<seatsInterface> = [];

    const availablePlayerIds: Array<string> = tableGamePlay.seats.map(
      (e: seatsInterface): string => e.userId
    );

    const availablePlayerSeats: Array<number> = tableGamePlay.seats.map(
      (e: seatsInterface): number => e.si
    );
    const availablePlayerLength: number = availablePlayerIds.length;

    const availablePGP: Array<defaulPlayerGamePlayInterface | null> =
      await Promise.all(
        availablePlayerIds.map(async (id: string) => {
          return await getPlayerGamePlay(id.toString(), tableConfig._id);
        })
      );

    let availableUsers: Array<UserProfileOutput | null> = await Promise.all(
      availablePlayerIds.map(async (id: string) => await getUserProfile(id))
    );
    Logger.info(tableId, "availableUsers :: ", availableUsers);

    const declareingPlayersSI = <Array<number>>[];

    for (let i = 0; i < availablePlayerLength; i++) {
      const playerGamePlay = availablePGP[i];
      const userProfileData = availableUsers[i];
      const userId: string = availablePlayerIds[i];
      const playerSeat: number = availablePlayerSeats[i];

      if (playerGamePlay && userProfileData) {
        const seatPlayer: seatsInterface = {
          userId,
          si: playerSeat,
          name: userProfileData.username,
          pp: userProfileData.profilePic,
          userState: tableGamePlay.seats[i].userState
        };
        tablePlayers.push(seatPlayer);
      }
      if (playerGamePlay?.userStatus == PLAYER_STATE.PLAYING) {
        declareingPlayersSI.push(playerSeat)
      }
    }
    let declareStatus = "";
    let rTimer: number = NUMERICAL.ZERO;
    let msg : string = EMPTY;
    // let userTurnTotalTimer: number = NUMERICAL.ZERO;
    let validDeclaredPlayer: string = EMPTY;
    let validDeclaredPlayerSI: number = NUMERICAL.ZERO;
    if (reconnect) {
      Logger.info(tableId, 'tableGamePlay.tableState :>> ', tableGamePlay.tableState, "  isnextRound :: ", tableGamePlay.isnextRound);

      rTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
      if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED){
        if(!tableGamePlay.isnextRound || tableConfig.noOfPlayer === NUMERICAL.TWO){
          rTimer = Math.ceil(GAME_START - rTimer) / NUMERICAL.THOUSAND;
        }
        else{
          rTimer = Math.ceil(NEXT_GAME_START - rTimer) / NUMERICAL.THOUSAND;
        }
      }
      if (tableGamePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD)
        rTimer = Math.ceil(LOCK_TIMER - rTimer) / NUMERICAL.THOUSAND;
        msg = MESSAGES.ERROR.LOCK_IN_PEROID_MSG;
      if (tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED) {
        Logger.info(tableId, "--- formatGameTableData :: table state ::", tableGamePlay.tableState)
        if (tableGamePlay.isSeconderyTimer) {
          Logger.info(tableId, "--- formatGameTableData :: isSeconderyTimer ::", tableGamePlay.isSeconderyTimer)
          rTimer = Math.ceil(tableConfig.secondaryTimer - rTimer) / NUMERICAL.THOUSAND;
          // userTurnTotalTimer = 15;
        } else {
          Logger.info(tableId, "--- formatGameTableData :: isSeconderyTimer ::", tableGamePlay.isSeconderyTimer)
          rTimer = Math.ceil(tableConfig.userTurnTimer - rTimer) / NUMERICAL.THOUSAND;
          // userTurnTotalTimer = tableConfig.userTurnTimer / 1000
        }
      }
      if (tableGamePlay.tableState === TABLE_STATE.DECLAREING) {
        rTimer = Math.ceil(tableConfig.declareTimer - rTimer) / NUMERICAL.THOUSAND;
        declareStatus = PLAYER_STATE.DECLAREING;
      }

      if (tableGamePlay.tableState === TABLE_STATE.DECLARED) {

        rTimer = Math.ceil(tableConfig.declareTimer - rTimer) / NUMERICAL.THOUSAND;
        declareStatus = PLAYER_STATE.DECLARED;

        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const element = tableGamePlay.seats[i];
          let PGP = await getPlayerGamePlay(element.userId, tableConfig._id);
          if (PGP?.userStatus == PLAYER_STATE.WON) {
            validDeclaredPlayer = tableGamePlay.validDeclaredPlayer;
            validDeclaredPlayerSI = tableGamePlay.validDeclaredPlayerSI;
          }
        }
      }
      if (tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS) {
        rTimer = Math.ceil(Number(WAIT_FOR_OTHER_PLAYER_TIMER) - rTimer) / NUMERICAL.THOUSAND;
      }

    }

    Logger.info(tableId, " rTimer ::: ", rTimer);
    let { cards, totalScorePoint }: manageAndUpdateDataInterface =
      await manageAndUpdateData(playerData.currentCards, playerData);

    let cardCount: number = NUMERICAL.ZERO;
    playerData.currentCards.map((ele: Array<string>) => {
      cardCount = cardCount + ele.length;
    });

    if (
      tableGamePlay.tableState == TABLE_STATE.WAIT_FOR_OTHER_PLAYERS ||
      tableGamePlay.tableState == TABLE_STATE.ROUND_TIMER_STARTED ||
      tableGamePlay.tableState == TABLE_STATE.LOCK_IN_PERIOD ||
      tableGamePlay.tableState == TABLE_STATE.COLLECTING_BOOT_VALUE
    ) {
      cards = [];
      cardCount = NUMERICAL.ZERO;
    }
    Logger.info('formatGameTableData :: cards :==>> ', cards, "cardCount :: ", cardCount);

    let isRemainSeconderyTurns = false;
    if (playerData.seconderyTimerCounts < NUMERICAL.FOUR) {
      isRemainSeconderyTurns = true;
    }

    const formatedPlayersSeats = await formatJoinTableSeats(tablePlayers, Number(tableConfig.noOfPlayer), tableId)

    const data: GTIResponse = {
      isSeconderyTimer: tableGamePlay.isSeconderyTimer,
      isRemainSeconderyTurns: isRemainSeconderyTurns,
      tableId: tableConfig._id,
      userId: playerData.userId,
      seatIndex: playerData.seatIndex,
      name: userProfile.username,
      userState: playerData.userStatus,
      pp: userProfile.profilePic,
      pts: totalScorePoint,
      cardCount: cardCount,
      cards: cards,
      bv: Number(tableConfig.entryFee),
      chips: String(userProfile.balance.toFixed(2)),
      // chips: userProfile.chips,
      tableState: tableGamePlay.tableState,
      totalPlayers: Number(tableConfig.noOfPlayer),
      time: (rTimer > NUMERICAL.ZERO) ? rTimer : NUMERICAL.ZERO,
      currentTurnUserId: tableGamePlay.currentTurn,
      currentTurnSeatIndex: tableGamePlay.currentTurnSeatIndex,
      DLR: tableGamePlay.dealerPlayer,
      playersDetail: formatedPlayersSeats,
      reconnect,
      totalUserTurnTimer: tableConfig.userTurnTimer / NUMERICAL.THOUSAND,
      totalUserSeconderyTimer: tableConfig.secondaryTimer / NUMERICAL.THOUSAND,
      trumpCard: tableGamePlay.trumpCard,
      opendDeck: tableGamePlay.opendDeck,
      closedDeck: tableGamePlay.closedDeck,
      finishDeck: tableGamePlay.finishDeck,
      declareStatus,
      validDeclaredPlayer,
      validDeclaredPlayerSI,
      declareingPlayersSI,
      popupData : {msg}
    };
    return data;
  } catch (error: any) {
    Logger.error(tableId,
      `formatGameTableData error for table ${tableConfig && tableConfig._id} user ${playerData && playerData.userId ? playerData.userId : ''}`,
      error
    );
    throw new Error(`formatGameTableData error for table  ${error}`);
  }
}

async function formatJoinTableData(
  seats: seatsInterface,
  rejoin: boolean,
  userState: string
): Promise<JTResponse> {
  try {
    const data: JTResponse = {
      si: seats.si,
      userId: seats.userId,
      name: seats.name,
      pp: seats.pp,
      userState
    };
    if (rejoin) data.rejoin = rejoin;

    const validatedJoinTableResponse: JTResponse = await joinTableResponseFormator(data);
    return validatedJoinTableResponse;

  } catch (error: any) {
    Logger.error(`formatJoinTableData for table user ${error}`);
    throw new Error(`INTERNAL_ERROR_formatJoinTableData() ===>> Error::${error}`);
  }
}

async function formateUpdatedGameTableData(
  tableConfig: defaultTableConfig,
  tableGamePlay: defaultTableGamePlayInterface,
  playerData: defaulPlayerGamePlayInterface,
): Promise<NewGTIResponse> {
  const userId = playerData.userId;
  try {
    const tablePlayers: Array<seatsInterface> = [];

    const availablePlayerIds: Array<string> = tableGamePlay.seats.map(
      (e: seatsInterface): string => e.userId
    );

    const availablePlayerLength: number = availablePlayerIds.length;

    const availablePGP: Array<defaulPlayerGamePlayInterface | null> =
      await Promise.all(
        availablePlayerIds.map(async (id: string) => {
          return await getPlayerGamePlay(
            id.toString(),
            tableConfig._id,
          );
        })
      );

    const availableUsers: Array<UserProfileOutput | null> = await Promise.all(
      availablePlayerIds.map(async (id: string) => await getUserProfile(id))
    );
    // Logger.info("========availableUsers=======", availableUsers);

    for (let i = 0; i < availablePlayerLength; i++) {
      const playerGamePlay = availablePGP[i];
      const userProfileData = availableUsers[i];

      if (playerGamePlay && userProfileData) {
        const seatPlayer: seatsInterface = {
          userId: playerGamePlay.userId,
          si: playerGamePlay.seatIndex,
          name: userProfileData.username,
          pp: userProfileData.profilePic,
          userState: playerGamePlay.userStatus
        };
        tablePlayers.push(seatPlayer);
      }
    }

    const data: NewGTIResponse = {
      tableId: tableConfig._id,
      seatIndex: playerData.seatIndex,
      gameType: tableConfig.gameType,
      maximumSeat: Number(tableConfig.noOfPlayer),
      minimumSeat: Number(tableConfig.minPlayer),
      entryFee: String(tableConfig.entryFee),
      activePlayers: tableGamePlay.currentPlayerInTable,
      gameStartTimer: tableConfig.gameStartTimer,
      turnTimer: tableConfig.userTurnTimer,
      tableState: tableGamePlay.tableState,
      closedDeck: tableGamePlay.closedDeck,
      opendDeck: tableGamePlay.opendDeck,
      turnCount: tableGamePlay.turnCount,
      dealerPlayer: tableGamePlay.dealerPlayer,
      declareingPlayer: tableGamePlay.declareingPlayer,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      playersDetail: tablePlayers
    };
    const validateGTIResponse = await gtiResponseFormator(data);
    return validateGTIResponse;
  } catch (error: any) {
    Logger.error(userId,
      `formateUpdatedGameTableData for table ${tableConfig._id}  user ${playerData && playerData.userId ? playerData.userId : ''
      }`,
      error
    );
    throw new Error(error);
  }
}

async function formatBootCollectData(
  tableConfig: defaultTableConfig,
  tableGamePlay: defaultTableGamePlayInterface,
  collectBootValueSIArray: Array<number>,
  updatedUserWallet: number,
  tableId: string,
): Promise<BootCollectResponse> {
  try {
    const data = {
      updatedUserWallet: String(updatedUserWallet.toFixed(2)),
      bv: Number(tableConfig.entryFee) * NUMERICAL.EIGHTY,
      tbv: Number(tableConfig.entryFee) * tableGamePlay.currentPlayerInTable * NUMERICAL.EIGHTY,
      collectBootValueSIArray,
      tableId
    };
    const validatedBootCollectResponse: BootCollectResponse =
      await bootCollectFormator(data);
    return validatedBootCollectResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatBootCollectData for table ${tableConfig._id} `, error);
    throw new Error(`INTERNAL_ERROR_formatBootCollectData() ${error}`);
  }
}

async function formatSetDearData(
  tableId: string,
  dealerSeatIndex: number,
  currentRound: number
): Promise<setDealerInterface> {
  try {
    const data: setDealerInterface = {
      DLR: dealerSeatIndex,
      round: currentRound,
      tableId
    };
    const validatedSetDealerResponse: setDealerInterface =
      await setDealerResponseFormator(data);
    return validatedSetDealerResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatSetDearData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatSetDearData() ==>> ${error} `);
  }
}

async function formatTossCardData(
  tableId: string,
  tossCardArr: Array<tosscardI>,
  tossWinnerData: tossWinnerDataI
): Promise<tossCardInterface> {
  try {
    const data: tossCardInterface = {
      tableId,
      tossCardArr,
      tossWinnerData
    };
    const validatedTossCardResponse: tossCardInterface =
      await tossCardResponseFormator(data);
    return validatedTossCardResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatTossCardData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatTossCardData() ==>> ${error} `);
  }
}

async function formateProvidedCards(
  tableId: string,
  userId: string,
  closedDeck: Array<string>,
  opendDeck: Array<string>,
  trumpCard: Array<string>,
  cards: Array<cards>
): Promise<formateProvidedCardsIF> {
  try {
    const providedCardData: formateProvidedCardsIF = {
      cards,
      opendDeck,
      trumpCard,
      closedDeck,
      cardCount: cards[0].group.length,
      tableId
    };
    const validatedCardResponse: formateProvidedCardsIF =
      await providedCardResponseFormator(providedCardData);
    return validatedCardResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formateProvidedCards for table ${tableId} for user ${userId ? userId : ''}`, error
    );
    throw new Error(`INTERNAL_ERROR_formateProvidedCards()    Error ==>>> : ${error} `);
  }
}

async function formatStartUserTurn(
  tableConfig: defaultTableConfig,
  currentTurnUserId: string,
  currentTurnSI: number,
  isSeconderyTimer: boolean,
  isRemainSeconderyTurns: boolean,
  tableId: string,
): Promise<StartUserTurnResponse> {
  try {
    let data: StartUserTurnResponse = {} as StartUserTurnResponse;
    if (!isSeconderyTimer) {

      data = {
        isSeconderyTimer: isSeconderyTimer,
        currentTurnUserId,
        currentTurnSI,
        isRemainSeconderyTurns,
        // totalUserTurnTimer: tableConfig.userTurnTimer / NUMERICAL.THOUSAND,
        turnTimer: Number(tableConfig.userTurnTimer / NUMERICAL.THOUSAND),
        tableId
      };
    } else if (isSeconderyTimer) {
      data = {
        isSeconderyTimer: isSeconderyTimer,
        currentTurnUserId,
        currentTurnSI,
        isRemainSeconderyTurns,
        // totalUserTurnTimer: timer,
        turnTimer: Number(tableConfig.secondaryTimer / NUMERICAL.THOUSAND),
        tableId
      };
    }

    const validatedUserTurnResponse: StartUserTurnResponse =
      await userTurnResponseFormator(data);

    return validatedUserTurnResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatStartUserTurn for table ${tableConfig._id} for user ${currentTurnUserId ? currentTurnUserId : ''
      }`,
      error
    );
    Logger.info(tableId, "formatStartUserTurn() ERROR :::", error);
    throw new Error(`formatStartUserTurn() ERROR ::: ${error}`);
  }
}

async function formatCardSortsData(
  userId: string,
  tableId: string,
  cards: Array<cards>,
  totalScorePoint: number
): Promise<CardSortsResponse> {
  try {
    const data: CardSortsResponse = {
      userId,
      tableId,
      cards,
      totalScorePoint
    };
    const validatedCardSortsResponse: CardSortsResponse =
      await cardSortsResponseFormator(data);

    return validatedCardSortsResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatedCardGroupsData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatedCardGroupsData() ERROR :::", error);
    throw new Error(`formatedCardGroupsData() ERROR ::: ${error}`);
  }
}

async function formatPickCardFormCloseDackData(
  userId: string,
  seatIndex: number,
  tableId: string,
  cards: Array<cards>,
  totalScorePoint: number,
  msg: string,
  pickUpCard: string
): Promise<pickCardFormCloseDackResponse> {

  try {
    const data: pickCardFormCloseDackResponse = {
      userId,
      si: seatIndex,
      tableId,
      cards,
      totalScorePoint,
      msg,
      pickUpCard: pickUpCard
    };
    const validatedPickCardResponse: pickCardFormCloseDackResponse =
      await pickCardResponseFormator(data);

    return validatedPickCardResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatPickCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatPickCardData() ERROR :::", error);
    throw new Error(`formatPickCardData() ERROR ::: ${error}`);
  }
}

async function formatResuffalData(
  closedDeck: Array<string>,
  opendDeck: Array<string>,
  tableId: string
): Promise<ResuffalDataResponse> {

  try {
    const data: ResuffalDataResponse = {
      closedDeck,
      opendDeck,
      tableId
    };
    const validatedResuffalDataResponse: ResuffalDataResponse =
      await resuffalResponseFormator(data);

    return validatedResuffalDataResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatResuffalData ERROR`,
      error
    );
    Logger.info(tableId, "formatResuffalData() ERROR :::", error);
    throw new Error(`formatResuffalData() ERROR ::: ${error}`);
  }
}

async function formatPickCardFormOpenDackData(
  userId: string,
  seatIndex: number,
  tableId: string,
  cards: Array<cards>,
  totalScorePoint: number,
  msg: string,
  pickUpCard: string
): Promise<pickCardFormOpenDackResponse> {
  try {
    const data: pickCardFormOpenDackResponse = {
      userId,
      si: seatIndex,
      tableId,
      cards,
      totalScorePoint,
      msg,
      pickUpCard
    };
    const validatedPickCardResponse: pickCardFormOpenDackResponse =
      await pickCardResponseFormator(data);

    return validatedPickCardResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatPickCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatPickCardData() ERROR :::", error);
    throw new Error(`formatPickCardData() ERROR ::: ${error}`);
  }
}

async function formatDiscardCardData(
  userId: string,
  seatIndex: number,
  tableId: string,
  cards: Array<cards>,
  totalScorePoint: number,
  opencards: Array<string>
): Promise<discardCardResponse> {
  try {
    const data: discardCardResponse = {
      userId,
      si: seatIndex,
      tableId,
      cards,
      totalScorePoint,
      opendDeck: opencards
    };
    const validatedDiscardCardResponse: discardCardResponse =
      await discardCardResponseFormator(data);

    return validatedDiscardCardResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatDiscardCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatDiscardCardData() ERROR :::", error);
    throw new Error(`formatDiscardCardData() ERROR ::: ${error}`);
  }
}

async function formatGroupCardData(
  userId: string,
  tableId: string,
  cards: Array<cards>,
  totalScorePoint: number,
  msg: string
): Promise<groupCardResponse> {
  try {
    const data: groupCardResponse = {
      userId,
      tableId,
      cards,
      totalScorePoint,
      msg
    };

    const validatedGroupCardResponse: groupCardResponse =
      await groupCardResponseFormator(data);

    return validatedGroupCardResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatGroupCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatGroupCardData() ERROR :::", error);
    throw new Error(`formatGroupCardData() ERROR ::: ${error}`);
  }
}

async function formatEndDragCardData(
  userId: string,
  tableId: string,
  cards: Array<cards>,
  totalScorePoint: number
): Promise<endDragCardResponse> {
  try {
    const data: endDragCardResponse = {
      userId,
      tableId,
      cards,
      totalScorePoint
    };
    const validatedEndDragCardResponse: endDragCardResponse =
      await endDragCardResponseFormator(data);

    return validatedEndDragCardResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `formatedEndDragCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatedEndDragCardData() ERROR :::", error);
    throw new Error(`formatedEndDragCardData() ERROR ::: ${error}`);
  }
}

async function formatOpenDeckCardsData(
  userId: string,
  tableId: string,
  openDeckCards: string[]
): Promise<openDeckCardsResponse> {
  try {
    const data: openDeckCardsResponse = {
      userId,
      tableId,
      currentRound: NUMERICAL.ONE,
      openDeckCards
    };
    const validatedOpenDeckCardsResponse: openDeckCardsResponse =
      await openDeckCardsResponseFormator(data);

    return validatedOpenDeckCardsResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `openDeckCardsResponseFormator for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "openDeckCardsResponseFormator() ERROR :::", error);
    throw new Error(`openDeckCardsResponseFormator() ERROR ::: ${error}`);
  }
}

async function formatFinishStartUserTurn(
  declareTimer: number,
  currentTurnUserId: string,
  currentTurnSI: number,
  cards: Array<cards>,
  totalScorePoint: number,
  finishDeck: string[],
  tableId: string
): Promise<finishResponse> {
  try {
    const data: finishResponse = {
      currentTurnUserId,
      currentTurnSI,
      turnTimer: declareTimer / NUMERICAL.THOUSAND,
      cards,
      totalScorePoint,
      finishDeck,
      tableId
    };

    const validatedfinishResponse: finishResponse =
      await FinishStartUserTurnResponseFormator(data);

    return validatedfinishResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `FinishStartUserTurnResponseFormator for user ${currentTurnUserId}`,
      error
    );
    Logger.info(tableId, "FinishStartUserTurnResponseFormator() ERROR :::", error);
    throw new Error(`FinishStartUserTurnResponseFormator() ERROR ::: ${error}`);
  }
}

async function formatDeclareData(
  tableId: string,
  declareUserId: string,
  declareSI: number,
  declareTimer: number,
  siArrayOfdeclaringTimeStart: Array<number>,
  message: string,
  tableState: string
): Promise<declareDataResponse> {
  try {
    const data: declareDataResponse = {
      tableId,
      declareUserId,
      declareSI,
      declareTimer: declareTimer / NUMERICAL.THOUSAND,
      siArrayOfdeclaringTimeStart,
      message,
      tableState
    };

    const validatedDeclareResponse: declareDataResponse =
      await declareResponseFormator(data);

    return validatedDeclareResponse;
  } catch (error: any) {
    Logger.error(tableId,
      `declareResponseFormator for user ${declareUserId}`,
      error
    );
    Logger.info(tableId, "declareResponseFormator() ERROR :::", error);
    throw new Error(`declareResponseFormator() ERROR ::: ${error}`);
  }
}

async function formatWinnerData(
  winnerUserId: string,
  winnerSI: number,
  tableId: string,
  currentRound: number,
  userArray: Array<userObjInterface>
): Promise<winnerResponse> {
  try {
    let totalBootValue = NUMERICAL.ZERO;
    userArray.map((ele, ind) => {
      totalBootValue += ele.bv;
    });
    const data = {
      winnerUserId,
      winnerSI,
      tableId,
      currentRound,
      totalUsers: userArray,
      tbv: totalBootValue
    };

    const validatedWinnerResponse: winnerResponse =
      await winnerFormator(data);
    return validatedWinnerResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatWinnerData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatWinnerData() ${error}`);
  }
}

async function formatScoreBoardData(
  tableId: string,
  allUserPGP: Array<userResDataInterface>,
  trumpCard: string[],
  timer: number,
  isScoreBoardShow: boolean,
  isNewGameStart: boolean = true
): Promise<scoreBoardResponse> {
  try {
    const data = {
      tableId,
      scoreBoardTable: allUserPGP,
      trumpCard,
      timer,
      isScoreBoardShow,
      isNewGameStart
    };
    const validatedScoreBoardResponse: scoreBoardResponse =
      await scoreBoardFormator(data);
    return validatedScoreBoardResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatScoreBoardData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatScoreBoardData() ${error}`);
  }
}

async function formatNewScoreBoardData(
  tableId: string,
  allUserPGP: Array<userResDataInterface>,
  trumpCard: string[],
  timer: number,
  isScoreBoardShow: boolean,
  isNewGameStart: boolean = false
): Promise<scoreBoardResponse> {
  try {
    const data = {
      tableId,
      scoreBoardTable: allUserPGP,
      trumpCard,
      timer,
      isScoreBoardShow,
      isNewGameStart
    };
    const validatedScoreBoardResponse: scoreBoardResponse =
      await scoreBoardFormator(data);
    return validatedScoreBoardResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatScoreBoardData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatScoreBoardData() ${error}`);
  }
}

async function formatDropData(
  userName: string,
  pp: string,
  si: number,
  userId: string,
  cards: cards[],
  tableId: string,
  message: string,
): Promise<dropResponse> {
  try {
    const data = {
      userName,
      pp,
      userSI: si,
      userId,
      cards,
      tableId,
      message
    };
    const validatedDropResponse: dropResponse =
      await dropFormator(data);
    return validatedDropResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatDropData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatDropData() ${error}`);
  }
}

async function formatLeaveTableData(
  tableId: string,
  playerGamePlay: defaulPlayerGamePlayInterface,
  message: string,
  updatedUserCount: number,
  tableState: string
): Promise<leaveTableResponse> {
  try {
    const data = {
      userId: playerGamePlay.userId,
      tableId,
      currentRound: NUMERICAL.ONE,
      name: playerGamePlay.username,
      si: playerGamePlay.seatIndex,
      pp: playerGamePlay.profilePic,
      message,
      updatedUserCount,
      tableState
    };
    const validatedLeaveTableResponse: leaveTableResponse =
      await leaveTableFormator(data);
    return validatedLeaveTableResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatLeaveTableData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatLeaveTableData() ${error}`);
  }
}


async function formatRejoinTableData(
  tableConfig: defaultTableConfig,
  tableGamePlay: defaultTableGamePlayInterface,
  playerData: defaulPlayerGamePlayInterface
): Promise<NewGTIResponse> {
  try {
    const GAME_START: number = Number(GAME_START_TIMER);
    const LOCK_TIMER: number = Number(LOCK_IN_TIMER);
    const tablePlayers: Array<seatsInterface> = [];

    const availablePlayerIds: Array<string> = tableGamePlay.seats.map(
      (e: seatsInterface): string => e.userId
    );

    const availablePlayerSeats: Array<number> = tableGamePlay.seats.map(
      (e: seatsInterface): number => e.si
    );
    const availablePlayerLength: number = availablePlayerIds.length;

    const availablePGP: Array<defaulPlayerGamePlayInterface | null> =
      await Promise.all(
        availablePlayerIds.map(async (id: string) => {
          return await getPlayerGamePlay(
            id.toString(),
            tableConfig._id
          );
        })
      );

    const availableUsers: Array<UserProfileOutput | null> = await Promise.all(
      availablePlayerIds.map(async (id: string) => await getUserProfile(id))
    );

    for (let i = 0; i < availablePlayerLength; i++) {
      const playerGamePlay = availablePGP[i];
      const userProfileData = availableUsers[i];
      const userId: string = availablePlayerIds[i];
      const playerSeat: number = availablePlayerSeats[i];

      if (playerGamePlay && userProfileData) {
        const seatPlayer: seatsInterface = {
          userId,
          si: playerSeat,
          name: userProfileData.username,
          pp: userProfileData.profilePic,
          userState: playerGamePlay.userStatus
        };
        tablePlayers.push(seatPlayer);
      }
    }

    let remainingTimer =
      diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
    if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED)
      remainingTimer = GAME_START - remainingTimer;
    if (tableGamePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD)
      remainingTimer = Math.ceil(LOCK_TIMER - remainingTimer);
    if (tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED)
      remainingTimer = tableConfig.userTurnTimer - remainingTimer;

    const { cards, totalScorePoint }: manageAndUpdateDataInterface =
      await manageAndUpdateData(playerData.currentCards, playerData)

    let cardCount: number = NUMERICAL.ZERO;
    playerData.currentCards.map((ele: Array<string>) => {
      cardCount = cardCount + ele.length;
    });

    const data = {
      tableId: tableConfig._id,
      seatIndex: playerData.seatIndex,
      gameType: tableConfig.gameType,
      maximumSeat: tableConfig.noOfPlayer,
      minimumSeat: tableConfig.minPlayer,
      entryFee: String(tableConfig.entryFee),
      activePlayers: tableGamePlay.currentPlayerInTable,
      gameStartTimer: tableConfig.gameStartTimer,
      turnTimer: tableConfig.userTurnTimer,
      tableState: tableGamePlay.tableState,
      closedDeck: tableGamePlay.closedDeck,
      opendDeck: tableGamePlay.opendDeck,
      turnCount: tableGamePlay.turnCount,
      dealerPlayer: tableGamePlay.dealerPlayer,
      declareingPlayer: tableGamePlay.declareingPlayer,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      playersDetail: tablePlayers,
      reconnect: true,
    };

    return data;
  } catch (error: any) {
    Logger.error(
      `formatRejoinTableData for table ${tableConfig._id} user ${playerData && playerData.userId ? playerData.userId : ''
      }  `,
      error
    );
    throw new Error(`INTERNAL_ERROR_formatRejoinTableData() ${error} `);
  }
}

async function formatSettingMenuGameTableData(
  tableId: string,
  tableConfig: defaultTableConfig,
  tableGamePlay: defaultTableGamePlayInterface,
  playerGamePlay: defaulPlayerGamePlayInterface,
): Promise<gameTableInfoResponse> {
  try {
    const data = {
      tableId,
      gameType: GAMETYPE,
      variant: tableConfig.moneyMode,
      numberOfDeck: tableConfig.numberOfDeck,
      printedJoker: GTI.PRINTED_JOKER,
      printedValue: NUMERICAL.TEN,
      drop: GTI.DROP
    };
    const validatedSettingMenuGameTableResponse: gameTableInfoResponse =
      await SettingMenuGameTableFormator(data);
    return validatedSettingMenuGameTableResponse;
  } catch (error: any) {
    Logger.error(tableId, `formatSettingMenuGameTableData for table ${tableConfig._id} `, error);
    throw new Error(`INTERNAL_ERROR_formatSettingMenuGameTableData() ${error}`);
  }
}

async function formatLastDealData(
  lastDealData: scoreBoardResponse
): Promise<scoreBoardResponse> {
  try {
    const validatedLastDealResponse: scoreBoardResponse =
      await lastDealDataFormator(lastDealData);
    return validatedLastDealResponse;
  } catch (error: any) {
    Logger.error(`lastDealData  `, error);
    throw new Error(`INTERNAL_ERROR_lastDealData() ${error}`);
  }
}

const exportObj = {
  formatSignUpData,
  formatGameTableData,
  formatJoinTableData,
  formateUpdatedGameTableData,
  formatBootCollectData,
  formatSetDearData,
  formatTossCardData,
  formateProvidedCards,
  formatStartUserTurn,
  formatCardSortsData,
  formatPickCardFormCloseDackData,
  formatResuffalData,
  formatPickCardFormOpenDackData,
  formatDiscardCardData,
  formatGroupCardData,
  formatEndDragCardData,
  formatOpenDeckCardsData,
  formatFinishStartUserTurn,
  formatDeclareData,
  formatWinnerData,
  formatScoreBoardData,
  formatNewScoreBoardData,
  formatDropData,
  formatLeaveTableData,
  formatRejoinTableData,
  formatSettingMenuGameTableData,
  formatLastDealData

};

export = exportObj;
