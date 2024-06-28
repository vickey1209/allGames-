import Joi from 'joi';

function joinTableResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    rejoin: Joi.boolean(),
    userId: Joi.string().required(),
    si: Joi.number().required(),
    name: Joi.string().required().allow(''),
    pp: Joi.string().required().allow(''),
    userState : Joi.string().required()
  });
}

const exportObject = {
  joinTableResponseValidator
};

export = exportObject;
