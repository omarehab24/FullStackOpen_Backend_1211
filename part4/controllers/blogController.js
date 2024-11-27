const blogRouter = require("express").Router()
const Blog = require("../models/blogModel")
const middleware = require("../utils/middleware")

// Routes
blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
  response.json(blogs)
})

blogRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.post("/", middleware.userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: "authentication required" })
  }

  const { title, author, url, likes } = request.body

  if (!title || !url) {
    return response.status(400).json({ error: "title or url missing" })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: request.user._id
  })

  const savedBlog = await blog.save()
  
  request.user.blogs = request.user.blogs.concat(savedBlog._id)
  await request.user.save()

  response.status(201).json(savedBlog)
})

blogRouter.put("/:id", middleware.userExtractor, async (request, response) => {
  const id = request.params.id
  const { name, number } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    id, 
    { name, number }, 
    { new: true, runValidators: true, context: "query" }
  )
  
  updatedBlog 
    ? response.json(updatedBlog) 
    : response.status(404).json({ error: "Blog not found" })
})

blogRouter.delete("/:id", middleware.userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: "authentication required" })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: "blog not found" })
  }

  if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).json({ error: "user not authorized" })
  }

  // Remove the blog
  await Blog.findByIdAndDelete(request.params.id)
  
  // Remove the blog reference from user's blogs array
  request.user.blogs = request.user.blogs.filter(
    blogId => blogId.toString() !== request.params.id
  )
  await request.user.save()
  
  response.status(204).end()
})

module.exports = blogRouter