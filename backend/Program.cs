// This file is not used when running in Lambda
// Lambda uses LambdaEntryPoint.cs which references Startup.cs
// This file is kept for local development/testing purposes

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace DoctorAIBolit;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}

