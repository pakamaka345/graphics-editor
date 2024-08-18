using System.ComponentModel.DataAnnotations;
using EmailService;
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
    private readonly IEmailSender _emailSender;

    public UsersController(MongoDbContext context, ITokenService tokenService, IEmailSender emailSender)
    {
        _context = context;
        _tokenService = tokenService;
        _emailSender = emailSender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        var UserExists = await _context.GetCollection<User>("users")
                                .AsQueryable()
                                .AnyAsync(u => u.Login == user.Login || u.Email == user.Email);

        if (UserExists)
        {
            return BadRequest("User with this login or email already exists");
        }

        user.Password = HashPassword(user.Password);

        await _context.GetCollection<User>("users").InsertOneAsync(user);

        return Ok("User registered successfully");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _context.GetCollection<User>("users")
                        .AsQueryable()
                        .FirstOrDefaultAsync(u => u.Email == model.Email);

        if (user == null || !VerifyPassword(model.Password, user.Password))
        {
            return BadRequest("Invalid login or password");
        }
        var token = _tokenService.GenerateToken(user, model.rememberMe);

        _context.GetCollection<AuthToken>("authToken").DeleteMany(t => t.ExpirationDate < DateTime.UtcNow);

        return Ok(new { token });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> logout()
    {
        var token = Request.Headers["Authorization"].ToString().Split(" ")[1];

        await _context.GetCollection<AuthToken>("authToken")
                    .DeleteOneAsync(t => t.Token == token);

        return Ok("Logged out successfully");
    }

    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    [Authorize]
    [HttpGet("checkAuth")]
    public IActionResult CheckedAuth()
    {
        return Ok();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody][Required] ForgotPasswordModel forgotPasswordModel)
    {
        var user = await _context.GetCollection<User>("users")
                        .AsQueryable()
                        .FirstOrDefaultAsync(u => u.Email == forgotPasswordModel.Email);

        if (user == null)
            return BadRequest("User with this email does not exist");

        var token = _tokenService.GenerateRandomToken(user);

        var ResetToken = new AuthToken
        {
            Token = token,
            UserId = user.Id,
            ExpirationDate = DateTime.UtcNow.AddMinutes(5)
        };

        await _context.GetCollection<AuthToken>("authToken").InsertOneAsync(ResetToken);

        var reactAppBaseUrl = "http://localhost:4000"; // Замість цього використовуйте фактичний IP або домен вашого React-додатку
        var callback = $"{reactAppBaseUrl}/reset-password?token={token}&email={user.Email}";
        if (string.IsNullOrEmpty(callback))
        {
            return StatusCode(500, "Failed to generate callback URL.");
        }

        var message = new Message(new string[] { user.Email }, "Reset password token", callback);
        await _emailSender.SendEmailAsync(message);
        return Ok("Password reset token has been sent to your email");
    }

    [HttpPut("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        try
        {
            if (await _tokenService.ValidateRandomToken(model.Token, model.Email) == false)
            {
                return BadRequest("Invalid token");
            }
            var user = await _context.GetCollection<User>("users")
                                .AsQueryable()
                                .FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null)
            {
                return BadRequest("User with this email does not exist");
            }


            // Оновлення пароля користувача
            user.Password = HashPassword(model.Password); // Переконайтеся, що пароль хешується перед збереженням

            // Збереження змін
            var updateResult = await _context.GetCollection<User>("users")
                                             .ReplaceOneAsync(u => u.Id == user.Id, user);

            if (!updateResult.IsAcknowledged)
            {
                return BadRequest("Error resetting password");
            }

            return Ok("Password has been reset successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}

public class LoginModel
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public bool rememberMe { get; set; }
}

public class ForgotPasswordModel
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}

public class ResetPasswordModel
{
    [Required]
    public required string Password { get; set; }
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public required string ConfirmPassword { get; set; }
    public required string Email { get; set; }
    public required string Token { get; set; }
}