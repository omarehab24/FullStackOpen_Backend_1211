const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("../utils/test_helper");

describe("blog api tests", () => {
  

  beforeEach(async () => {
    await helper.setupTestDbBlogs(api);
  });

// describe("total likes", () => {
//   test("of empty list is zero", () => {
//     const result = helper.totalLikes([])
//     assert.strictEqual(result, 0)
//   })

//   test("when list has only one blog equals the likes of that", () => {
//     const result = helper.totalLikes([helper.initialBlogs[0]])
//     assert.strictEqual(result, 7)
//   })

//   test("of a bigger list is calculated right", async () => {
//     const blogs = await helper.blogsInDb()
//     const result = helper.totalLikes(blogs)
//     assert.strictEqual(result, 36)
//   })
// })

describe("favorite blog", () => {
  test("of empty list is null", () => {
    const result = helper.favoriteBlog([])
    assert.deepStrictEqual(result, null)
  })

  test("when list has only one blog equals the blog", () => {
    const result = helper.favoriteBlog([helper.initialBlogs[0]])
    assert.deepStrictEqual(result, helper.initialBlogs[0])
  })

  test("of a bigger list is calculated right", async () => {
    const blogs = await helper.blogsInDb()
    const result = helper.favoriteBlog(blogs)
    console.log("blogs", blogs)
    console.log("result", result)
    assert.deepStrictEqual(result, helper.initialBlogs[2])
  })
})

// describe("most blogs", () => {
//   test("of empty list is null", () => {
//     const result = helper.mostBlogs([])
//     assert.deepStrictEqual(result, null)
//   })

//   test("when list has only one blog equals the blog", () => {
//     const result = helper.mostBlogs([helper.initialBlogs[0]])
//     assert.deepStrictEqual(result, { author: "Michael Chan", blogs: 1 })
//   })

//   test("of a bigger list is calculated right", async () => {
//     const blogs = await helper.blogsInDb()
//     const result = helper.mostBlogs(blogs)
//     assert.deepStrictEqual(result, { author: "Robert C. Martin", blogs: 3 })
//   })
// })

// describe("most likes", () => {
//   test("of empty list is null", () => {
//     const result = helper.mostLikes([])
//     assert.deepStrictEqual(result, null)
//   })

//   test("when list has only one blog equals the blog", () => {
//     const result = helper.mostLikes([helper.initialBlogs[0]])
//     assert.deepStrictEqual(result, { author: "Michael Chan", likes: 7 })
//   })

//   test("of a bigger list is calculated right", async () => {
//     const blogs = await helper.blogsInDb()
//     const result = helper.mostLikes(blogs)
//     assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 17 })
//   })
// })






});

after(helper.closeDbConnection);
