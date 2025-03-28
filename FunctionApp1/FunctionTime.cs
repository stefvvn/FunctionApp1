using System;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FunctionApp1
{
    public class FunctionTime
    {
        private readonly ILogger _logger;

        public FunctionTime(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<FunctionTime>();
        }

        //[Function("PersonListCount")]
        //public void RunPersonListCount([TimerTrigger("0 * * * * *")] TimerInfo myTimer)
        //{
        //    _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");

        //    int count = FunctionHttp._peopleList.Count();
        //    _logger.LogInformation($"There are {count} people in the list.");

        //    if (myTimer.ScheduleStatus is not null)
        //    {
        //        _logger.LogInformation($"Next timer schedule at: {myTimer.ScheduleStatus.Next}");
        //    }
        //}
    }
}
