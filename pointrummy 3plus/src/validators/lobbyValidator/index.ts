const Joi = require('joi');
import Logger from '../../logger';
import Errors from '../../errors';
import { LobbyEntrySchema } from '../../services/schemas/lobbySchemas';
import { setLobbyIf } from '../../interfaces/tableTrackingIf';


async function lobbyEntryValidator(data:setLobbyIf) {
  try {
    Joi.assert(data, LobbyEntrySchema);
    return data;
  } catch (error) {
    Logger.error('CATCH_ERROR : lobbyEntryValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

const exportObject = {
  lobbyEntryValidator
};

export = exportObject;
