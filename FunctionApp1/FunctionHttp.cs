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
    public class FunctionHttp
    {
        private readonly ILogger<FunctionHttp> _logger;
        private readonly IMongoCollection<BsonDocument> _collection;

        public FunctionHttp(ILogger<FunctionHttp> logger)
        {
            _logger = logger;

            var connectionString = "mongodb+srv://adrblks:pcoViYd6LMxAbT32@cluster0.2kbkwm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("sample_mflix");
            _collection = database.GetCollection<BsonDocument>("users");
        }

        [Function("PersonInsert")]
        public async Task<IActionResult> RunInsert([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a POST request for inserting a person.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var person = JsonConvert.DeserializeObject<PersonData>(requestBody);

            if (person == null || string.IsNullOrEmpty(person.Email) || string.IsNullOrEmpty(person.Password))
            {
                return new BadRequestObjectResult("Invalid person data.");
            }

            var bsonPerson = new BsonDocument
            {
                { "name", person.Name },
                { "email", person.Email },
                { "password", person.Password }
            };

            await _collection.InsertOneAsync(bsonPerson);
            _logger.LogInformation("Person inserted successfully.");

            return new OkObjectResult("Person inserted successfully.");
        }

        [Function("PersonGetList")]
        public async Task<IActionResult> RunGetAll([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for retrieving all persons.");

            var persons = await _collection.Find(new BsonDocument()).ToListAsync();
            var response = persons.Select(p => new
            {
                Id = p["_id"].ToString(),
                Name = p["name"].AsString,
                Email = p["email"].AsString
            });

            return new OkObjectResult(response);
        }

        [Function("PersonUpdate")]
        public async Task<IActionResult> RunUpdate([HttpTrigger(AuthorizationLevel.Function, "put", Route = "person/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation("C# HTTP trigger function processed a PUT request for updating a person.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updatedPerson = JsonConvert.DeserializeObject<PersonData>(requestBody);

            if (updatedPerson == null || string.IsNullOrEmpty(updatedPerson.Email) || string.IsNullOrEmpty(updatedPerson.Password))
            {
                return new BadRequestObjectResult("Invalid person data.");
            }

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var update = Builders<BsonDocument>.Update
                .Set("name", updatedPerson.Name)
                .Set("email", updatedPerson.Email)
                .Set("password", updatedPerson.Password);

            var result = await _collection.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return new NotFoundObjectResult($"Person with ID {id} not found.");
            }

            _logger.LogInformation("Person updated successfully.");
            return new OkObjectResult("Person updated successfully.");
        }

        [Function("PersonDeleteByEmail")]
        public async Task<IActionResult> RunDeleteByEmail([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "person/{email}")] HttpRequest req, string email)
        {
            _logger.LogInformation("C# HTTP trigger function processed a DELETE request for deleting a person by email.");

            var filter = Builders<BsonDocument>.Filter.Eq("email", email);
            var result = await _collection.DeleteOneAsync(filter);

            if (result.DeletedCount == 0)
            {
                return new NotFoundObjectResult($"Person with email {email} not found.");
            }

            _logger.LogInformation("Person deleted successfully.");
            return new OkObjectResult($"Person with email {email} deleted successfully.");
        }
    }
}
