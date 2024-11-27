const Blog = require("../models/blogModel")
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    id: new mongoose.Types.ObjectId().toString(),
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    id: new mongoose.Types.ObjectId().toString()
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    id: new mongoose.Types.ObjectId().toString(),
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    id: new mongoose.Types.ObjectId().toString()
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    id: new mongoose.Types.ObjectId().toString()
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    id: new mongoose.Types.ObjectId().toString()
  }
]

const initialUser = [
  {
    username: "root",
    name: "Superuser",
    blogs:[],
    id: new mongoose.Types.ObjectId().toString()
  }
]

const createInitialUser = {
  username: "root",
  name: "Superuser",
  password: "secret"
}


const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon", author: "willremovethissoon", url: "willremovethissoon", likes: 7 })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}


const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}


const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const createTestUser = async () => {
  const passwordHash = await bcrypt.hash(createInitialUser.password, 10)
  const user = new User({
      username: createInitialUser.username,
      name: createInitialUser.name,
      passwordHash
  })
  await user.save()
  // console.log("user saved", user)
  
  return user
}

const loginUser = async (api) => {
  const response = await api
      .post("/api/login")
      .send({
          username: createInitialUser.username,
          password: createInitialUser.password
      })
  
  const token = response.body.token
  return token
}

const populateInitialBlogs = async (user) => {
  for (let blog of initialBlogs) {
    const blogObject = new Blog({
        ...blog,
        user: user._id
    })
    blogObject._id = blog.id  // Set the _id explicitly
    await blogObject.save()
}
}

const setupTestDbBlogs = async (api) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create test user
  const user = await createTestUser()

  // Login and get token
  const token = await loginUser(api)
  
  // Insert blogs one by one to preserve IDs
  await populateInitialBlogs(user)

  return { token, user }
}

const setupTestDbUsers = async (api) => {
  await User.deleteMany({})
  const user = await createTestUser()
  const token = await loginUser(api)
  return { token, user }
}

const closeDbConnection = async () => {
  await mongoose.connection.close()
}







const totalLikes = (blogs) => {
  if (blogs.length === 0) return 0
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null
  
  const blogWithMostLikes = blogs.reduce((prev, curr) => 
    prev.likes > curr.likes ? prev : curr
  )

  return {
    title: blogWithMostLikes.title,
    author: blogWithMostLikes.author,
    url: blogWithMostLikes.url,
    likes: blogWithMostLikes.likes,
    id: blogWithMostLikes.id,
    user: blogWithMostLikes.user
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  // First, count blogs per author
  const authorCounts = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
    return counts
  }, {})

  // Then find the author with most blogs
  const [author, blogs_count] = Object.entries(authorCounts).reduce(
    ([maxAuthor, maxCount], [author, count]) => 
      count > maxCount ? [author, count] : [maxAuthor, maxCount],
    ["", 0]
  )

  return { author, blogs: blogs_count }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  // First, count likes per author
  const authorLikes = blogs.reduce((likes, blog) => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
    return likes
  }, {})

  // Then find the author with most likes
  const [author, likes_count] = Object.entries(authorLikes).reduce(
    ([maxAuthor, maxLikes], [author, likes]) => 
      likes > maxLikes ? [author, likes] : [maxAuthor, maxLikes],
    ["", 0]
  )

  return { author, likes: likes_count }
}











// Group related functions and data into objects
const blogHelpers = {
  initialBlogs,
  blogsInDb,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  populateInitialBlogs
}

const userHelpers = {
  initialUser,
  usersInDb,
  createTestUser,
  loginUser,
}

const dbHelpers = {
  nonExistingId,
  closeDbConnection,
  setupTestDbBlogs,
  setupTestDbUsers
}

// Export everything organized by category
module.exports = {
  ...blogHelpers,
  ...userHelpers,
  ...dbHelpers
}