// const Joi = require('joi');
import Joi from "joi";

const LobbyEntrySchema = Joi.object()
.keys({
    tableId: Joi.string().required().description('tableId'),
    lobbyId: Joi.string().required().description('Lobby id'),
    entryFee: Joi.string().required().description('lobby entryFee'),
    // winningAmount: Joi.string().required().description('lobby winning amount'),
    noOfPlayer: Joi.string().required().description('max player in table'),
    totalRound: Joi.number().integer().required().description('total tound play'),
    createdAt: Joi.date().required().description("currant date")
}).unknown(true);
    

export = LobbyEntrySchema;