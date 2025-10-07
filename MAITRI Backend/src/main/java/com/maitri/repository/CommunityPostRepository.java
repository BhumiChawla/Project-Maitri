package com.maitri.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.maitri.model.CommunityPost;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    
    // Find all posts ordered by creation date (newest first)
    List<CommunityPost> findAllByOrderByCreatedAtDesc();
    
    // Find posts by category
    List<CommunityPost> findByCategoryOrderByCreatedAtDesc(String category);
    
    // Find posts by user ID
    List<CommunityPost> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find posts with pagination support
    @Query("SELECT p FROM CommunityPost p ORDER BY p.createdAt DESC")
    List<CommunityPost> findAllPostsOrderByDate();
    
    // Search posts by title or content
    @Query("SELECT p FROM CommunityPost p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.createdAt DESC")
    List<CommunityPost> searchPosts(@Param("keyword") String keyword);
}
