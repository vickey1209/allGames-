// import UserProfileService from './service';
// import UserProfileModel from './model';
const { ObjectID } = require('mongodb');
import query from './query';

class DB {
  public mongoClient: any;
  public mongo: any;
  public mongoQuery: any;
  public ObjectId: any;

  init(db: any, client: any) {
    this.mongoClient = client;
    this.ObjectId = ObjectID;
    // this.mongo = new UserProfileService(new UserProfileModel(db));
    this.mongoQuery = new query(db);
  }
}

/**
 * exports db model services, it will be used to devs to fetch,insert or update data to databse
 */
export = new DB();
