import { Blog } from "../model/blogPostModel.js";
import cloudinary from "../utils/cloudinary.js";

// @desc Create a new blog post
// @route POST /api/posts/create
// @access Private (Admin only)
export const createBlogPost = async (req, res) => {
  try {
    const { title, content, tags, excerpt, status } = req.body;

    const coverImage = req.files ? req.files.coverImage : null;

    let imageUrl = null;
    let imageId = null;

    if (coverImage) {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(coverImage.tempFilePath);
      (imageUrl = result.secure_url), (imageId = result.public_id);
    }

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newBlogPost = new Blog({
      title,
      slug,
      content,
      author: req.user.id, // Assuming req.user is set by authentication middleware
      tags,
      excerpt,
      status,
      coverImage: imageUrl,
      imageId,
    });

    await newBlogPost.save();

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      posts: newBlogPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message,
    });
  }
};

// @desc Get all blog posts
// @route GET /api/posts
// @access Public
export const getBlogPosts = async (req, res) => {
  try {
    const status = req.query.status || "published"; // Default to 'published' if not specified
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page if not specified
    const skip = (page - 1) * limit;

    // Build query object based on status
    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    // Fetch blog posts with pagination and filtering
    const blogPosts = await Blog.find(query)
      .populate("author", "name image")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    // Count total posts for pagination and tab counts
    const [totalPosts, allPosts, totalPublished, totalDrafts] =
      await Promise.all([
        Blog.countDocuments(query), // Total posts based on filter
        Blog.countDocuments(), // Total posts regardless of status
        Blog.countDocuments({ status: "published" }), // Total published
        Blog.countDocuments({ status: "draft" }), // Total drafts
      ]);

    res.status(200).json({
      success: true,
      posts: blogPosts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      count: {
        all: allPosts,
        drafts: totalDrafts,
        published: totalPublished,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts",
      error: error.message,
    });
  }
};

// @desc Get all blog posts by a specific author
// @route GET /api/posts/author/:authorId
// @access Public
export const getBlogPostsByAuthor = async (req, res) => {
  try {
    const blogPosts = await Blog.find({ author: req.params.authorId }).populate(
      "author",
      "name image"
    );

    if (blogPosts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blog posts found for this author",
      });
    }

    res.status(200).json({
      success: true,
      posts: blogPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts by author",
      error: error.message,
    });
  }
};

// @desc Get a single blog post by ID
// @route GET /api/posts/:slug
// @access Public
export const getBlogPostBySlug = async (req, res) => {
  try {
    const blogPost = await Blog.findOne({ slug: req.params.slug }).populate(
      "author",
      "name image"
    );

    console.log("Fetching blog post with slug:", blogPost);

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      post: blogPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
      error: error.message,
    });
  }
};

// @desc Update a blog post by ID
// @route PUT /api/posts/:id
// @access Private (Admin only)
export const updateBlogPost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if the user is the author or an admin
    if (post.author._bsontype.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this blog post",
      });
    }

    const coverImage = req.files ? req.files.coverImage : null;

    let imageUrl = null;
    let imageId = null;

    if (coverImage) {
      // Delete image from cloudinary
      if (post.imageId) {
        await cloudinary.uploader.destroy(post.imageId);
      }

      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(coverImage.tempFilePath);
      (imageUrl = result.secure_url), (imageId = result.public_id);
    }

    // Retain the existing avatar values if no new avatar is selected
    if (!imageUrl && post) {
      imageUrl = post.coverImage;
      imageId = post.imageId;
    }

    const updateData = req.body;
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // If coverImage is provided, add it to the updateData
    if (imageUrl) {
      updateData.coverImage = imageUrl;
      updateData.imageId = imageId;
    }

    // Adding publishedAt date if status is changed to published
    if (updateData.status === "published" && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedBlogPost = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,

      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      post: updatedBlogPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: error.message,
    });
  }
};

// @desc Delete a blog post by ID
// @route DELETE /api/posts/:id
// @access Private (Admin only)
export const deleteBlogPost = async (req, res) => {
  try {
    const deletedBlogPost = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Delete the image from Cloudinary
    if (deletedBlogPost.imageId) {
      await cloudinary.uploader.destroy(deletedBlogPost.imageId);
    }

    // Check if the user is the author or an admin
    if (
      deletedBlogPost.author._bsontype.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog post",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: error.message,
    });
  }
};
