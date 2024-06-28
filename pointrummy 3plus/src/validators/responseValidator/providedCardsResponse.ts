import Joi from 'joi';

function providedCardsValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    cards : Joi.array().items({
      group : Joi.array(),
      groupType : Joi.string(),
      cardPoints : Joi.number(),
    }).required(),
    opendDeck : Joi.array().required(),
    trumpCard : Joi.array().required(),
    closedDeck : Joi.array().required(),
    cardCount: Joi.number().required(),
    tableId: Joi.string().required(),
  });
}

const exportObject = {
  providedCardsValidator
};
export = exportObject;
