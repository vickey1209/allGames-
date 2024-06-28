import Joi from 'joi';

function groupCardResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    userId : Joi.string().required(),
    tableId : Joi.string().required(),
    cards : Joi.array().items({
      group : Joi.array(),
      groupType : Joi.string(),
      cardPoints : Joi.number(),
    }).required(),
    totalScorePoint : Joi.number(),
    msg : Joi.string().allow('').required()
  });
}
const exportObject = {
    groupCardResponseValidator
};

export = exportObject;