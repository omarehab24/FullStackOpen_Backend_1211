const mongoose = require("mongoose")
const config = require("../utils/config")
const User = require("../models/userModel")
const Blog = require("../models/blogModel")

const cleanupDanglingRefs = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(config.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Get all users
    const users = await User.find({})
    console.log(`Found ${users.length} users`)

    let totalDanglingRefs = 0

    // For each user
    for (const user of users) {
      const validBlogs = []
      const invalidBlogs = []

      // Check each blog reference
      for (const blogId of user.blogs) {
        const blog = await Blog.findById(blogId)
        if (blog) {
          validBlogs.push(blogId)
        } else {
          invalidBlogs.push(blogId)
        }
      }

      // If we found invalid references, update the user
      if (invalidBlogs.length > 0) {
        totalDanglingRefs += invalidBlogs.length
        console.log(`User ${user.username} had ${invalidBlogs.length} dangling references`)
        user.blogs = validBlogs
        await user.save()
      }
    }

    console.log(`Cleanup complete. Removed ${totalDanglingRefs} dangling references`)
  } catch (error) {
    console.error("Error during cleanup:", error)
  } finally {
    await mongoose.connection.close()
    console.log("Disconnected from MongoDB")
  }
}

// Run the cleanup
cleanupDanglingRefs()
