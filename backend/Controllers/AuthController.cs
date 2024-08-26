using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;
    private readonly MongoDbContext _context;

    public AuthController(ITokenService tokenService, MongoDbContext context)
    {
        _tokenService = tokenService;
        _context = context;
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            if (request.Email == null || request.Name == null)
            {
                return BadRequest(new { error = "Email and Name are required" });
            }

            var user = await _context.GetCollection<User>("users")
                        .AsQueryable()
                        .FirstOrDefaultAsync(u => u.Email == request.Email, CancellationToken.None);

            if (user == null)
            {
                user = new User
                {
                    Email = request.Email,
                    Login = request.Name,
                    Password = BCrypt.Net.BCrypt.HashPassword(request.Email),
                    IsConfirmedEmail = true
                };
                await _context.GetCollection<User>("users").InsertOneAsync(user);
            }

            var token = _tokenService.GenerateToken(user, false);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { error = "Invalid token", details = ex.Message });
        }
    }

    [HttpPost("facebook")]
    public IActionResult FacebookLogin([FromBody] FacebookLoginRequest request)
    {
        try
        {
            if (request.Name == null)
            {
                return BadRequest(new { error = "Name is required" });
            }

            var user = new User
            {
                Email = request.Name,
                Login = request.Name,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Name),
                IsConfirmedEmail = true
            };

            var token = _tokenService.GenerateToken(user, false);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { error = "Invalid token", details = ex.Message });
        }
    }

    public class GoogleLoginRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
    }

    public class FacebookLoginRequest
    {
        public string? Token { get; set; }
        public string? Name { get; set; }
    }
}