import Joi from 'joi';

function leaveTableResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    userId : Joi.string().required(),
    tableId : Joi.string().required(),
    currentRound : Joi.number().required(),
    si : Joi.number().required(),
    pp : Joi.string().required(),
    name : Joi.string().required(),
    message : Joi.string().required(),    
    updatedUserCount : Joi.number().required(),
    tableState : Joi.string().required(),
  });
}
const exportObject = {
    leaveTableResponseValidator
};

export = exportObject;