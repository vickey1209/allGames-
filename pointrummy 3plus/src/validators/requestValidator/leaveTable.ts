import Joi from 'joi';

function leaveTableValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        userId : Joi.string().required(),
        tableId : Joi.string().required(),
        currentRound : Joi.number().required(),
        isLeaveFromScoreBoard : Joi.boolean().required(),
      });
}

export = leaveTableValidator;