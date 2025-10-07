package com.maitri.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.maitri.dto.CommunityCommentRequest;
import com.maitri.dto.CommunityCommentResponse;
import com.maitri.dto.CommunityPostRequest;
import com.maitri.dto.CommunityPostResponse;
import com.maitri.model.CommunityComment;
import com.maitri.model.CommunityLike;
import com.maitri.model.CommunityPost;
import com.maitri.repository.CommunityCommentRepository;
import com.maitri.repository.CommunityLikeRepository;
import com.maitri.repository.CommunityPostRepository;

@Service
@Transactional
public class CommunityService {
    
    @Autowired
    private CommunityPostRepository postRepository;
    
    @Autowired
    private CommunityCommentRepository commentRepository;
    
    @Autowired
    private CommunityLikeRepository likeRepository;
    
    /**
     * Get all posts for community feed
     */
    public List<CommunityPostResponse> getAllPosts(Long currentUserId) {
        List<CommunityPost> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(post -> mapToPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Create a new community post
     */
    public CommunityPostResponse createPost(CommunityPostRequest request, Long userId, String userName) {
        // Determine display name and avatar
        String displayName = request.getIsAnonymous() ? "Anonymous" : userName;
        
        CommunityPost post = new CommunityPost(
            userId,
            displayName,
            request.getIsAnonymous(),
            request.getCategory(),
            request.getTitle(),
            request.getContent()
        );
        
        // Set the userName field explicitly (this is the raw username)
        post.setUserName(userName);
        
        CommunityPost savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost, userId);
    }
    
    /**
     * Delete a post (only by the post owner)
     */
    public void deletePost(Long postId, Long userId) {
        Optional<CommunityPost> postOpt = postRepository.findById(postId);
        
        if (!postOpt.isPresent()) {
            throw new RuntimeException("Post not found");
        }
        
        CommunityPost post = postOpt.get();
        
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts");
        }
        
        postRepository.delete(post);
    }
    
    /**
     * Like/Unlike a post
     */
    public CommunityPostResponse toggleLike(Long postId, Long userId) {
        Optional<CommunityPost> postOpt = postRepository.findById(postId);
        
        if (!postOpt.isPresent()) {
            throw new RuntimeException("Post not found");
        }
        
        CommunityPost post = postOpt.get();
        Optional<CommunityLike> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingLike.isPresent()) {
            // Unlike the post
            likeRepository.delete(existingLike.get());
            post.setLikesCount(post.getLikesCount() - 1);
        } else {
            // Like the post
            CommunityLike like = new CommunityLike(post, userId);
            likeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);
        }
        
        CommunityPost updatedPost = postRepository.save(post);
        return mapToPostResponse(updatedPost, userId);
    }
    
    /**
     * Add a comment to a post
     */
    public CommunityCommentResponse addComment(Long postId, CommunityCommentRequest request, Long userId, String userName) {
        Optional<CommunityPost> postOpt = postRepository.findById(postId);
        
        if (!postOpt.isPresent()) {
            throw new RuntimeException("Post not found");
        }
        
        CommunityPost post = postOpt.get();
        
        CommunityComment comment = new CommunityComment(post, userId, userName, request.getContent());
        CommunityComment savedComment = commentRepository.save(comment);
        
        // Update comments count
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);
        
        return mapToCommentResponse(savedComment, userId);
    }
    
    /**
     * Get comments for a post
     */
    public List<CommunityCommentResponse> getPostComments(Long postId, Long currentUserId) {
        List<CommunityComment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        return comments.stream()
                .map(comment -> mapToCommentResponse(comment, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Get posts by category
     */
    public List<CommunityPostResponse> getPostsByCategory(String category, Long currentUserId) {
        List<CommunityPost> posts = postRepository.findByCategoryOrderByCreatedAtDesc(category);
        return posts.stream()
                .map(post -> mapToPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Search posts
     */
    public List<CommunityPostResponse> searchPosts(String keyword, Long currentUserId) {
        List<CommunityPost> posts = postRepository.searchPosts(keyword);
        return posts.stream()
                .map(post -> mapToPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Map CommunityPost entity to response DTO
     */
    private CommunityPostResponse mapToPostResponse(CommunityPost post, Long currentUserId) {
        // Generate avatar from author name
        String avatar = generateAvatar(post.getAuthorName());
        
        // Format time ago
        String timeAgo = formatTimeAgo(post.getCreatedAt());
        
        // Parse tags (if any)
        List<String> tags = new ArrayList<>();
        if (post.getTags() != null && !post.getTags().isEmpty()) {
            tags = Arrays.asList(post.getTags().split(","));
        }
        
        // Check if user has liked this post
        Boolean isLikedByUser = currentUserId != null ? 
            likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId) : false;
        
        // Check if this is user's own post
        Boolean isOwnPost = currentUserId != null && post.getUserId().equals(currentUserId);
        
        return new CommunityPostResponse(
            post.getId(),
            post.getAuthorName(),
            avatar,
            timeAgo,
            post.getCategory(),
            post.getTitle(),
            post.getContent(),
            post.getLikesCount(),
            post.getCommentsCount(),
            tags,
            isLikedByUser,
            isOwnPost,
            post.getCreatedAt()
        );
    }
    
    /**
     * Map CommunityComment entity to response DTO
     */
    private CommunityCommentResponse mapToCommentResponse(CommunityComment comment, Long currentUserId) {
        String avatar = generateAvatar(comment.getAuthorName());
        String timeAgo = formatTimeAgo(comment.getCreatedAt());
        Boolean isOwnComment = currentUserId != null && comment.getUserId().equals(currentUserId);
        
        return new CommunityCommentResponse(
            comment.getId(),
            comment.getAuthorName(),
            avatar,
            comment.getContent(),
            timeAgo,
            isOwnComment,
            comment.getCreatedAt()
        );
    }
    
    /**
     * Generate avatar initials from name
     */
    private String generateAvatar(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "U";
        }
        
        if ("Anonymous".equalsIgnoreCase(name)) {
            return "A";
        }
        
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + "" + parts[1].charAt(0)).toUpperCase();
        } else {
            return name.substring(0, Math.min(2, name.length())).toUpperCase();
        }
    }
    
    /**
     * Format time ago string
     */
    private String formatTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);
        
        if (minutes < 1) {
            return "Just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes != 1 ? "s" : "") + " ago";
        } else if (hours < 24) {
            return hours + " hour" + (hours != 1 ? "s" : "") + " ago";
        } else if (days < 7) {
            return days + " day" + (days != 1 ? "s" : "") + " ago";
        } else {
            return dateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        }
    }
}
