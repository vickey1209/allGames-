import Joi from 'joi';

function signupFormatorValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    accessToken: Joi.string(),
    minPlayer: Joi.number().required(),
    noOfPlayer: Joi.number().required(),
    lobbyId: Joi.string().required(),
    isUseBot: Joi.boolean().required(),
    entryFee: Joi.string().required(),
    moneyMode: Joi.string().allow('').required(),
    userName: Joi.string().required(),
    userId: Joi.string().required(),
    profilePic: Joi.string().required(),
    gameId: Joi.string().required(),
    isFTUE: Joi.boolean().required(),
    gameModeId : Joi.string().allow('').required(),
    rummyType : Joi.string().required(),
    latitude : Joi.string(),
    longitude : Joi.string(),
  })
  .unknown(true);
}

export = signupFormatorValidator;