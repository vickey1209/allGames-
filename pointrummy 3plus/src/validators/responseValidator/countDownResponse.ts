import Joi from 'joi';

function countDownResponseValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    time: Joi.number().integer().required(),
    tableId : Joi.string().required(),
  });
}

const exportObject = {
  countDownResponseValidator
};
export = exportObject;
