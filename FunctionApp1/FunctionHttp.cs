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

        [Function("UserCount")]
        public void RunUserCount([TimerTrigger("0 * * * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");

            var count = _collection.CountDocuments(FilterDefinition<BsonDocument>.Empty);
            _logger.LogInformation($"There are {count} users in the database.");

            if (myTimer.ScheduleStatus is not null)
            {
                _logger.LogInformation($"Next timer schedule at: {myTimer.ScheduleStatus.Next}");
            }
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

        [Function("PersonBatchInsert")]
        public async Task<IActionResult> RunBatchInsert([HttpTrigger(AuthorizationLevel.Function, "post", Route = "person/batch")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a POST request for batch inserting persons.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var persons = JsonConvert.DeserializeObject<List<PersonData>>(requestBody);

            if (persons == null || !persons.Any())
            {
                return new BadRequestObjectResult("Invalid person data.");
            }

            var bsonPersons = persons.Select(person => new BsonDocument
       {
           { "name", person.Name },
           { "email", person.Email },
           { "password", person.Password }
           }).ToList();

            await _collection.InsertManyAsync(bsonPersons);
            _logger.LogInformation("Persons batch inserted successfully.");

            return new OkObjectResult("Persons batch inserted successfully.");
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

        [Function("PersonGetById")]
        public async Task<IActionResult> RunGetById([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for retrieving a person by id.");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var person = await _collection.Find(filter).FirstOrDefaultAsync();

            if (person == null)
            {
                return new NotFoundObjectResult($"Person with id {id} not found.");
            }

            var response = new
            {
                Id = person["_id"].ToString(),
                Name = person["name"].AsString,
                Email = person["email"].AsString
            };

            return new OkObjectResult(response);
        }

        [Function("PersonSearch")]
        public async Task<IActionResult> RunSearch([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/search")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for searching persons.");

            string name = req.Query["name"];
            string email = req.Query["email"];

            var filter = Builders<BsonDocument>.Filter.Empty;

            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<BsonDocument>.Filter.Regex("name", new BsonRegularExpression(name, "i"));
            }

            if (!string.IsNullOrEmpty(email))
            {
                filter &= Builders<BsonDocument>.Filter.Regex("email", new BsonRegularExpression(email, "i"));
            }

            var persons = await _collection.Find(filter).ToListAsync();
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

        [Function("PersonDeleteById")]
        public async Task<IActionResult> RunDeleteById([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "person/{id}")] HttpRequest req, string id)
        {
            _logger.LogInformation("C# HTTP trigger function processed a DELETE request for deleting a person by id.");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var result = await _collection.DeleteOneAsync(filter);

            if (result.DeletedCount == 0)
            {
                return new NotFoundObjectResult($"Person with id {id} not found.");
            }

            _logger.LogInformation("Person deleted successfully.");
            return new OkObjectResult($"Person with id {id} deleted successfully.");
        }

        [Function("PersonExportCSV")]
        public async Task<IActionResult> RunExportCSV([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/export/csv")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for exporting persons data in CSV format.");

            var persons = await _collection.Find(new BsonDocument()).ToListAsync();
            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("Id,Name,Email");

            foreach (var person in persons)
            {
                csvBuilder.AppendLine($"{person["_id"]},{person["name"]},{person["email"]}");
            }

            return new FileContentResult(Encoding.UTF8.GetBytes(csvBuilder.ToString()), "text/csv")
            {
                FileDownloadName = "persons.csv"
            };
        }

        [Function("PersonExportJSON")]
        public async Task<IActionResult> RunExportJSON([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/export/json")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for exporting persons data in JSON format.");

            var persons = await _collection.Find(new BsonDocument()).ToListAsync();
            var response = persons.Select(p => new
            {
                Id = p["_id"].ToString(),
                Name = p["name"].AsString,
                Email = p["email"].AsString
            });

            var jsonResponse = JsonConvert.SerializeObject(response, Formatting.Indented);

            return new FileContentResult(Encoding.UTF8.GetBytes(jsonResponse), "application/json")
            {
                FileDownloadName = "persons.json"
            };
        }


    }
}
