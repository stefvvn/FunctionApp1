using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace FunctionApp1
{
    public class FunctionHttp
    {
        private readonly ILogger<FunctionHttp> _logger;

        public FunctionHttp(ILogger<FunctionHttp> logger)
        {
            _logger = logger;
        }
        public static List<PersonData> _peopleList = new List<PersonData>();

        [Function("ConcatenateString")]
        public Task<IActionResult> RunConcatenateString([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            string str1 = req.Query["str1"].ToString();
            string str2 = req.Query["str2"].ToString();

            if (string.IsNullOrEmpty(str1) || string.IsNullOrEmpty(str2))
            {
                return Task.FromResult<IActionResult>(new BadRequestObjectResult("Please provide both 'str1' and 'str2' query parameters."));
            }

            _logger.LogInformation("Received str1: {str1} and str2: {str2}", str1, str2);

            string concatenatedString = str1 + str2;

            return Task.FromResult<IActionResult>(new OkObjectResult($"Concatenated string: {concatenatedString}"));
        }

        [Function("ConcatenateJSON")]
        public async Task<IActionResult> RunConcatenateJSON([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a POST request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var data = JsonConvert.DeserializeObject<PostData>(requestBody);

            if (data == null || string.IsNullOrEmpty(data.Str1) || string.IsNullOrEmpty(data.Str2))
            {
                return new BadRequestObjectResult("Please provide both 'str1' and 'str2' in the body.");
            }

            _logger.LogInformation("Received str1: {str1} and str2: {str2}", data.Str1, data.Str2);

            string concatenatedString = data.Str1 + data.Str2;

            return new OkObjectResult($"Concatenated string: {concatenatedString}");
        }

        [Function("PersonInsert")]
        public async Task<IActionResult> RunPut([HttpTrigger(AuthorizationLevel.Function, "put")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a PUT request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var people = JsonConvert.DeserializeObject<List<PersonData>>(requestBody);
            foreach (var data in people)
            {
                _logger.LogInformation("Received FirstName: {str1} and LastName: {str2}", data.FirstName, data.LastName);

                string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

                if (!Regex.IsMatch(data.Email, emailPattern))
                {
                    return new BadRequestObjectResult($"Invalid email address for {data.FirstName} {data.LastName}.");
                }

                var existingPerson = _peopleList.FirstOrDefault(p => p.Email.Equals(data.Email, StringComparison.OrdinalIgnoreCase));

                if (existingPerson != null)
                {
                    return new BadRequestObjectResult($"Email {data.Email} is already in use.");
                }

                var person = new PersonData
                {
                    FirstName = data.FirstName,
                    LastName = data.LastName,
                    BirthDate = data.BirthDate,
                    Email = data.Email,
                    PhoneNumber = data.PhoneNumber,
                    Address = data.Address
                };

                _peopleList.Add(person);

                _logger.LogInformation("Created Person: {str1} {str2}", data.FirstName, data.LastName);
            }

            return new OkObjectResult("All persons have been successfully created.");
        }

        [Function("PersonUpdate")]
        public async Task<IActionResult> RunPatchByEmail([HttpTrigger(AuthorizationLevel.Function, "patch", Route = "person")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a PATCH request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            var updateData = JsonConvert.DeserializeObject<PersonData>(requestBody);

            var personToUpdate = _peopleList.FirstOrDefault(p => p.Email == updateData.Email);

            if (personToUpdate == null)
            {
                _logger.LogWarning("Person with email {email} not found.", updateData.Email);
                return new NotFoundObjectResult($"Person with email {updateData.Email} not found.");
            }

            if (updateData.FirstName != null)
                personToUpdate.FirstName = updateData.FirstName;
            if (updateData.LastName != null)
                personToUpdate.LastName = updateData.LastName;
            if (updateData.Age != 0)
                personToUpdate.BirthDate = updateData.BirthDate;
            if (updateData.PhoneNumber != null)
                personToUpdate.PhoneNumber = updateData.PhoneNumber;
            if (updateData.Address != null)
                personToUpdate.Address = updateData.Address;

            _logger.LogInformation("Updated person {FirstName} {LastName}", personToUpdate.FirstName, personToUpdate.LastName);

            return new OkObjectResult(personToUpdate);
        }

        [Function("PersonBatchUpdateByEmail")]
        public async Task<IActionResult> RunBatchUpdateByEmail([HttpTrigger(AuthorizationLevel.Function, "patch", Route = "person/batchupdate")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a BATCH UPDATE request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updateDataList = JsonConvert.DeserializeObject<List<PersonData>>(requestBody);

            if (updateDataList == null || !updateDataList.Any())
            {
                return new BadRequestObjectResult("No data provided for batch update.");
            }

            foreach (var updateData in updateDataList)
            {
                var personToUpdate = _peopleList.FirstOrDefault(p => p.Email == updateData.Email);
                if (personToUpdate != null)
                {
                    personToUpdate.FirstName = updateData.FirstName ?? personToUpdate.FirstName;
                    personToUpdate.LastName = updateData.LastName ?? personToUpdate.LastName;
                    if (updateData.BirthDate != default(DateTime))
                    {
                        personToUpdate.BirthDate = updateData.BirthDate;
                    }
                    personToUpdate.PhoneNumber = updateData.PhoneNumber ?? personToUpdate.PhoneNumber;
                    personToUpdate.Address = updateData.Address ?? personToUpdate.Address;
                }
            }

            return new OkObjectResult("Batch update completed.");
        }

        [Function("PersonDeleteByEmail")]
        public async Task<IActionResult> RunDeleteByEmail([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "person/{email}")] HttpRequest req, string email)
        {
            _logger.LogInformation("C# HTTP trigger function processed a DELETE request.");

            var personToDelete = _peopleList.FirstOrDefault(p => p.Email == email);

            if (personToDelete == null)
            {
                _logger.LogWarning("Person with email {email} not found.", email);
                return new NotFoundObjectResult($"Person with email {email} not found.");
            }

            _peopleList.Remove(personToDelete);

            _logger.LogInformation("Deleted Person: {str1} {str2}", personToDelete.FirstName, personToDelete.LastName);

            return new OkObjectResult($"Person with email {email} deleted successfully.");
        }

        [Function("PersonDeleteAll")]
        public async Task<IActionResult> RunClearAll([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "person/clearall")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a DELETE request.");

            _peopleList.Clear();

            return new OkObjectResult("The list of people has been cleared.");
        }

        [Function("PersonGetList")]
        public async Task<IActionResult> RunGetAll([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request.");

            return new OkObjectResult(_peopleList);
        }

        [Function("PersonListExportJSON")]
        public async Task<IActionResult> RunExportToJSON([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/exportJSON")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request to export JSNO.");

            var jsonContent = JsonConvert.SerializeObject(_peopleList);
            var fileName = "peopleList.json";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(jsonContent));

            return new FileStreamResult(stream, "application/json")
            {
                FileDownloadName = fileName
            };
        }

        [Function("PersonListExportCSV")]
        public async Task<IActionResult> RunExportToCSV([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/exportCSV")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request for CSV export.");

            var csvBuilder = new StringBuilder();
            csvBuilder.AppendLine("FirstName,LastName,Age,Email,PhoneNumber,Address");

            foreach (var person in _peopleList)
            {
                csvBuilder.AppendLine($"{person.FirstName},{person.LastName},{person.Age},{person.Email},{person.PhoneNumber},{person.Address}");
            }

            var csvContent = csvBuilder.ToString();
            var fileName = "peopleList.csv";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(csvContent));

            return new FileStreamResult(stream, "text/csv")
            {
                FileDownloadName = fileName
            };
        }

        [Function("PersonSearch")]
        public async Task<IActionResult> RunSearch([HttpTrigger(AuthorizationLevel.Function, "get", Route = "person/search")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a GET request to search.");

            string query = req.Query["query"];

            if (string.IsNullOrEmpty(query))
            {
                return new BadRequestObjectResult("Please provide a query parameter.");
            }

            var searchResults = _peopleList.Where(p =>
                p.FirstName.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                p.LastName.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                p.Email.Contains(query, StringComparison.OrdinalIgnoreCase)
            ).ToList();

            return new OkObjectResult(searchResults);
        }
    }
}

