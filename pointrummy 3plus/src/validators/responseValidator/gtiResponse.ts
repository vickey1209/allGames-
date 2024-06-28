import Joi from 'joi';

function gtiResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    tableId: Joi.string().required(),
    seatIndex: Joi.number().required(),
    gameType: Joi.string().required(),
    entryFee: Joi.number().required(),
    maximumSeat: Joi.number().required(),
    minimumSeat: Joi.number().required(),
    activePlayers: Joi.number().required(),
    gameStartTimer: Joi.number().greater(-1).required(),
    turnCount : Joi.number().required(),
    turnTimer: Joi.number().greater(-1).required(),
    tableState: Joi.string().required(),
    closedDeck: Joi.array().items(Joi.string()).required(),
    opendDeck: Joi.array().items(Joi.string()).required(),
    dealerPlayer: Joi.number().required(),
    declareingPlayer: Joi.string().allow("").required(),
    validDeclaredPlayer : Joi.string().allow("").required(),
    validDeclaredPlayerSI : Joi.number().required(),
    playersDetail: Joi.array().items(
      Joi.object().keys({
        userId: Joi.string().required(),
        si: Joi.number().integer().required(),
        name: Joi.string().allow("").required(),
        pp: Joi.string().required(),
        userState : Joi.string().required(),
      })
    )
  });
}

const exportObject = {
  gtiResponseValidator
};

export = exportObject;
