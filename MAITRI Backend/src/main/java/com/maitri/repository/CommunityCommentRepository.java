package com.maitri.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.maitri.model.CommunityComment;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    
    // Find comments by post ID ordered by creation date
    List<CommunityComment> findByPostIdOrderByCreatedAtAsc(Long postId);
    
    // Count comments for a specific post
    Long countByPostId(Long postId);
    
    // Find comments by user ID
    List<CommunityComment> findByUserIdOrderByCreatedAtDesc(Long userId);
}