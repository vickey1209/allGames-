import Joi from 'joi';
import Logger from "../logger";
import { countDownInterface, formateProvidedCardsIF, setDealerInterface, tossCardInterface, userCardsInterface } from "../interfaces/round";
import { NewGTIResponse, BootCollectResponse, winnerResponse, scoreBoardResponse } from '../interfaces/tableConfig';
import { bootCollectValidator } from "../validators/responseValidator/bootCollectResponse";
import { gtiResponseValidator } from '../validators/responseValidator/gtiResponse';
import { joinTableResponseValidator } from "../validators/responseValidator/joinTableResponse";
import { countDownResponseValidator } from '../validators/responseValidator/countDownResponse'
import { setDealerResponseValidator } from "../validators/responseValidator/setDealerResponse";
import { providedCardsValidator } from "../validators/responseValidator/providedCardsResponse";
import { userTurnResponseValidator } from "../validators/responseValidator/userTurnResponse";
import { cardSortsResponseValidator } from "../validators/responseValidator/sortingCardsResponse";
import { groupCardResponseValidator } from "../validators/responseValidator/groupCardResponse";
import { endDragCardResponseValidator } from "../validators/responseValidator/endDragCardResponse";
import { openDeckCardsResponseValidator } from "../validators/responseValidator/openDeckCardsResponse";
import { JTResponse } from '../interfaces/tableConfig';
import { StartUserTurnResponse } from "../interfaces/userTurn";
import {
  CardSortsResponse,
  pickCardFormCloseDackResponse,
  discardCardResponse,
  groupCardResponse,
  openDeckCardsResponse,
  finishResponse,
  declareDataResponse,
  dropResponse,
  leaveTableResponse,
  endDragCardResponse,
  gameTableInfoResponse,
  ResuffalDataResponse
} from "../interfaces/inputOutputDataFormator";
import { pickCardResponseValidator } from '../validators/responseValidator/pickCardResponse';
import { discardCardResponseValidator } from '../validators/responseValidator/discardCardsResponse';
import { finishResponseValidator } from '../validators/responseValidator/finishResponse';
import { declareResponseValidator } from '../validators/responseValidator/declareResponse';
import { winnerValidator } from '../validators/responseValidator/winnerResponse';
import { scoreBoardValidator } from '../validators/responseValidator/scoreBoardResponse';
import { dropResponseValidator } from '../validators/responseValidator/dropResponse';
import { leaveTableResponseValidator } from '../validators/responseValidator/leaveTableResponse';
import SettingMenuGameResponseValidator from '../validators/responseValidator/SettingMenuGTIResponse';
import { tossCardResponseValidator } from '../validators/responseValidator/tossCardResponse';
import { resuffalResponseValidator } from '../validators/responseValidator/resuffalCardResponse';
import lastDealResponseValidator from '../validators/responseValidator/lastDealResponse';

async function joinTableResponseFormator(
  joinTableResponse: JTResponse
): Promise<JTResponse> {
  const userId = joinTableResponse.userId;
  try {
    Joi.assert(joinTableResponse, joinTableResponseValidator());
    return joinTableResponse;
  } catch (error) {
    Logger.error(userId,error, '-', joinTableResponse);
    throw new Error(`Errot ::: ${error}`);
  }
}

async function gtiResponseFormator(
  gtiResponse: NewGTIResponse
): Promise<NewGTIResponse> {
  const tableId = gtiResponse.tableId;
  try {
    Joi.assert(gtiResponse, gtiResponseValidator());
    return gtiResponse;
  } catch (error) {
    Logger.error(tableId,error, '-', gtiResponse);
    throw new Error(`gtiResponseFormator()`)
  }
}


async function countDownResponseFormator(
  countDownData: countDownInterface
): Promise<countDownInterface> {
  const tableId = countDownData.tableId
  try {
    Joi.assert(countDownData, countDownResponseValidator());
    return countDownData;
  } catch (error) {
    Logger.error(tableId,error, '-', countDownData);
    throw new Error(`countDownResponseFormator() Erorr::${error}`);
  }
}

async function bootCollectFormator(
  bootCollectData: BootCollectResponse
  ): Promise<BootCollectResponse> {
  const tableId = bootCollectData.tableId
  try {
    Joi.assert(bootCollectData, bootCollectValidator());
    return bootCollectData;
  } catch (error) {
    Logger.error(tableId,error, '-', bootCollectData);
    throw new Error(`bootCollectFormator() ${error}`);
  }
}

