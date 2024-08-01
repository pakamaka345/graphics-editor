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
                        .FirstOrDefaultAsync(u => u.Login == model.Login && VerifyPassword(model.Password, u.Password));

        if (user == null) {
            return BadRequest("Invalid login or password");
        }

        var token = _tokenService.GenerateToken(user, model.rememberMe);

        return Ok(token);
    }

    [HttpPost("loginWithToken")]
    public async Task<IActionResult> loginWithToken([FromBody] string token) {
        var isValid = await _tokenService.ValidateToken(token);

        if (!isValid) {
            return BadRequest("Invalid token");
        }

        return Ok("Token is valid");
    }

    private string HashPassword(string password) {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hash) {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}

public class LoginModel {
    public required string Login { get; set; }
    public required string Password { get; set; }
    public bool rememberMe { get; set; }
}