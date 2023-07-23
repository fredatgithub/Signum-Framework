using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace CheckUrl;

class Program
{
  static async Task Main(string[] arguments)
  {
    if (arguments.Length == 0)
    {
      arguments[0] = "alive";
      arguments[1] = "http://www.google.com";
    }

    if (arguments.Length < 2)
    {
      Console.WriteLine("Usage: CheckUrl alive/dead \"http://www.google.com\" 10");
    }

    var alive =
        arguments[0]?.ToLower() == "alive" ? true :
        arguments[0]?.ToLower() == "dead" ? false :
        throw new InvalidOperationException("Unexcpected " + arguments[0]);

    var url = arguments[1];
    var retry = arguments.Length == 2 ? 15 : int.Parse(arguments[2]);

    var client = new HttpClient();
    try
    {
      while (true)
      {
        Console.ForegroundColor = ConsoleColor.Gray;
        Console.Write("GET " + url + "...");
        try
        {
          var response = await client.GetAsync(url);

          Console.ForegroundColor = response.IsSuccessStatusCode ? ConsoleColor.Green : ConsoleColor.Red;
          Console.Write((int)response.StatusCode + " (" + response.StatusCode + ")");

          if (response.IsSuccessStatusCode == alive)
          {
            Console.WriteLine();
            return;
          }
        }
        catch (HttpRequestException e)
        {
          Console.ForegroundColor = ConsoleColor.Red;
          Console.Write(e.Message);
        }

        retry--;

        if (retry == 0)
          throw new ApplicationException("Timeoout");

        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine(" retrying in 10 sec (" + retry + " left)");
        await Task.Delay(1000 * 10);
      }
    }
    finally
    {
      Console.ForegroundColor = ConsoleColor.Gray;
    }
  }
}
