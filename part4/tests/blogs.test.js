const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("../utils/test_helper");

describe("blog api tests", () => {
  let token = null;

  beforeEach(async () => {
    const setup = await helper.setupTestDbBlogs(api);
    token = setup.token;
  });

  describe("when there is initially some blogs saved", () => {
    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.body.length, helper.initialBlogs.length);
    });

    test("the unique identifier property of the blog posts must be named <id>", async () => {
      const response = await api.get("/api/blogs");
      const isIdFound = response.body[0].id;
      assert(isIdFound);
    });
  });

  describe("addition of a new blog", () => {
    test("creates a new blog post", async () => {
      const newBlog = {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
      };

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      assert.strictEqual(response.body.title, newBlog.title);
      assert.strictEqual(response.body.author, newBlog.author);
      assert.strictEqual(response.body.url, newBlog.url);
      assert.strictEqual(response.body.likes, newBlog.likes);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    });

    test("if the likes property is missing from the request, it defaults to 0", async () => {
      const newBlog = {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      };

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(response.body.likes, 0);
    });

    test("if the title or url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request.", async () => {
      const newBlog = {
        author: "Edsger W. Dijkstra",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsAtStart = await helper.blogsInDb();

      await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });

    test("fails with status code 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api
        .delete(`/api/blogs/${validNonexistingId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    test("fails with status code 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      await api
        .delete(`/api/blogs/${invalidId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });

    test("fails with status code 401 if token is missing", async () => {
      const blogsAtStart = await helper.blogsInDb();

      await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401);
    });

    test("fails with status code 401 if token is invalid", async () => {
      const blogsAtStart = await helper.blogsInDb();

      await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .set("Authorization", "Bearer invalidToken")
        .expect(401);
    });

    test("fails when attempted by an unauthorized user", async () => {
      const blogsAtStart = await helper.blogsInDb();

      // Create another user
      const unauthorizedUser = {
        username: "unauthorized",
        name: "Unauthorized User",
        password: "secret",
      };

      await api.post("/api/users").send(unauthorizedUser);

      // Login as unauthorized user
      const unauthorizedToken = (
        await api
          .post("/api/login")
          .send({
            username: unauthorizedUser.username,
            password: unauthorizedUser.password,
          })
      ).body.token;

      // Try to delete blog with unauthorized user's token
      await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .set("Authorization", `Bearer ${unauthorizedToken}`)
        .expect(401);
    });
  });

  describe("updating a blog", () => {
    test("succeeds with status code 200 if id is valid", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const updatedBlog = {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 10,
      };

      await api
        .put(`/api/blogs/${blogsAtStart[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedBlog)
        .expect(200);
    });
  });
});

after(helper.closeDbConnection);
