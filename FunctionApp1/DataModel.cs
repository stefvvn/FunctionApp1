﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunctionApp1
{
        public class PersonData
        {   
            public string Id { get; set; }
            public required string Name { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }
        }
    }