import db_pg from "./postgres.js";
import mongo from "./mongo.js";

const migrateUsers = async () => {
  try {
    const users = await db_pg.any(
      "SELECT id_user FROM users u left join user_roles ur on u.id_user = ur.user_id join roles r on r.role_id = ur.role_id WHERE r.nom <> 'admin'",
    );

    const docs = users.map((u) => ({
      id_user: u.id_user,
      avis: [],
      preferences: {
        fumer: false,
        pets: true,
      },
    }));

    if (docs.length > 0) {
      await mongo.collection("users_data").insertMany(docs);
      console.log("Users data migrated succesuly");
    } else {
      console.log("No rows to migrate");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
};

migrateUsers();
