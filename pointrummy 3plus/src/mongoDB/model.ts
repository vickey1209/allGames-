// const Joi = require('joi');
// const JoiObjectId = require('joi-oid');
import logger from '../logger';
// import { MONGO } from '../../constants';

/**
 * UserChat model
 */
class UserProfile {
  public collectionName: any;
  public collection: any;
  public db: any;
  /**
   * initialised collection
   * @param {Instance} db
   */
  constructor(db: any) {
    // super(db);
    this.db = db;
    // this.collectionName = MONGO.CHAT;
    // this.collection = db.collection(this.collectionName);
  }

  updateCollection(collection: string) {
    this.collectionName = collection;
    this.collection = this.db.collection(this.collectionName);
  }

  /**
   * add a document to user table
   * @param {Object} info
   * @returns {Object} create document
   */
  async add(info: any, opts = { returnOriginal: true }) {
    try {
      //   const insertObj = super.beforeInsert(info);
      //   const isValidSchema = this.joiSchema().validate(insertObj);

      //   if (isValidSchema.error) throw isValidSchema.error;

      const inserteData = await this.collection.insertOne(info, opts);
      return { _id: inserteData.inserteId, ...inserteData.ops[0] };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   *
   * @param {Array} info
   * @param {Object} opts
   * @returns
   */
  async bulkAdd(users: any, opts = { returnOriginal: false }) {
    // const usersArray = users.map((e: any) => {
    //   const user = super.beforeInsert(e);
    //   const isValidSchema = this.joiSchema().validate(user);
    //   if (isValidSchema.error) throw isValidSchema.error;
    //   return isValidSchema.value;
    // });
    return this.collection.insertMany(users, opts);
  }

  /**
   *
   * @param {Object} _id
   * @param {Object} info
   * @returns {Object} updated document
   */
  async update(_id: any, info: any, opts = { returnOriginal: false }) {
    // const updateObj = super.beforeUpdate(info.$set);
    // const isValidSchema = this.joiSchema().validate(updateObj);
    // if (isValidSchema.error) throw isValidSchema.error;
    return this.collection.findOneAndUpdate(
      { _id },
      info,
      //   { $set: isValidSchema.value },
      opts,
    );
  }

  async updateByCond(where: any, info: any, opts = { returnOriginal: false }) {
    // const updateObj = super.beforeUpdate(info.$set);
    // const isValidSchema = this.joiSchema().validate(updateObj);
    // if (isValidSchema.error) throw isValidSchema.error;

    return this.collection.findOneAndUpdate(
      where,
      //   { $set: isValidSchema.value },
      info,
      opts,
    );
  }

  /**
   * Find a specific document by ID
   * @param {Object} _id
   * @returns {Object} a document
   */
  async get(where: any) {
    return this.collection.find(where).toArray();
  }

  async getOne(where: any) {
    return this.collection.findOne(where);
  }
}

export = UserProfile;
