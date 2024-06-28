import Joi from 'joi';

function saveCardsInGroupsValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        userId : Joi.string().required(),
        tableId : Joi.string().required(),
        currentRound : Joi.number().required()
      });
}

export = saveCardsInGroupsValidator;