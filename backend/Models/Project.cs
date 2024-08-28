using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

public class Project {
    [BsonId] 
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("name")]
    [BsonRequired]
    public required string Name { get; set; }
    
    [BsonElement("userId")]
    [BsonRequired]
    public required string UserId { get; set; }

    [BsonElement("width")]
    [BsonRequired]
    public required int Width { get; set; }

    [BsonElement("height")]
    [BsonRequired]
    public required int Height { get; set; }

    [BsonElement("collaborators")]
    public List<string> Collaborators { get; set; } = new List<string>();

    [BsonElement("createdDate")]
    [BsonRequired]
    public required DateTime CreatedDate { get; set; }

    [BsonElement("lastModifiedDate")]
    [BsonRequired]
    public required DateTime LastModifiedDate { get; set; }

    [BsonElement("image")]
    public string? Image { get; set; }

    [BsonElement("previewImage")]
    public string? PreviewImage { get; set; }

}