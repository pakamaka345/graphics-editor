using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase 
{
    private readonly MongoDbContext _context;
    private readonly ITokenService _tokenService;
    public UsersController(MongoDbContext context, ITokenService tokenService) {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user) {
        var UserExists = await _context.GetCollection<User>("users")
                                .AsQueryable()
                                .AnyAsync(u => u.Login == user.Login || u.Email == user.Email);

        if (UserExists) {
            return BadRequest("User with this login or email already exists");
        }

        user.Password = HashPassword(user.Password);

        await _context.GetCollection<User>("users").InsertOneAsync(user);

        return Ok("User registered successfully");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model) {
        var user = await _context.GetCollection<User>("users")
                        .AsQueryable()
                        .FirstOrDefaultAsync(u => u.Email == model.Email);

        if (user == null || !VerifyPassword(model.Password, user.Password)) {
            return BadRequest("Invalid login or password");
        }
        var token = _tokenService.GenerateToken(user, model.rememberMe);

        return Ok(new { token });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> logout() {
        var token = Request.Headers["Authorization"].ToString().Split(" ")[1];

        await _context.GetCollection<AuthToken>("authToken")
                    .DeleteOneAsync(t => t.Token == token);

        return Ok("Logged out successfully");
    }

    private string HashPassword(string password) {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hash) {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    [Authorize]
    [HttpGet("checkAuth")]
    public IActionResult CheckedAuth() {
        return Ok();
    }
}

public class LoginModel {
    public required string Email { get; set; }
    public required string Password { get; set; }
    public bool rememberMe { get; set; }
}