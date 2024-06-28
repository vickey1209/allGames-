import Joi from 'joi';

function iAmBackFormatorValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        userId : Joi.string().required(),
        tableId : Joi.string().required(),
      });
}

export = iAmBackFormatorValidator;