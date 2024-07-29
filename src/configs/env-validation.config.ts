import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  SERVER_PORT: Joi.number().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().required(),

  PASSWORD_HASH_ROUNDS: Joi.number().required().default(10),
  ACCESS_SECRET_KEY: Joi.string().required(),

  NODE_MAILER_ID: Joi.string().required(),
  NODE_MAILER_PASSWORD: Joi.string().required(),
});
