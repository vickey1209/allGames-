import Joi from 'joi';
const JoiObjectId = require('joi-oid');

class PlayerGamePlay {
  joiSchema() {
    return Joi.object().keys({
      _id: JoiObjectId.string(),
      userId : Joi.string().required(),
      username : Joi.string().allow('').required(),
      profilePic : Joi.string().required(),
      seatIndex : Joi.number().required(),
      userStatus: Joi.string().required(),
      playingStatus : Joi.string().allow('').required(),
      tCount: Joi.number().required(),
      cardPoints: Joi.number().required(),
      lastPickCard: Joi.string().allow('').required(),
      pickFromDeck : Joi.string().allow('').required(),
      currentCards: Joi.array().items(Joi.any()).default([]).required(),
      groupingCards: Joi.object().keys({
        pure:Joi.array().items(Joi.any()).default([]).required(),
        impure:Joi.array().items(Joi.any()).default([]).required(),
        set:Joi.array().items(Joi.any()).default([]).required(),
        dwd:Joi.array().items(Joi.any()).default([]).required(),
      }),
      seconderyTimerCounts: Joi.number().required(),
      turnTimeOut: Joi.number().required(),
      winningCash: Joi.number().required(),
      looseingCash : Joi.number().required(),
      isDropAndMove : Joi.boolean().required(),
      dropScore : Joi.number().required(),
      ispickCard : Joi.boolean().required(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
    });
  }
}
export = PlayerGamePlay;
