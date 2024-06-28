import Joi from 'joi';
import saveCardsInSortsValidator  from "../validators/requestValidator/saveCardsInSort";
import pickCardFormCloseDackValidator from "../validators/requestValidator/pickCardFromCloseDack";
import pickCardFormOpenDackValidator from "../validators/requestValidator/pickCardFromOpenDack";
import discardCardValidator from "../validators/requestValidator/discardCard";
import groupCardValidator from "../validators/requestValidator/groupCard";
import endDragCardValidator from "../validators/requestValidator/endDragCard";
import openDeckCardsValidator from '../validators/requestValidator/openDeckCards';
import finishValidator from "../validators/requestValidator/finish";
import { 
  saveCardsInSortsInput, 
  pickCardFormCloseDackInput, 
  pickCardFormOpenDackInput, 
  discardCardInput, 
  groupCardInput, 
  endDragCardInput, 
  openDeckCardsInput, 
  finishInput,
  declareDataInput,
  dropInput,
  leaveTableInput,
  gameTableInfoInput,
  lastDealInput,
  switchTableInput
} from "../interfaces/inputOutputDataFormator";
import declareDataValidator from '../validators/requestValidator/declare';
import dropValidator from '../validators/requestValidator/drop';
import leaveTableValidator from '../validators/requestValidator/leaveTable';
import { iamBackInputInterface } from '../interfaces/iAmBack';
import iAmBackFormatorValidator from '../validators/requestValidator/iAmBack';
import gameTableInfoFormatorValidator from '../validators/requestValidator/settingMenuGameTableInfo';
import { SignupInput } from '../interfaces/signup';
import signupFormatorValidator from '../validators/requestValidator/signup';
import lastDealFormatorValidator from '../validators/requestValidator/lastDeal';
import Errors from "../errors";
import switchTableValidator from '../validators/requestValidator/switchTable';


async function signupFormator(signUpData: SignupInput): Promise<SignupInput> {
  try {
    Joi.assert(signUpData, signupFormatorValidator());
    return signUpData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function saveCardsInSortsFormator(saveCards: saveCardsInSortsInput): Promise<saveCardsInSortsInput> {
    try {
      Joi.assert(saveCards, saveCardsInSortsValidator());
      return saveCards;
    } catch (error) {
      throw new Errors.InvalidInput(error);
    }
  }

async function pickCardFormCloseDackFormator(pickCard: pickCardFormCloseDackInput): Promise<pickCardFormCloseDackInput> {
    try {
      Joi.assert(pickCard, pickCardFormCloseDackValidator());
      return pickCard;
    } catch (error) {
      throw new Errors.InvalidInput(error);
    }
}

async function pickCardFormOpenDackFormator(pickCard: pickCardFormOpenDackInput): Promise<pickCardFormOpenDackInput> {
  try {
    Joi.assert(pickCard, pickCardFormOpenDackValidator());
    return pickCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function discardCardFormator(discardCard: discardCardInput): Promise<discardCardInput> {
  try {
    Joi.assert(discardCard, discardCardValidator());
    return discardCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function groupCardFormator(groupCard: groupCardInput): Promise<groupCardInput> {
  try {
    Joi.assert(groupCard, groupCardValidator());
    return groupCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function endDragCardFormator(endDragCard: endDragCardInput): Promise<endDragCardInput> {
  try {
    Joi.assert(endDragCard, endDragCardValidator());
    return endDragCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function openDeckCardsFormator(openDeckCards: openDeckCardsInput): Promise<openDeckCardsInput> {
  try {
    Joi.assert(openDeckCards, openDeckCardsValidator());
    return openDeckCards;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function finishFormator(finish: finishInput): Promise<finishInput> {
  try {
    Joi.assert(finish, finishValidator());
    return finish;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function declareDataFormator(declareData: declareDataInput): Promise<declareDataInput> {
  try {
    Joi.assert(declareData, declareDataValidator());
    return declareData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function dropFormator(dropData: dropInput): Promise<dropInput> {
  try {
    Joi.assert(dropData, dropValidator());
    return dropData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function leaveTableFormator(leaveTableData: leaveTableInput): Promise<leaveTableInput> {
  try {
    Joi.assert(leaveTableData, leaveTableValidator());
    return leaveTableData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}


async function iAmBackFormator(
  iamBackInput: iamBackInputInterface
): Promise<iamBackInputInterface> {
  try {
    Joi.assert(iamBackInput, iAmBackFormatorValidator());
    return iamBackInput;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function gameTableInfoFormator(
  GTIData: gameTableInfoInput
): Promise<gameTableInfoInput> {
  try {
    Joi.assert(GTIData, gameTableInfoFormatorValidator());
    return GTIData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function lastDealFormator(
  lastDealData: lastDealInput
): Promise<lastDealInput> {
  try {
    Joi.assert(lastDealData, lastDealFormatorValidator());
    return lastDealData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}

async function switchTableFormator(switchTable: switchTableInput): Promise<switchTableInput> {
  try {
    Joi.assert(switchTable, switchTableValidator());
    return switchTable;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
}


const exportedObject = {
    signupFormator,
    saveCardsInSortsFormator,
    pickCardFormCloseDackFormator,
    pickCardFormOpenDackFormator,
    discardCardFormator,
    groupCardFormator,
    endDragCardFormator,
    openDeckCardsFormator,
    finishFormator,
    declareDataFormator,
    dropFormator,
    leaveTableFormator,
    iAmBackFormator,
    gameTableInfoFormator,
    lastDealFormator,
    switchTableFormator
};
  
  export = exportedObject;