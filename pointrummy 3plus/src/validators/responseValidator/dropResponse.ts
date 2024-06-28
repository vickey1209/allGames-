import Joi from 'joi';

function dropResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    userName:Joi.string().required(),
    pp: Joi.string().required(),
    userId : Joi.string().required(),
    tableId : Joi.string().required(),
    userSI : Joi.number().required(),
    cards : Joi.array().items({
      group : Joi.array(),
      groupType : Joi.string(),
      cardPoints : Joi.number(),
    }).required(),
    message : Joi.string().required(),
  });
}
const exportObject = {
    dropResponseValidator
};

export = exportObject;