using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace FunctionApp1
{
    public class UserController
    {
        private readonly ILogger<UserController> _logger;
        private readonly IMongoCollection<BsonDocument> _collection;

        public UserController(ILogger<UserController> logger)
        {
            _logger = logger;

            var connectionString = "mongodb+srv://adrblks:pcoViYd6LMxAbT32@cluster0.2kbkwm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("sample_mflix");
            _collection = database.GetCollection<BsonDocument>("users");
        }

        [Function("UserCountTimer")]
        public void UserCountTimer([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}. This operation runs every 5 minutes.");

            var count = _collection.CountDocuments(FilterDefinition<BsonDocument>.Empty);

            _logger.LogInformation($"There are {count} users in the database.");
        }

        [Function("UserInsert")]
        public async Task<IActionResult> UserInsert([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a POST request for inserting a user.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var user = JsonConvert.DeserializeObject<UserData>(requestBody);

            if (user == null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
            {
                return new BadRequestObjectResult("Invalid user data.");
            }

            var bsonUser = new BsonDocument
            {
                { "name", user.Name },
                { "email", user.Email },
                { "password", user.Password }
            };

            await _collection.InsertOneAsync(bsonUser);
            _logger.LogInformation("User inserted successfully.");

            return new OkObjectResult("User inserted successfully.");
        }

        [Function("UserBatchInsert")]
        public async Task<IActionResult> UserBatchInsert([HttpTrigger(AuthorizationLevel.Function, "post", Route = "user/batch")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a POST request for batch inserting users.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var users = JsonConvert.DeserializeObject<List<UserData>>(requestBody);

            if (users == null || !users.Any())
            {
                return new BadRequestObjectResult("Invalid user data.");
            }

            var bsonUsers = users.Select(user => new BsonDocument
            {
            { "name", user.Name },
            { "email", user.Email },
            { "password", user.Password }
            }).ToList();

            await _collection.InsertManyAsync(bsonUsers);
            _logger.LogInformation("Users batch inserted successfully.");

            return new OkObjectResult("Users batch inserted successfully.");
        }


        [Function("UserGetList")]
        public async Task<IActionResult> UserGetList([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for retrieving all users.");

            var users = await _collection.Find(new BsonDocument()).ToListAsync();
            var response = users.Select(p => new
            {
                Id = p["_id"].ToString(),
                Name = p["name"].AsString,
                Email = p["email"].AsString
            });

            return new OkObjectResult(response);
        }

        [Function("UserGetById")]
        public async Task<IActionResult> UserGetById([HttpTrigger(AuthorizationLevel.Function, "get", Route = "user/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for retrieving a user by id.");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var user = await _collection.Find(filter).FirstOrDefaultAsync();

            if (user == null)
            {
                return new NotFoundObjectResult($"User with id {id} not found.");
            }

            var response = new
            {
                Id = user["_id"].ToString(),
                Name = user["name"].AsString,
                Email = user["email"].AsString
            };

            return new OkObjectResult(response);
        }

        [Function("UserSearch")]
        public async Task<IActionResult> UserSearch([HttpTrigger(AuthorizationLevel.Function, "get", Route = "UserSearch")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for searching users.");

            string query = req.Query["query"];

            if (string.IsNullOrEmpty(query))
            {
                return new BadRequestObjectResult("Query parameter is required.");
            }

            var filter = Builders<BsonDocument>.Filter.Or(
                Builders<BsonDocument>.Filter.Regex("name", new BsonRegularExpression(query, "i")),
                Builders<BsonDocument>.Filter.Regex("email", new BsonRegularExpression(query, "i"))
            );

            var users = await _collection.Find(filter).ToListAsync();
            var response = users.Select(p => new
            {
                Id = p["_id"].ToString(),
                Name = p["name"].AsString,
                Email = p["email"].AsString
            });

            return new OkObjectResult(response);
        }



        [Function("UserUpdate")]
        public async Task<IActionResult> UserUpdate([HttpTrigger(AuthorizationLevel.Function, "put", Route = "user/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation("C# HTTP trigger function processed a PUT request for updating a user.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updatedUser = JsonConvert.DeserializeObject<UserData>(requestBody);

            if (updatedUser == null || string.IsNullOrEmpty(updatedUser.Email) || string.IsNullOrEmpty(updatedUser.Password))
            {
                return new BadRequestObjectResult("Invalid user data.");
            }

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var update = Builders<BsonDocument>.Update
                .Set("name", updatedUser.Name)
                .Set("email", updatedUser.Email)
                .Set("password", updatedUser.Password);

            var result = await _collection.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return new NotFoundObjectResult($"User with ID {id} not found.");
            }

            _logger.LogInformation("User updated successfully.");
            return new OkObjectResult("User updated successfully.");
        }

        [Function("UserDeleteById")]
        public async Task<IActionResult> UserDeleteById([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "user/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation("C# HTTP trigger function processed a DELETE request for deleting a user by id.");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var result = await _collection.DeleteOneAsync(filter);

            if (result.DeletedCount == 0)
            {
                return new NotFoundObjectResult($"User with id {id} not found.");
            }

            _logger.LogInformation("User deleted successfully.");
            return new OkObjectResult($"User with id {id} deleted successfully.");
        }

        [Function("UserExportCSV")]
        public async Task<IActionResult> UserExportCSV([HttpTrigger(AuthorizationLevel.Function, "get", Route = "user/export/csv")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for exporting user data in CSV format.");

            var users = await _collection.Find(new BsonDocument()).ToListAsync();
            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("Id,Name,Email");

            foreach (var user in users)
            {
                csvBuilder.AppendLine($"{user["_id"]},{user["name"]},{user["email"]}");
            }

            return new FileContentResult(Encoding.UTF8.GetBytes(csvBuilder.ToString()), "text/csv")
            {
                FileDownloadName = "users.csv"
            };
        }

        [Function("UserExportJSON")]
        public async Task<IActionResult> UserExportJSON([HttpTrigger(AuthorizationLevel.Function, "get", Route = "user/export/json")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for exporting user data in JSON format.");

            var users = await _collection.Find(new BsonDocument()).ToListAsync();
            var response = users.Select(p => new
            {
                Id = p["_id"].ToString(),
                Name = p["name"].AsString,
                Email = p["email"].AsString
            });

            var jsonResponse = JsonConvert.SerializeObject(response, Formatting.Indented);

            return new FileContentResult(Encoding.UTF8.GetBytes(jsonResponse), "application/json")
            {
                FileDownloadName = "users.json"
            };
        }


    }
}
