using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SignalingServer.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Додавання конфігурації з appsettings.json
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Налаштування служб
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddControllers();

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
});

// Додавання авторизації
builder.Services.AddAuthorization();

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

app.MapControllers();
app.MapHub<SignalingHub>("/hub");

app.Run();