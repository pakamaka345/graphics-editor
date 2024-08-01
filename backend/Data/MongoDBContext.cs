using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDb");
        var mongoClient = new MongoClient(connectionString);
        _database = mongoClient.GetDatabase("graphics-editor");
    }

    public IMongoCollection<BsonDocument> GetCollection(string collectionName)
    {
        return _database.GetCollection<BsonDocument>(collectionName);
    }

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}