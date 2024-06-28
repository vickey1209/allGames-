import Joi from 'joi';

function winnerValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    winnerUserId : Joi.string().required(),  
    winnerSI: Joi.number().required(),
    tableId: Joi.string().required(),
    currentRound : Joi.number().required(),
    totalUsers : Joi.array().items({
      userId : Joi.string().required(),
      si : Joi.number().required(),
      bv: Joi.number().greater(-1).required(),
    }),
    tbv: Joi.number().greater(-1).required()
  });
}

const exportObject = {
    winnerValidator
};
export = exportObject;