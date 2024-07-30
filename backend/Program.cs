
using System.Net;
using SignalingServer.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR(o => {
    o.MaximumReceiveMessageSize = 102400000;
    o.EnableDetailedErrors = true;
});

var app = builder.Build();

app.MapHub<SignalingHub>("/hub");


app.Run();
