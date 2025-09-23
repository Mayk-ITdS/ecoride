import { col } from "../db/mongo.js";

class MongoPreferencesService {
  async getPreferences(id_user) {
    const doc = await col.usersData().findOne({ id_user });
    return doc?.preferences ?? { fumeur: false, animaux: true, musique: true };
  }

  async upsertPreferences(id_user, preferences) {
    await col
      .usersData()
      .updateOne(
        { id_user },
        { $set: { preferences, updated_at: new Date() } },
        { upsert: true }
      );
    return { success: true };
  }
}

export default new MongoPreferencesService();
