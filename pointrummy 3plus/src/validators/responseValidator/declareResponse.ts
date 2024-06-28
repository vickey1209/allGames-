import Joi from 'joi';

function declareResponseValidator(): Joi.ObjectSchema {
    return Joi.object().keys({
        tableId: Joi.string().required(),
        declareUserId: Joi.string().required(),
        declareSI: Joi.number().required(),
        declareTimer : Joi.number().required(),
        siArrayOfdeclaringTimeStart : Joi.any(),
        message: Joi.string().required(),
        tableState  : Joi.string().required(),
    })
}

const exportObject = {
    declareResponseValidator
};

export = exportObject;