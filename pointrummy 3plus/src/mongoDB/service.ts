/**
 * UserMessageService will be exported and will be used by dev to fetch/update/create data in db
 */
class UserChatService {
  public models: any;

  constructor(models: any) {
    this.models = models;
  }

  collection(collection: string) {
    this.models.updateCollection(collection);
  }
  /**
   *
   * @param {object} info
   * @returns created user
   */
  async sendMessage(info: any, opts: any) {
    this.models.requiredFields(info);
    return this.models.add(info, opts);
  }

  /**
   *
   * @param {object} info
   * @returns created user
   */
  async bulkAdd(info: any, opts: any) {
    await Promise.all(info.map((e: any) => this.models.requiredFields(e)));
    return this.models.bulkAdd(info, opts);
  }

  /**
   *
   * @param {objectId} _id
   * @param {object} info
   * @returns
   */
  async updateUser(playerId: any, info: any, opts: any) {
    return this.models.updateByCond(playerId, info, opts);
  }

  async getOne(where: any) {
    try {
      return this.models.getOne(where);
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async getAll(where: any) {
    try {
      return this.models.get(where);
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

export = UserChatService;
