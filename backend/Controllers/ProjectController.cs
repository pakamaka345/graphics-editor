using System.Collections.Concurrent;
using System.Drawing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IImageService _imageService;
    private readonly ITokenService _tokenService;
    private readonly IS3Service _s3Service;

    public ProjectController(MongoDbContext context, IImageService imageService, ITokenService tokenService, IS3Service s3Service)
    {
        _context = context;
        _imageService = imageService;
        _tokenService = tokenService;
        _s3Service = s3Service;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] ProjectCreateModel model)
    {
        var project = new Project
        {
            Name = model.Name,
            Width = model.Width,
            Height = model.Height,
            UserId = model.UserId,
            CreatedDate = DateTime.Now,
            LastModifiedDate = DateTime.Now,
            Image = "",
            PreviewImage = ""
        };

        string image = await _imageService.CreateImage(model.Width, model.Height);
        string previewImage = await _imageService.CompressImage(image);

        try {
            var imageUrl = await _s3Service.UploadFileAsync(image, project.Id);
            var previewImageUrl = await _s3Service.UploadFileAsync(previewImage, project.Id + "_preview");
            
            project.Image = imageUrl;
            project.PreviewImage = previewImageUrl;

            await _context.GetCollection<Project>("projects").InsertOneAsync(project);

            return Ok(new { id = project.Id });
        } catch (Exception ex) {
            Console.WriteLine(ex.Message);
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromBody] ProjectUploadModel model)
    {
        var project = new Project
        {
            Name = model.Name,
            Width = model.Width,
            Height = model.Height,
            UserId = model.UserId,
            CreatedDate = DateTime.Now,
            LastModifiedDate = DateTime.Now,
            Image = "",
            PreviewImage = ""
        };
        try {
            var imageUrl = await _s3Service.UploadFileAsync(model.Image, project.Id);
            var previewImageUrl = await _s3Service.UploadFileAsync(await _imageService.CompressImage(model.Image), project.Id + "_preview");

            await _context.GetCollection<Project>("projects").InsertOneAsync(project);

            return Ok(new { id = project.Id });
        } catch (Exception ex) {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProjects([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var authorizationHeader = Request.Headers["Authorization"].ToString();
            var token = authorizationHeader.Substring("Bearer ".Length).Trim();

            var userId = await _tokenService.GetUserIdBytoken(token);
            var projects = await _context.GetCollection<Project>("projects")
                                         .Find(p => p.UserId == userId)
                                         .SortByDescending(p => p.LastModifiedDate)
                                         .Skip((pageNumber - 1) * pageSize)
                                         .Limit(pageSize)
                                         .ToListAsync();

            if (projects == null || projects.Count == 0)
            {
                return NotFound("No projects found.");
            }

            var tasks = projects.Select(async p => {
                return new ProjectsGetModel
                {
                    Id = p.Id,
                    Name = p.Name,
                    CollaboratorsCount = p.Collaborators?.Count ?? 0,
                    ImagePreview = await _s3Service.GetFileBase64Async(p.Id + "_preview"),
                    CreatedAt = p.CreatedDate,
                    LastUpdatedAt = p.LastModifiedDate
                };
            });

            var result = await Task.WhenAll(tasks);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(string id)
    {
        var project = await _context.GetCollection<Project>("projects")
                                    .Find(p => p.Id == id)
                                    .FirstOrDefaultAsync();

        if (project == null) return NotFound("Project not found.");
        
        var image = await _s3Service.GetFileBase64Async(project.Id);
        return Ok(new { name = project.Name, image });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        var project = await _context.GetCollection<Project>("projects")
                                    .Find(p => p.Id == id)
                                    .FirstOrDefaultAsync();

        if (project == null) return NotFound("Project not found.");

        await _context.GetCollection<Project>("projects").DeleteOneAsync(p => p.Id == id);
        try {
            await _s3Service.DeleteFileAsync(project.Id);
            await _s3Service.DeleteFileAsync(project.Id + "_preview");
        } catch (Exception ex) {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }

        return Ok("Project deleted successfully.");
    }

    [HttpPut("{imageId}")]
    public async Task<IActionResult> SaveProject(string imageId, [FromBody] SaveProjectModel model)
    {
        var project = await _context.GetCollection<Project>("projects")
                                    .Find(p => p.Id == imageId)
                                    .FirstOrDefaultAsync();

        if (project == null) return NotFound("Project not found.");

        try {
            await _s3Service.DeleteFileAsync(project.Id);
            await _s3Service.DeleteFileAsync(project.Id + "_preview");

            var imageUrl = await _s3Service.UploadFileAsync(model.Image, project.Id);
            var previewImageUrl = await _s3Service.UploadFileAsync(await _imageService.CompressImage(model.Image), project.Id + "_preview");

            project.Image = imageUrl;
            project.PreviewImage = previewImageUrl;
            project.LastModifiedDate = DateTime.Now;
        } catch (Exception ex) {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }

        await _context.GetCollection<Project>("projects").ReplaceOneAsync(p => p.Id == imageId, project);

        return Ok("Project saved successfully. ");
    }
}

public class ProjectCreateModel
{
    public required string Name { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public required string UserId { get; set; }
}

public class ProjectUploadModel
{
    public required string Name { get; set; }
    public required int Width { get; set; }
    public required int Height { get; set; }
    public required string UserId { get; set; }
    public required string Image { get; set; }
}

public class ProjectsGetModel
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public int CollaboratorsCount { get; set; }
    public string? ImagePreview { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}

public class SaveProjectModel
{
    public required string Image { get; set; }
}