async function setDealerResponseFormator(
  dealerData: setDealerInterface
): Promise<setDealerInterface> {
  const tableId = dealerData.tableId;
  try {
    Joi.assert(dealerData, setDealerResponseValidator());
    return dealerData;
  } catch (error) {
    Logger.error(tableId,error, '-', dealerData);
    Logger.info(tableId,error, '-', dealerData);

    throw new Error(` setDealerResponseFormator() ===>> ${error}`);
  }
}

async function tossCardResponseFormator(
  tossCardData: tossCardInterface
): Promise<tossCardInterface> {
  const tableId = tossCardData.tableId;
  try {
    Joi.assert(tossCardData, tossCardResponseValidator());
    return tossCardData;
  } catch (error) {
    Logger.error(tableId,error, '-', tossCardData);
    throw new Error(` tossCardResponseFormator() ===>> ${error}`);
  }
}

async function providedCardResponseFormator(
  cardData: formateProvidedCardsIF
): Promise<formateProvidedCardsIF> {
  const tableId = cardData.tableId;
  try {
    Joi.assert(cardData, providedCardsValidator());
    return cardData;
  } catch (error) {
    Logger.error(tableId,error, '-', cardData);
    throw new Error(`providedCardsValidator() ERROR ====>> `);
  }
}

async function userTurnResponseFormator(
  userTurnData: StartUserTurnResponse
): Promise<StartUserTurnResponse> {
  const tableId = userTurnData.tableId;
  try {
    Joi.assert(userTurnData, userTurnResponseValidator());
    return userTurnData;
  } catch (error) {
    Logger.error(tableId,error, '-', userTurnData);
    throw new Error(`userTurnResponseFormator() Error :: ${error}`);
  }
}


async function cardSortsResponseFormator(
  cardSortsData: CardSortsResponse
): Promise<CardSortsResponse> {
  const tableId = cardSortsData.tableId;
  try {
    Joi.assert(cardSortsData, cardSortsResponseValidator());
    return cardSortsData;
  } catch (error) {
    Logger.error(tableId,error, '-', cardSortsData);
    throw new Error(`cardGroupsResponseFormator() Error :: ${error}`);
  }
}

/** open deck and close deck commen formator */
async function pickCardResponseFormator(
  pickCardData: pickCardFormCloseDackResponse
): Promise<pickCardFormCloseDackResponse> {
  const tableId = pickCardData.tableId;
  try {
    Joi.assert(pickCardData, pickCardResponseValidator());
    return pickCardData;
  } catch (error) {
    Logger.error(tableId,error, '-', pickCardData);
    throw new Error(`pickCardResponseFormator() Error :: ${error}`);
  }
}

async function resuffalResponseFormator(
  resuffalData: ResuffalDataResponse
): Promise<ResuffalDataResponse> {
  const tableId = resuffalData.tableId;
  try {
    Joi.assert(resuffalData, resuffalResponseValidator());
    return resuffalData;
  } catch (error) {
    Logger.error(tableId,error, '-', resuffalData);
    throw new Error(`resuffalResponseFormator() Error :: ${error}`);
  }
}

async function discardCardResponseFormator(
  discardCardData: discardCardResponse
): Promise<discardCardResponse> {
  const tableId = discardCardData.tableId;
  try {
    Joi.assert(discardCardData, discardCardResponseValidator());
    return discardCardData;
  } catch (error) {
    Logger.error(tableId,error, '-', discardCardData);
    throw new Error(`discardCardResponseFormator() Error :: ${error}`);
  }
}

async function groupCardResponseFormator(
  groupCardData: groupCardResponse
): Promise<groupCardResponse> {
  const tableId = groupCardData.tableId;
  try {
    Joi.assert(groupCardData, groupCardResponseValidator());
    return groupCardData;
  } catch (error) {
    Logger.error(tableId,error, '-', groupCardData);
    throw new Error(`groupCardResponseFormator() Error :: ${error}`);
  }
}

async function endDragCardResponseFormator(
  endDragCardData: endDragCardResponse
): Promise<endDragCardResponse> {
  const tableId = endDragCardData.tableId;
  try {
    Joi.assert(endDragCardData, endDragCardResponseValidator());
    return endDragCardData;
  } catch (error) {
    Logger.error(tableId,error, '-', endDragCardData);
    throw new Error(`groupCardResponseFormator() Error :: ${error}`);
  }
}

