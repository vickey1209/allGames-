import Joi from 'joi';

function discardCardResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    userId : Joi.string().required(),
    si : Joi.number().required(),
    tableId : Joi.string().required(),
    cards : Joi.array().items({
      group : Joi.array(),
      groupType : Joi.string(),
      cardPoints : Joi.number(),
    }).required(),
    totalScorePoint : Joi.number(),
    opendDeck : Joi.array()
  });
}
const exportObject = {
    discardCardResponseValidator
};

export = exportObject;