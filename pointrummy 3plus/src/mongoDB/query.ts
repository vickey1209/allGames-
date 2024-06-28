import Logger from '../logger';
// import { MONGO } from '../../constants';

/**
 * UserChat model
 */
class UserProfile {
  public collectionName: any;
  public collection: any;
  public db: any;
 
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

  async add(collectionName: string, info: any, opts = { returnOriginal: true },) {
    try {
      const inserteData = await this.db
        .collection(collectionName)
        .insertOne(info, opts);
        Logger.info('inserteData :>> ', inserteData);
      return { _id: inserteData.inserteId };
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async bulkAdd(users: any, opts = { returnOriginal: false }) {
    return this.collection.insertMany(users, opts);
  }

  async update(collectionName: string, _id: any, info: any,  opts = { returnOriginal: false }) {
    return this.db.collection(collectionName).updateOne( { _id }, info, opts );
  }

  async findAndUpate(collectionName: string, userId: any, info: any,  opts = { upsert:true, new:true }) {
    try {
      // Logger.info('object :>> ', collectionName, userId, info);
      return this.db.collection(collectionName).findOneAndUpdate( { userId }, info, opts );
    } catch (error) {
      Logger.error(error);
    }
  }

  async updateByCond(collectionName: string, where: any, info: any, opts = { returnOriginal: false }) {
    return this.db.collection(collectionName).updateOne( where, info, opts);
  }

  async get(collectionName: string, where: any) {
    return this.db.collection(collectionName).find(where).toArray();
  }
  async getlobby(collectionName: string, where: any, field: any) {
    return this.db.collection(collectionName).find(where).sort(field).toArray();
  }
  async countDocument(collectionName: string, where: any) {
    return this.db.collection(collectionName).countDocuments(where);
  }

  async getTrackedlobby(collectionName: string, where: any, start: any, limit: any) {
    return this.db.collection(collectionName).find(where).skip(start).limit(limit).toArray();
  }

  async getOne(collectionName: any, where: any) {
    return this.db.collection(collectionName).findOne(where);
  }
  async remove(collectionName: any, where: any) {
    return this.db.collection(collectionName).deleteOne(where);
  }

  async removeAll(collectionName: any, where: any) {
    return this.db.collection(collectionName).deleteMany(where)
  }
}

export = UserProfile;