async function openDeckCardsResponseFormator(
  openDeckCardsData: openDeckCardsResponse
): Promise<openDeckCardsResponse> {
  const tableId = openDeckCardsData.tableId;
  try {
    Joi.assert(openDeckCardsData, openDeckCardsResponseValidator());
    return openDeckCardsData;
  } catch (error) {
    Logger.error(tableId,error, '-', openDeckCardsData);
    throw new Error(`openDeckCardsResponseFormator() Error :: ${error}`);
  }
}

async function FinishStartUserTurnResponseFormator(
  finishData: finishResponse
): Promise<finishResponse> {
  const tableId = finishData.tableId;
  try {
    Joi.assert(finishData, finishResponseValidator());
    return finishData;
  } catch (error) {
    Logger.error(tableId,error, '-', finishData);
    throw new Error(`FinishStartUserTurnResponseFormator() Error :: ${error}`);
  }
}

async function declareResponseFormator(
  declareData: declareDataResponse
): Promise<declareDataResponse> {
  const tableId = declareData.tableId;
  try {
    Joi.assert(declareData, declareResponseValidator());
    return declareData;
  } catch (error) {
    Logger.error(tableId,error, '-', declareData);
    throw new Error(`FinishStartUserTurnResponseFormator() Error :: ${error}`);
  }
}

async function winnerFormator(
  winnerData: winnerResponse
): Promise<winnerResponse> {
  const tableId = winnerData.tableId;
  try {
    Joi.assert(winnerData, winnerValidator());
    return winnerData;
  } catch (error) {
    Logger.error(tableId,error, '-', winnerData);
    throw new Error(`winnerFormator() ${error}`);
  }
}

async function scoreBoardFormator(
  scoreBoardData: scoreBoardResponse
): Promise<scoreBoardResponse> {
  const tableId = scoreBoardData.tableId;
  try {
    Joi.assert(scoreBoardData, scoreBoardValidator());
    return scoreBoardData;
  } catch (error) {
    Logger.error(tableId,error, '-', scoreBoardData);
    throw new Error(`scoreBoardFormator() ${error}`);
  }
}

async function dropFormator(
  dropData: dropResponse
): Promise<dropResponse> {
  const tableId = dropData.tableId;
  try {
    Joi.assert(dropData, dropResponseValidator());
    return dropData;
  } catch (error) {
    Logger.error(tableId,error, '-', dropData);
    throw new Error(`dropFormator() ${error}`);
  }
}

async function leaveTableFormator(
  leaveData: leaveTableResponse
): Promise<leaveTableResponse> {
  const tableId = leaveData.tableId;
  try {
    Joi.assert(leaveData, leaveTableResponseValidator());
    return leaveData;
  } catch (error) {
    Logger.error(tableId,error, '-', leaveData);
    throw new Error(`leaveTableFormator() ${error}`);
  }
}

async function SettingMenuGameTableFormator(
  SettingMenuGTIData: gameTableInfoResponse
): Promise<gameTableInfoResponse> {
  const tableId = SettingMenuGTIData.tableId;
  try {
    Joi.assert(SettingMenuGTIData, SettingMenuGameResponseValidator());
    return SettingMenuGTIData;
  } catch (error) {
    Logger.error(tableId,error, '-', SettingMenuGTIData);
    throw new Error(`SettingMenuGameTableFormator() ${error}`);
  }
}


async function lastDealDataFormator(
  lastDealData: scoreBoardResponse
): Promise<scoreBoardResponse> {
  const tableId = lastDealData.tableId;
  try {
    Joi.assert(lastDealData, lastDealResponseValidator());
    return lastDealData;
  } catch (error) {
    Logger.error(tableId,error, '-', lastDealData);
    throw new Error(`lastDealDataFormator() ${error}`);
  }
}


const exportedObject = {
  gtiResponseFormator,
  joinTableResponseFormator,
  countDownResponseFormator,
  bootCollectFormator,
  setDealerResponseFormator,
  tossCardResponseFormator,
  providedCardResponseFormator,
  userTurnResponseFormator,
  cardSortsResponseFormator,
  pickCardResponseFormator,
  resuffalResponseFormator,
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
  lastDealDataFormator

};

export = exportedObject;
