import Joi from "joi";

const createFlageSchema = Joi.object()
  .keys({
    gameId: Joi.string().required().description("game Id"),
    isPlayingTracking: Joi.boolean().required().description('playing tracking flage'),
    noOfLastTrakingDays: Joi.number().required().description('Number of day to track recod'),
  })
  .unknown(true);

export = createFlageSchema;