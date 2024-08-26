using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EmailService;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

public interface ITokenService
{
    string GenerateToken(User user, bool rememberMe);
    Task<bool> ValidateToken(string token);
    string GenerateRandomToken(User user);
    Task<bool> ValidateRandomToken(string token, string email);
    Task<string> GetUserIdBytoken(string token);
    Task<Message> GetEmailConfirmationMessage(User user, string reactAppBaseUrl);
}

public class TokenService : ITokenService {
    private readonly MongoDbContext _context;
    private readonly IConfiguration _configuration;

    public TokenService(MongoDbContext context, IConfiguration configuration) {
        _context = context;
        _configuration = configuration;
    }

    public string GenerateToken(User user, bool rememberMe) {
        var claims = new List<Claim> 
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiration = rememberMe ? DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JWT:LongExpireDays"])) : DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JWT:ShortExpireDays"]));

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:Issuer"],
            audience: _configuration["JWT:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds);

        var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

        _context.GetCollection<AuthToken>("authToken").InsertOne(new AuthToken {
            Token = jwtToken,
            UserId = user.Id,
            ExpirationDate = token.ValidTo
        });

        return jwtToken;
    }

    public async Task<bool> ValidateToken(string token) {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JWT:Secret"]);

        try {
            tokenHandler.ValidateToken(token, new TokenValidationParameters {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _configuration["JWT:Issuer"],
                ValidAudience = _configuration["JWT:Audience"],
                ValidateLifetime = true
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = jwtToken.Claims.First(x => x.Type == JwtRegisteredClaimNames.Sub).Value;
            var expirationDate = jwtToken.ValidTo;

            var authToken = await _context.GetCollection<AuthToken>("authToken")
                .AsQueryable()
                .FirstOrDefaultAsync(x => x.Token == token && x.UserId == userId && x.ExpirationDate > DateTime.UtcNow);
            
            return authToken != null;
        } catch {
            return false;
        }
    }
    public string GenerateRandomToken(User user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user), "User cannot be null.");
        }

        using (var rng = RandomNumberGenerator.Create())
        {
            var tokenData = new byte[32];
            rng.GetBytes(tokenData);

            var token = Convert.ToBase64String(tokenData);

            return token;
        }
    }

    public async Task<bool> ValidateRandomToken(string token, string email_or_id)
    {
        var authToken = await _context.GetCollection<AuthToken>("authToken")
            .AsQueryable()
            .FirstOrDefaultAsync(x => x.Token == token);
        
        var user = await _context.GetCollection<User>("users")
            .AsQueryable()
            .FirstOrDefaultAsync(u => u.Email == email_or_id || u.Id == email_or_id);

        if (authToken == null || user == null) throw new NullReferenceException("Token or user not found");
        if(authToken.ExpirationDate < DateTime.UtcNow) throw new Exception("Token has expired");

        return authToken.UserId == user.Id;
    }

    public async Task<string> GetUserIdBytoken(string token)
    {
        var authToken = await _context.GetCollection<AuthToken>("authToken")
            .AsQueryable()
            .FirstOrDefaultAsync(x => x.Token == token);
        
        return authToken.UserId;
    }

    public async Task<Message> GetEmailConfirmationMessage(User user, string reactAppBaseUrl)
    {
        var token = GenerateRandomToken(user);
        var ConfirmationToken = new AuthToken
        {
            Token = token,
            UserId = user.Id,
            ExpirationDate = DateTime.UtcNow.AddDays(2)
        };
        await _context.GetCollection<AuthToken>("authToken").InsertOneAsync(ConfirmationToken);
        var callback = $"{reactAppBaseUrl}/confirm-email?token={token}";
        if (string.IsNullOrEmpty(callback))
        {
           throw new Exception("Callback is empty");
        }
       return new Message([user.Email], "Email Confirmation token", $"Hi there!\nTo confirm your Virtuoso Board account please follow the instructions:\nYour email confirmation link is: {callback}\n(It is active for 2 days)");
    }
}