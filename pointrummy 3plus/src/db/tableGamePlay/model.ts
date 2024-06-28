import Joi from 'joi';

class TableGamePlay {

  joiSchema() {
    return Joi.object().keys({
      _id: Joi.string().required(),
      trumpCard : Joi.array().items(Joi.string()).default([]).required(),
      closedDeck : Joi.array().items(Joi.string()).default([]).required(),
      opendDeck : Joi.array().items(Joi.string()).default([]).required(),
      finishDeck: Joi.array().items(Joi.string()).default([]).required(), 
      tossWinPlayer : Joi.number().required(),
      dealerPlayer : Joi.number().required(),
      declareingPlayer : Joi.string().allow("").required(),
      validDeclaredPlayer: Joi.string().allow("").required(),
      validDeclaredPlayerSI : Joi.number().required(),
      finishCount : Joi.array().items(Joi.string()).default([]),
      isTurn : Joi.boolean().required(),
      isnextRound : Joi.boolean().required(),
      discardedCardsObj : Joi.array().items({
        userId: Joi.string(),
        card: Joi.string(),
        seatIndex : Joi.number(),
      }).default([]),
      potValue : Joi.number().required(),
      currentTurn : Joi.string().allow('').required(),
      turnCount : Joi.number().required(),
      totalPickCount : Joi.number().required(),
      currentPlayerInTable : Joi.any().required(),
      currentTurnSeatIndex : Joi.any(),
      tableState : Joi.string().required(),
      seats: Joi.array().items({
        userId: Joi.string().required(),
        si: Joi.number().required(),
        name :Joi.string().required(),
        pp:Joi.string().required(),
        rejoin : Joi.boolean(),
        userState: Joi.string().required()
      }).default([]).required(),
      tableCurrentTimer : Joi.any().required(),
      gameType : Joi.string().required(),
      isSeconderyTimer : Joi.boolean().required(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
    });
  }
}

export = TableGamePlay;
