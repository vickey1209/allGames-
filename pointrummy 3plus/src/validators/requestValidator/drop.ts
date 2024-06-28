import Joi from 'joi';

function dropValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        userId : Joi.string().required(),
        tableId : Joi.string().required(),
        currentRound : Joi.number().required(),
      });
}

export = dropValidator;