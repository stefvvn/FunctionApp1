using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace FunctionApp1
{
    public class MovieController
    {
        private readonly ILogger<MovieController> _logger;
        private readonly IMongoCollection<BsonDocument> _collection;

        public MovieController(ILogger<MovieController> logger)
        {
            _logger = logger;

            var connectionString = "mongodb+srv://adrblks:pcoViYd6LMxAbT32@cluster0.2kbkwm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("sample_mflix");
            _collection = database.GetCollection<BsonDocument>("movies");
        }

        [Function("MovieGetById")]
        public async Task<IActionResult> MovieGetById([HttpTrigger(AuthorizationLevel.Function, "get", Route = "movies/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation($"C# HTTP trigger function processed a GET request for movie with ID: {id}");

            if (!ObjectId.TryParse(id, out ObjectId objectId))
            {
                return new BadRequestObjectResult("Invalid movie ID format.");
            }

            var filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);
            var movie = await _collection.Find(filter).FirstOrDefaultAsync();

            if (movie == null)
            {
                return new NotFoundObjectResult($"Movie with ID {id} not found.");
            }

            return new OkObjectResult(movie.ToJson());
        }

        [Function("MovieUpdate")]
        public async Task<IActionResult> MovieUpdate([HttpTrigger(AuthorizationLevel.Function, "put", Route = "movies/{id}")] HttpRequest req, string id)
        {
            if (!ObjectId.TryParse(id, out ObjectId objectId))
            {
                return new BadRequestObjectResult("Invalid movie ID format.");
            }

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updateData = JsonConvert.DeserializeObject<Dictionary<string, object>>(requestBody);

            if (updateData == null || !updateData.Any())
            {
                return new BadRequestObjectResult("No valid fields provided for update.");
            }

            var filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);

            var updateDefinition = new List<UpdateDefinition<BsonDocument>>();
            foreach (var field in updateData)
            {
                updateDefinition.Add(Builders<BsonDocument>.Update.Set(field.Key, BsonValue.Create(field.Value)));
            }

            var update = Builders<BsonDocument>.Update.Combine(updateDefinition);

            var result = await _collection.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return new NotFoundObjectResult($"Movie with ID {id} not found.");
            }

            return new OkObjectResult("Movie updated successfully.");
        }


        [Function("MovieDelete")]
        public async Task<IActionResult> MovieDelete([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "movies/{id}")] HttpRequest req, string id)
        {
            if (!ObjectId.TryParse(id, out ObjectId objectId))
            {
                return new BadRequestObjectResult("Invalid movie ID format.");
            }

            var filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);
            var result = await _collection.DeleteOneAsync(filter);

            if (result.DeletedCount == 0)
            {
                return new NotFoundObjectResult($"Movie with ID {id} not found.");
            }

            return new OkObjectResult("Movie deleted successfully.");
        }


        [Function("MovieCountTimer")]
        public void MovieCountTimer([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}. This operation runs every 5 minutes.");

            var count = _collection.CountDocuments(FilterDefinition<BsonDocument>.Empty);

            _logger.LogInformation($"There are {count} movies in the database.");
        }

        [Function("MovieInsert")]
        public async Task<IActionResult> MovieInsert([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a POST request for inserting a movie.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var movie = JsonConvert.DeserializeObject<MovieModel>(requestBody);

            if (movie == null)
            {
                return new BadRequestObjectResult("Invalid movie data.");
            }

            var bsonMovie = movie.ToBsonDocument();

            await _collection.InsertOneAsync(bsonMovie);
            _logger.LogInformation($"Movie titled '{movie.Title}' inserted successfully.");

            return new OkObjectResult("Movie inserted successfully.");
        }

        [Function("MovieSearch")]
        public async Task<IActionResult> MovieSearch([HttpTrigger(AuthorizationLevel.Function, "get", Route = "movies/search")] HttpRequest req)
        {
            string title = req.Query["title"];
            string genre = req.Query["genre"];
            int.TryParse(req.Query["year"], out int year);

            var filters = new List<FilterDefinition<BsonDocument>>();

            if (!string.IsNullOrEmpty(title))
                filters.Add(Builders<BsonDocument>.Filter.Regex("title", new BsonRegularExpression(title, "i")));

            if (!string.IsNullOrEmpty(genre))
                filters.Add(Builders<BsonDocument>.Filter.AnyEq("genres", genre));

            if (year > 0)
                filters.Add(Builders<BsonDocument>.Filter.Eq("year", year));

            var filter = filters.Count > 0 ? Builders<BsonDocument>.Filter.And(filters) : FilterDefinition<BsonDocument>.Empty;

            var movies = await _collection.Find(filter).ToListAsync();

            return new OkObjectResult(movies.Select(m => m.ToJson()));
        }

        [Function("MovieList")]
        public async Task<IActionResult> MovieList([HttpTrigger(AuthorizationLevel.Function, "get", Route = "movies")] HttpRequest req)
        {
            int.TryParse(req.Query["page"], out int page);
            int.TryParse(req.Query["pageSize"], out int pageSize);

            page = page > 0 ? page : 1;
            pageSize = pageSize > 0 ? pageSize : 10;

            var movies = await _collection.Find(FilterDefinition<BsonDocument>.Empty)
                                          .Skip((page - 1) * pageSize)
                                          .Limit(pageSize)
                                          .ToListAsync();

            return new OkObjectResult(movies.Select(m => m.ToJson()));
        }

        [Function("MoviesByGenre")]
        public async Task<IActionResult> MoviesByGenre([HttpTrigger(AuthorizationLevel.Function, "get", Route = "movies/genres")] HttpRequest req)
        {
            var pipeline = new[]
            {
             new BsonDocument { { "$unwind", "$genres" } },
             new BsonDocument { { "$group", new BsonDocument { { "_id", "$genres" }, { "count", new BsonDocument { { "$sum", 1 } } } } } },
             new BsonDocument { { "$sort", new BsonDocument { { "count", -1 } } } }
         };

            var result = await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return new OkObjectResult(result.Select(r => r.ToJson()));
        }

        [Function("MoviesExportJson")]
        public async Task<IActionResult> MoviesExportJson([HttpTrigger(AuthorizationLevel.Function, "get", Route = "movies/export/json")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request to export movies.");

            var filter = FilterDefinition<BsonDocument>.Empty;

            var movies = await _collection.Find(filter).ToListAsync();

            var jsonMovies = movies.Select(m => m.ToJson());

            var jsonResponse = JsonConvert.SerializeObject(jsonMovies, Formatting.Indented);

            var result = new FileContentResult(Encoding.UTF8.GetBytes(jsonResponse), "application/json")
            {
                FileDownloadName = "movies.json"
            };

            return result;
        }

    }
}
