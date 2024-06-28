import Joi from 'joi';

function pickCardResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    userId : Joi.string().required(),
    si : Joi.number().required(),
    tableId : Joi.string().required(),
    cards : Joi.array().items({
      group : Joi.array(),
      groupType : Joi.string(),
      cardPoints : Joi.number(),
    }).required(),
    totalScorePoint : Joi.number().required(),
    msg : Joi.string().allow('').required(),
    pickUpCard : Joi.string().allow('').required(),
  });
}
const exportObject = {
    pickCardResponseValidator
};

export = exportObject;
