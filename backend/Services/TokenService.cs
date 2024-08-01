using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

public interface ITokenService
{
    string GenerateToken(User user, bool rememberMe);
    Task<bool> ValidateToken(string token);
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

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:Issuer"],
            audience: _configuration["JWT:Audience"],
            claims: claims,
            expires: rememberMe ? DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JWT:LongExpireDays"])) : DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JWT:ShortExpireMinutes"])),
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
}