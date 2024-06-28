import Joi from 'joi';

function endDragCardValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        userId : Joi.string().required(),
        tableId : Joi.string().required(),
        currentRound : Joi.number().required(),
        cards : Joi.array().items({
          card : Joi.string().required(),
          groupIndex : Joi.number().required()
        }).required(),
        destinationGroupIndex : Joi.number().required(),
        cardIndexInGroup : Joi.number().required(),
      });
}

export = endDragCardValidator;