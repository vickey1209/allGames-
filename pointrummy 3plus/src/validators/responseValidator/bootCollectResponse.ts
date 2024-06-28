import Joi from 'joi';

function bootCollectValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    updatedUserWallet : Joi.number().required(),
    bv: Joi.number().required(),
    tbv: Joi.number().required(),
    collectBootValueSIArray : Joi.array().required(),
    tableId : Joi.string().required(),
  });
}

const exportObject = {
  bootCollectValidator
};
export = exportObject;
