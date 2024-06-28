import Joi from 'joi';

function userTurnResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    currentTurnUserId:Joi.string().required(),
    currentTurnSI:Joi.number().required(),
    turnTimer:Joi.number().required(),
    // totalUserTurnTimer:Joi.number().required(),
    isSeconderyTimer : Joi.boolean().required(),
    isRemainSeconderyTurns : Joi.boolean().required(),
    tableId : Joi.string().required(),
  });
}

const exportObject = {
  userTurnResponseValidator
};

export = exportObject;
