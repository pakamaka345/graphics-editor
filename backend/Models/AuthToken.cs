using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

class AuthToken {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("token")]
    [BsonRequired]
    public required string Token { get; set; }

    [BsonElement("userId")]
    [BsonRequired]
    public required string UserId { get; set; }
    
    [BsonElement("expirationDate")]
    [BsonRequired]
    public required DateTime ExpirationDate { get; set; }
}