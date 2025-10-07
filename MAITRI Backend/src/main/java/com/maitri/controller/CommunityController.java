package com.maitri.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.CommunityCommentRequest;
import com.maitri.dto.CommunityCommentResponse;
import com.maitri.dto.CommunityPostRequest;
import com.maitri.dto.CommunityPostResponse;
import com.maitri.service.CommunityService;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {
    
    @Autowired
    private CommunityService communityService;
    
    /**
     * Get all community posts
     */
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(@RequestParam(required = false) Long userId) {
        try {
            // For now, use a default user ID if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            
            List<CommunityPostResponse> posts = communityService.getAllPosts(currentUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("posts", posts);
            response.put("total", posts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching posts: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Create a new post
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody CommunityPostRequest request, 
                                      @RequestParam(required = false) Long userId,
                                      @RequestParam(required = false) String userName) {
        try {
            // Validation
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                throw new RuntimeException("Title is required");
            }
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new RuntimeException("Content is required");
            }
            if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
                throw new RuntimeException("Category is required");
            }
            
            // For now, use default values if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            String currentUserName = userName != null ? userName : "Test User";
            
            CommunityPostResponse post = communityService.createPost(request, currentUserId, currentUserName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Post created successfully");
            response.put("post", post);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating post: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Delete a post
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, 
                                      @RequestParam(required = false) Long userId) {
        try {
            // For now, use default user ID if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            
            communityService.deletePost(postId, currentUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Post deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error deleting post: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Like/Unlike a post
     */
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long postId, 
                                       @RequestParam(required = false) Long userId) {
        try {
            // For now, use default user ID if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            
            CommunityPostResponse post = communityService.toggleLike(postId, currentUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("post", post);
            response.put("message", post.getIsLikedByUser() ? "Post liked" : "Post unliked");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error toggling like: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Add a comment to a post
     */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long postId, 
                                       @RequestBody CommunityCommentRequest request,
                                       @RequestParam(required = false) Long userId,
                                       @RequestParam(required = false) String userName) {
        try {
            // Validation
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new RuntimeException("Comment content is required");
            }
            
            // For now, use default values if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            String currentUserName = userName != null ? userName : "Test User";
            
            CommunityCommentResponse comment = communityService.addComment(postId, request, currentUserId, currentUserName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comment added successfully");
            response.put("comment", comment);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error adding comment: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get comments for a post
     */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getPostComments(@PathVariable Long postId, 
                                           @RequestParam(required = false) Long userId) {
        try {
            // For now, use default user ID if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            
            List<CommunityCommentResponse> comments = communityService.getPostComments(postId, currentUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("comments", comments);
            response.put("total", comments.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching comments: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get posts by category
     */
    @GetMapping("/posts/category/{category}")
    public ResponseEntity<?> getPostsByCategory(@PathVariable String category, 
                                              @RequestParam(required = false) Long userId) {
        try {
            // For now, use default user ID if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            
            List<CommunityPostResponse> posts = communityService.getPostsByCategory(category, currentUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("posts", posts);
            response.put("category", category);
            response.put("total", posts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching posts by category: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Search posts
     */
    @GetMapping("/posts/search")
    public ResponseEntity<?> searchPosts(@RequestParam String q, 
                                       @RequestParam(required = false) Long userId) {
        try {
            // For now, use default user ID if not provided (for testing)
            Long currentUserId = userId != null ? userId : 1L;
            
            List<CommunityPostResponse> posts = communityService.searchPosts(q, currentUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("posts", posts);
            response.put("query", q);
            response.put("total", posts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error searching posts: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
