using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;

    public AuthController(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try {
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { "594073034150-lh9qq65j01fhdm0f5306ar93oeurf0uk.apps.googleusercontent.com" }
            });

            var user = new User {
                Email = payload.Email,
                Login = payload.Name,
                Password = BCrypt.Net.BCrypt.HashPassword(payload.Email)
            };

            var token = _tokenService.GenerateToken(user, false);

            return Ok(new { token });
        } catch (Exception ex)
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
                Password = BCrypt.Net.BCrypt.HashPassword(request.Name)
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
        public string? Token { get; set; }
    }

    public class FacebookLoginRequest 
    {
        public string? Token { get; set; }
        public string? Name { get; set; }
    }
}