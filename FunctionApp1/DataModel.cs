using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunctionApp1
{
        public class PostData
        {
            public string Str1 { get; set; }
            public string Str2 { get; set; }
        }

        public class PersonData
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public DateTime BirthDate { get; set; }
            public int Age
            {
                get
                {
                    var today = DateTime.Today;
                    int age = today.Year - BirthDate.Year;
                    if (BirthDate.Date > today.AddYears(-age))
                    {
                        age--;
                    }
                    return age;
                }
            }
            public required string Email { get; set; }
            public string PhoneNumber { get; set; }
            public string Address { get; set; }
        }
}

