import Joi from 'joi';

function lastDealResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    tableId: Joi.string().required(),
    scoreBoardTable : Joi.array().items({
        userId : Joi.string().required(),
        si: Joi.number().required(),
        pp : Joi.string().required(),
        userName: Joi.string().required(),
        amount: Joi.number().required(),
        cards : Joi.array().items({
            group : Joi.array(),
            groupType : Joi.string(),
            cardPoints : Joi.number(),
          }).required(),
        score : Joi.number().required(),
        result : Joi.string().required(),
        isDeclared : Joi.boolean().required(),
    }).required(),
    trumpCard : Joi.array().items(Joi.string()).required(),
    timer : Joi.number().required(),
    isScoreBoardShow : Joi.boolean().required(),
    isNewGameStart : Joi.boolean().required(),
  });
}

export = lastDealResponseValidator;