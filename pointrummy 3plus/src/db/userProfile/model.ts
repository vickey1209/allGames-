import Joi from 'joi';

class UserProfile {
    joiSchema() {
      return Joi.object().keys({
        id: Joi.string().required(),
        username: Joi.string().allow(''),
        userId: Joi.string().required(),
        profilePic: Joi.string().allow(''),
        // isRejoin: Joi.boolean().required(),
        socketId: Joi.string().allow(''),
        tableId: Joi.string().allow(''),
        tableIds: Joi.array().default([]),
        gameId: Joi.string().required(),
        lobbyId: Joi.string().allow(''),
        entryFee : Joi.number().required(),
        noOfPlayer : Joi.number().required(),
        isPlay: Joi.boolean(),
        isUseBot : Joi.boolean().required(),
        isFTUE : Joi.boolean().required(),
        isRobot : Joi.boolean().required(),
        createdAt: Joi.string(),
        updatedAt: Joi.string(),
        latitude : Joi.string().required(),
        longitude : Joi.string().required(),
        oldTableId : Joi.array().default([]).required(),
        gameType : Joi.string().required(),
        authToken : Joi.string().required(),
        isAnyRunningGame : Joi.boolean().required(),
        balance : Joi.number().required(),

      });
  }
}

export = UserProfile;