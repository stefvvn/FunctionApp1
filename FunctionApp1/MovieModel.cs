using System.Text.Json.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace FunctionApp1
{
    public class MovieModel
    {
        //[BsonElement("_id")]
        //[JsonPropertyName("_id")]
        //public string Id { get; set; }

        [BsonElement("plot")]
        [JsonPropertyName("plot")]
        public string Plot { get; set; }

        [BsonElement("genres")]
        [JsonPropertyName("genres")]
        public List<string> Genres { get; set; }

        [BsonElement("runtime")]
        [JsonPropertyName("runtime")]
        public int Runtime { get; set; }

        [BsonElement("rated")]
        [JsonPropertyName("rated")]
        public string Rated { get; set; }

        [BsonElement("cast")]
        [JsonPropertyName("cast")]
        public List<string> Cast { get; set; }

        [BsonElement("title")]
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [BsonElement("fullplot")]
        [JsonPropertyName("fullplot")]
        public string Fullplot { get; set; }

        [BsonElement("languages")]
        [JsonPropertyName("languages")]
        public List<string> Languages { get; set; }

        [BsonElement("released")]
        [JsonPropertyName("released")]
        public DateTime Released { get; set; }

        [BsonElement("directors")]
        [JsonPropertyName("directors")]
        public List<string> Directors { get; set; }

        [BsonElement("writers")]
        [JsonPropertyName("writers")]
        public List<string> Writers { get; set; }

        [BsonElement("awards")]
        [JsonPropertyName("awards")]
        public Awards Awards { get; set; }

        [BsonElement("lastupdated")]
        [JsonPropertyName("lastupdated")]
        public DateTime LastUpdated { get; set; }

        [BsonElement("year")]
        [JsonPropertyName("year")]
        public int Year { get; set; }

        [BsonElement("imdb")]
        [JsonPropertyName("imdb")]
        public Imdb Imdb { get; set; }

        [BsonElement("countries")]
        [JsonPropertyName("countries")]
        public List<string> Countries { get; set; }

        [BsonElement("type")]
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [BsonElement("tomatoes")]
        [JsonPropertyName("tomatoes")]
        public Tomatoes Tomatoes { get; set; }

        [BsonElement("num_mflix_comments")]
        [JsonPropertyName("num_mflix_comments")]
        public int NumMflixComments { get; set; }
    }

    public class Awards
    {
        [BsonElement("wins")]
        [JsonPropertyName("wins")]
        public int Wins { get; set; }

        [BsonElement("nominations")]
        [JsonPropertyName("nominations")]
        public int Nominations { get; set; }

        [BsonElement("text")]
        [JsonPropertyName("text")]
        public string Text { get; set; }
    }

    public class Imdb
    {
        [BsonElement("rating")]
        [JsonPropertyName("rating")]
        public double Rating { get; set; }

        [BsonElement("votes")]
        [JsonPropertyName("votes")]
        public int Votes { get; set; }

        [BsonElement("id")]
        [JsonPropertyName("id")]
        public int Id { get; set; }
    }

    public class Tomatoes
    {
        [BsonElement("viewer")]
        [JsonPropertyName("viewer")]
        public Viewer Viewer { get; set; }

        [BsonElement("production")]
        [JsonPropertyName("production")]
        public string Production { get; set; }

        [BsonElement("lastupdated")]
        [JsonPropertyName("lastupdated")]
        public DateTime LastUpdated { get; set; }
    }

    public class Viewer
    {
        [BsonElement("rating")]
        [JsonPropertyName("rating")]
        public double Rating { get; set; }

        [BsonElement("numreviews")]
        [JsonPropertyName("numreviews")]
        public int NumReviews { get; set; }

        [BsonElement("meter")]
        [JsonPropertyName("meter")]
        public int Meter { get; set; }
    }
}
