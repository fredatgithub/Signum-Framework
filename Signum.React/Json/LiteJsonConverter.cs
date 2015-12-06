﻿using Newtonsoft.Json;
using Signum.Engine.Basics;
using Signum.Entities;
using Signum.Utilities;
using Signum.Utilities.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Signum.React.Json
{
    public class LiteJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return typeof(Lite<Entity>).IsAssignableFrom(objectType);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            Lite<Entity> lite = (Lite<Entity>)value;
            writer.WriteStartObject();

            writer.WritePropertyName("EntityType");
            serializer.Serialize(writer, TypeLogic.GetCleanName(lite.EntityType));

            writer.WritePropertyName("id");
            serializer.Serialize(writer, lite.IdOrNull == null ? null : lite.Id.Object);

            writer.WritePropertyName("toStr");
            serializer.Serialize(writer, lite.ToString());

            if (lite.EntityOrNull != null)
            {
                writer.WritePropertyName("entity");
                serializer.Serialize(writer, lite.Entity);
            }

            writer.WriteEndObject();
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            reader.Read();
            Assert(reader, JsonToken.StartObject);

            string toString = null;
            object idObj = null;
            string typeStr = null;
            Entity entity = null;

            reader.Read();
            while (reader.TokenType == JsonToken.PropertyName)
            {
                switch ((string)reader.Value)
                {
                    case "toStr": toString = reader.ReadAsString(); break;
                    case "id": idObj = reader.Value; break;
                    case "EntityType": typeStr = reader.ReadAsString(); break;
                    case "entity": entity = (Entity)serializer.Deserialize(reader, typeof(Entity)); break;
                    default: throw new InvalidOperationException("unexpected property " + (string)reader.Value);
                }

                reader.Read();
            }

            Type type = TypeLogic.GetType(typeStr);

            PrimaryKey? id = idObj == null ? (PrimaryKey?)null :
                new PrimaryKey((IComparable)ReflectionTools.ChangeType(idObj, PrimaryKey.PrimaryKeyType.GetValue(type)));

            if (entity == null)
                return Lite.Create(type, id.Value, toString);

            var result = entity.ToLite(entity.IsNew, toString);

            if (result.EntityType != type)
                throw new InvalidOperationException("Types don't match");

            if (result.Id != id)
                throw new InvalidOperationException("Id's don't match");

            return result;
        }

        private static void Assert(JsonReader reader, JsonToken expected)
        {
            if (reader.TokenType != expected)
                throw new InvalidOperationException("expected {0} but {1} found".FormatWith(expected, reader.TokenType));
        }
    }


}