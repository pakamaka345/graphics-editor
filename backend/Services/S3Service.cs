using Amazon.S3;
using Amazon.S3.Model;
using System.Net;

public interface IS3Service
{
    Task<string> UploadFileAsync(string imageBase64, string fileName);
    Task<string> GetFileBase64Async(string fileName);
    Task DeleteFileAsync(string fileName);
}

public class S3Service : IS3Service 
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3Service(IAmazonS3 s3Client, string bucketName)
    {
        _s3Client = s3Client;
        _bucketName = bucketName;
    }

    public async Task<string> UploadFileAsync(string imageBase64, string fileName)
    {
        var base64Data = imageBase64.Split(",")[1];
        var imageType = imageBase64.Split(":")[1].Split(";")[0];
        byte[] imageBytes = Convert.FromBase64String(base64Data);

        using (var stream = new MemoryStream(imageBytes))
        {
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                InputStream = stream,
                ContentType = imageType,
                CannedACL = S3CannedACL.PublicRead
            };

            Console.WriteLine("Uploading image to S3");

            var response = await _s3Client.PutObjectAsync(request);
            if (response.HttpStatusCode == HttpStatusCode.OK) 
            {
                return $"https://{_bucketName}.s3.amazonaws.com/{fileName}";
            } else 
            {
                Console.WriteLine("Error uploading image to S3");
                throw new Exception("Error uploading image to S3");
            }
        }
    }

    public async Task<string> GetFileBase64Async(string fileName)
    {
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };

        var response = await _s3Client.GetObjectAsync(request);

        using (var stream = response.ResponseStream)
        {
            using (var memoryStream = new MemoryStream())
            {
                await stream.CopyToAsync(memoryStream);
                var base64Data = Convert.ToBase64String(memoryStream.ToArray());
                return $"data:{response.Headers.ContentType};base64,{base64Data}";
            }
        }
    }

    public async Task DeleteFileAsync(string fileName)
    {
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };

        var response = await _s3Client.DeleteObjectAsync(request);
        if (response.HttpStatusCode != HttpStatusCode.NoContent)
        {
            throw new Exception("Error deleting image from S3");
        }
    }
}