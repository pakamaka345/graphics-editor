using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SignalingServer.Hubs;
using EmailService;
using Amazon.S3;
using Amazon;
using Amazon.Extensions.NETCore.Setup;

var builder = WebApplication.CreateBuilder(args);

// Add Configuration file to the project
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Add services to the container.
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddSingleton<IImageService, ImageService>();
builder.Services.AddControllers();
builder.Services.AddCors();

// Add AWS S3 Service
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddSingleton<IS3Service, S3Service>(sp =>
{
    var s3Client = sp.GetRequiredService<IAmazonS3>();
    var bucketName = builder.Configuration["AWS:BucketName"]!;
    return new S3Service(s3Client, bucketName);
});

// Add JWT Authentication
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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]!))
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

// Add Authorization
builder.Services.AddAuthorization();

// Add Email Service
var emailConfig = builder.Configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>();
builder.Services.AddSingleton(emailConfig!);

builder.Services.AddScoped<IEmailSender, EmailSender>();


// Add SignalR
builder.Services.AddSignalR(o => {
    o.MaximumReceiveMessageSize = 102400000;
    o.EnableDetailedErrors = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.MapControllers();
app.MapHub<SignalingHub>("/hub");

app.Run();