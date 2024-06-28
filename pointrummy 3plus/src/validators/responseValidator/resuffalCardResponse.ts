import Joi from 'joi';

function resuffalResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    opendDeck : Joi.array().required(),
    closedDeck : Joi.array().required(),
    tableId : Joi.string().required(),
  });
}

const exportObject = {
    resuffalResponseValidator
};
export = exportObject;