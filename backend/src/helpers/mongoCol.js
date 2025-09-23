export default function getCollection(mongoLike, name) {
  if (mongoLike && typeof mongoLike.collection === "function")
    return mongoLike.collection(name);
  if (mongoLike && typeof mongoLike.db === "function") {
    const dbName = process.env.MONGO_DB || "ecorideMongo";
    return mongoLike.db(dbName).collection(name);
  }
  if (mongoLike && mongoLike.collectionName) return mongoLike;
  throw new Error("Unable to resolve Mongo collection. Check mongo.js export.");
}
