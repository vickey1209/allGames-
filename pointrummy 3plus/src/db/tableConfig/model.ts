import Joi from 'joi';
class TableConfiguration {
  joiSchema() {
    return Joi.object().keys({
      _id: Joi.string().required(),
      gameType: Joi.string().required(),
      currentRound: Joi.number().required(),
      lobbyId: Joi.string().required(),
      gameId : Joi.string().required(),
      multiWinner: Joi.boolean().required(),
      maximumPoints: Joi.number().required(),
      minPlayer: Joi.number().required(),
      noOfPlayer: Joi.number().required(),
      gameStartTimer: Joi.number().required(),
      userTurnTimer: Joi.number().required(),
      secondaryTimer: Joi.number().required(),
      declareTimer: Joi.number().required(),
      entryFee: Joi.number().required(),
      moneyMode : Joi.string().required(),
      numberOfDeck : Joi.number().required(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
    });
  }
}
export = TableConfiguration;
