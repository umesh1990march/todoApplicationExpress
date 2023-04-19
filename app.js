const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => console.log("Server Started"));
  } catch (err) {
    console.log(`DB: ${err.msg}`);
  }
};

initializeDb();

app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  //console.log(priority);
  const fetchTodoData = `select * from todo
  where 
  priority like '%${priority}%'
  and
  status like "%${status}%"
  and 
  todo like '%${search_q}%'`;
  const todoArray = await db.all(fetchTodoData);
  response.send(todoArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const fetchTodoIdDetails = `select * from todo
    where id = ${todoId};`;
  const todoDetails = await db.get(fetchTodoIdDetails);
  response.send(todoDetails);
});

app.post("/todos/", async (request, response) => {
  const todoAddDetails = request.body;
  //console.log(todoAddDetails);
  const { todo, priority, status } = todoAddDetails;
  const addTodo = `insert into todo
(todo,priority,status)values
("${todo}","${priority}","${status}");`;

  const res = await db.run(addTodo);
  response.send("Todo SuccessFully Added");
  // console.log(res);
});

app.put("/todos/:todoId/", async (request, response) => {
  const todoUpdate = request.body;
  const { todo, priority, status } = todoUpdate;
  const { todoId } = request.params;

  let output = "";
  if (todo !== undefined) {
    output = "Todo";
  } else if (priority !== undefined) {
    output = "Priority";
  } else {
    output = "Status";
  }

  const update = `update todo
set todo ='${todo}',
priority = '${priority}',
status = '${status}'
where id = ${todoId};`;

  await db.run(update);
  response.send(`${output} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `delete from todo 
                            where id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
