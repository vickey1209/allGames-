const Joi = require('joi');
import Logger from '../../logger';
import Errors from '../../errors';
import createFlageSchema from '../../services/schemas/playingTrackingSchema/flageSchema';

async function playingTrackingFlageValidator(data:any) {
    try {
        Joi.assert(data, createFlageSchema);
        return data;
      } catch (error) {
        Logger.error('CATCH_ERROR : playingTrackingFlageValidator :: ', error, '-', data);
        throw new Errors.InvalidInput(error);
      }
}

const exportObject = {
    playingTrackingFlageValidator
  };
  
  export = exportObject;