import Joi from 'joi';

function openDeckCardsResponseValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        userId: Joi.string().required(),
        tableId: Joi.string().required(),
        currentRound: Joi.number().required(),
        openDeckCards: Joi.array().items(Joi.any()),
    })
}

const exportObject = {
    openDeckCardsResponseValidator
};

export = exportObject;