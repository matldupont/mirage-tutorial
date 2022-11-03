// Welcome to the tutorial!
import {
  belongsTo,
  createServer,
  Factory,
  hasMany,
  Model,
  RestSerializer,
  trait,
} from "miragejs";

export default function (environment = "development") {
  return createServer({
    environment,
    models: {
      list: Model.extend({
        reminders: hasMany(),
      }),
      reminder: Model.extend({
        list: belongsTo(),
      }),
    },
    factories: {
      list: Factory.extend({
        name(i) {
          return `List ${i}`;
        },
        withReminders: trait({
          afterCreate(list, server) {
            server.createList("reminder", 5, { list });
          },
        }),
      }),
      reminder: Factory.extend({
        text(i) {
          return `Reminder ${i}`;
        },
      }),
    },
    seeds(server) {
      server.create("reminder", { text: "Walk the dog" });
      server.create("reminder", { text: "Take out the trash" });
      server.create("reminder", { text: "Work out" });

      server.create("list", {
        name: "Home",
        reminders: [server.create("reminder", { text: "Do taxes" })],
      });

      server.create("list", {
        name: "Work",
        reminders: [server.create("reminder", { text: "Visit bank" })],
      });
    },
    routes() {
      this.get("/api/reminders", (schema) => {
        return schema.reminders.all();
      });

      this.post("/api/reminders", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        console.log(attrs);
        return schema.reminders.create(attrs);
      });

      this.delete("/api/reminders/:id", (schema, request) => {
        const id = request.params.id;
        return schema.reminders.find(id).destroy();
      });

      this.get("/api/lists", (schema, request) => {
        return schema.lists.all();
      });

      this.get("/api/lists/:id/reminders", (schema, request) => {
        const listId = request.params.id;
        const list = schema.lists.find(listId);

        return list.reminders;
      });

      this.post("/api/lists", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        console.log(attrs);
        return schema.lists.create(attrs);
      });

      this.delete("/api/lists/:id", (schema, request) => {
        const id = request.params.id;
        return schema.lists.find(id).destroy();
      });
    },
    serializers: {
      reminder: RestSerializer.extend({
        include: ["list"],
        embed: true,
      }),
    },
  });
}
