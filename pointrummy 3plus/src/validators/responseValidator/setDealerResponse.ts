import Joi from 'joi';

function setDealerResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    DLR: Joi.number().greater(-1).required(),
    round: Joi.number().greater(-1).required(),
    tableId : Joi.string().required(),
  });
}

const exportObject = {
  setDealerResponseValidator
};
export = exportObject;
