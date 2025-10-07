package com.maitri.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.maitri.model.CommunityLike;

@Repository
public interface CommunityLikeRepository extends JpaRepository<CommunityLike, Long> {
    
    // Find like by post and user
    Optional<CommunityLike> findByPostIdAndUserId(Long postId, Long userId);
    
    // Check if user has liked a post
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    
    // Count likes for a specific post
    Long countByPostId(Long postId);
    
    // Find all likes by user
    List<CommunityLike> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Delete like by post and user
    void deleteByPostIdAndUserId(Long postId, Long userId);
}