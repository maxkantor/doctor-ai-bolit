using Amazon.DynamoDBv2;
using Amazon.SecretsManager;
using Amazon.S3;
using Amazon.SimpleEmail;
using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Amazon.Extensions.NETCore.Setup;

namespace DoctorAIBolit;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        // AWS Services
        services.AddAWSService<IAmazonDynamoDB>();
        services.AddAWSService<IAmazonSecretsManager>();
        services.AddAWSService<IAmazonS3>();
        services.AddAWSService<IAmazonSimpleEmailService>();

        // HTTP Client
        services.AddHttpClient();

        // Repositories
        services.AddScoped<DoctorAIBolit.Repositories.IVisitorRepository, DoctorAIBolit.Repositories.VisitorRepository>();
        services.AddScoped<DoctorAIBolit.Repositories.IVisitorSessionRepository, DoctorAIBolit.Repositories.VisitorSessionRepository>();
        services.AddScoped<DoctorAIBolit.Repositories.IPricingConfigRepository, DoctorAIBolit.Repositories.PricingConfigRepository>();
        services.AddScoped<DoctorAIBolit.Repositories.IChatRepository, DoctorAIBolit.Repositories.ChatRepository>();
        services.AddScoped<DoctorAIBolit.Repositories.IContactRepository, DoctorAIBolit.Repositories.ContactRepository>();
        services.AddScoped<DoctorAIBolit.Repositories.IPaymentHistoryRepository, DoctorAIBolit.Repositories.PaymentHistoryRepository>();
        services.AddScoped<DoctorAIBolit.Repositories.IEmailVisitorMappingRepository, DoctorAIBolit.Repositories.EmailVisitorMappingRepository>();

        // Secrets Service (singleton for caching)
        services.AddSingleton<SecretsService>();

        // Application Services
        services.AddScoped<IVisitorService, VisitorService>();
        services.AddScoped<IPricingConfigService, PricingConfigService>();
        services.AddScoped<IOpenAIService, OpenAIService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IStripeService, StripeService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IOgImageService, OgImageService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IEmailRestoreService, EmailRestoreService>();

        // CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .WithExposedHeaders("*");
            });
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // CORS must be before UseRouting
        app.UseCors("AllowAll");

        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}

