import Joi from 'joi';

function SettingMenuGameResponseValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        tableId : Joi.string().required(), 
        gameType : Joi.string().required(), 
        variant : Joi.string().required(), 
        numberOfDeck : Joi.number().required(), 
        printedJoker : Joi.string().required(), 
        printedValue : Joi.number().required(),
        drop : Joi.any().required(), 
      });
}

export = SettingMenuGameResponseValidator;