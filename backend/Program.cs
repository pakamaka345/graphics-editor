using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SignalingServer.Hubs;
using EmailService;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Налаштування служб
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddSingleton<IImageService, ImageService>();
builder.Services.AddControllers();
builder.Services.AddCors();

// Налаштування JWT аутентифікації
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
    };

    options.Events = new JwtBearerEvents {
        OnTokenValidated = async context => {
            try {
                var tokenString = context.Request.Headers["Authorization"].ToString().Split(" ")[1];
                var token = new JwtSecurityToken(tokenString);
                var tokenService = context.HttpContext.RequestServices.GetRequiredService<ITokenService>();

                if (token == null) {
                    context.Fail("Unauthorized");
                    return;
                }

                var tokenExists = await tokenService.ValidateToken(token.RawData);

                if (!tokenExists) {
                    context.Fail("Unauthorized");
                }
            } catch (Exception ex) {
                Console.WriteLine("Exception in token validation: " + ex.Message);
                context.Fail("Unauthorized");
            }
        }
    };
});

// Додавання авторизації
builder.Services.AddAuthorization();

var emailConfig = builder.Configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>();
builder.Services.AddSingleton(emailConfig);

builder.Services.AddScoped<IEmailSender, EmailSender>();


// Додавання SignalR
builder.Services.AddSignalR(o => {
    o.MaximumReceiveMessageSize = 102400000;
    o.EnableDetailedErrors = true;
});

var app = builder.Build();

// Конфігурація HTTP конвеєра
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.MapControllers();
app.MapHub<SignalingHub>("/hub");

app.Run();