const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("../utils/test_helper");

describe("user api tests", () => {

  beforeEach(async () => {
    await helper.setupTestDbUsers(api);
  });

  describe("when there is initially one user saved", () => {
    test("users are returned as json", async () => {
      await api
        .get("/api/users")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });
  });
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

     await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd[0].username, newUser.username);
  });

  test("creation fails with proper statuscode and message if username is missing", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: "Superuser",
      password: "salainen",
    };

     await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with proper statuscode and message if password is missing", async () => {
    const usersAtStart = await helper.usersInDb();
    
    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
    };

     await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  

  

});

after(helper.closeDbConnection);