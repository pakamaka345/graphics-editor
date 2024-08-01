using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class User {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    [BsonElement("login")]
    [BsonRequired]
    public required string Login { get; set; }
    [BsonElement("email")]
    [BsonRequired]
    public required string Email { get; set; }
    [BsonElement("password")]
    [BsonRequired]
    public required string Password { get; set; }
}