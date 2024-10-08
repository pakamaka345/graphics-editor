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

    public ProjectController(MongoDbContext context, IImageService imageService, ITokenService tokenService)
    {
        _context = context;
        _imageService = imageService;
        _tokenService = tokenService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] ProjectCreateModel model)
    {
        string image = await _imageService.CreateImage(model.Width, model.Height);

        var project = new Project
        {
            Name = model.Name,
            Width = model.Width,
            Height = model.Height,
            UserId = model.UserId,
            CreatedDate = DateTime.Now,
            LastModifiedDate = DateTime.Now,
            Image = image,
            PreviewImage = await _imageService.CompressImage(image)
        };

        await _context.GetCollection<Project>("projects").InsertOneAsync(project);

        return Ok(new { id = project.Id });
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
            Image = model.Image,
            PreviewImage = await _imageService.CompressImage(model.Image)
        };

        await _context.GetCollection<Project>("projects").InsertOneAsync(project);

        return Ok(new { id = project.Id });
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

            var result = projects.Select(p => new ProjectsGetModel
            {
                Id = p.Id,
                Name = p.Name,
                CollaboratorsCount = p.Collaborators?.Count ?? 0,
                ImagePreview = p.PreviewImage,
                CreatedAt = p.CreatedDate,
                LastUpdatedAt = p.LastModifiedDate
            }).ToList();

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

        return Ok(new { name = project.Name, image = project.Image });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        var project = await _context.GetCollection<Project>("projects")
                                    .Find(p => p.Id == id)
                                    .FirstOrDefaultAsync();

        if (project == null) return NotFound("Project not found.");

        await _context.GetCollection<Project>("projects").DeleteOneAsync(p => p.Id == id);

        return Ok("Project deleted successfully.");
    }

    [HttpPut("{imageId}")]
    public async Task<IActionResult> SaveProject(string imageId, [FromBody] SaveProjectModel model) {
        var project = await _context.GetCollection<Project>("projects")
                                    .Find(p => p.Id == imageId)
                                    .FirstOrDefaultAsync();

        if (project == null) return NotFound("Project not found.");

        project.Image = model.Image;
        project.Name = model.Name;
        project.PreviewImage = await _imageService.CompressImage(model.Image);
        project.LastModifiedDate = DateTime.Now;

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
    public required string Name { get; set; }
}
