package com.maitri.dto;

import java.time.LocalDateTime;

public class CommunityCommentResponse {
    private Long id;
    private String author;
    private String avatar;
    private String content;
    private String time;
    private Boolean isOwnComment;
    private LocalDateTime createdAt;
    
    // Constructors
    public CommunityCommentResponse() {}
    
    public CommunityCommentResponse(Long id, String author, String avatar, String content, 
                                  String time, Boolean isOwnComment, LocalDateTime createdAt) {
        this.id = id;
        this.author = author;
        this.avatar = avatar;
        this.content = content;
        this.time = time;
        this.isOwnComment = isOwnComment;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getTime() {
        return time;
    }
    
    public void setTime(String time) {
        this.time = time;
    }
    
    public Boolean getIsOwnComment() {
        return isOwnComment;
    }
    
    public void setIsOwnComment(Boolean isOwnComment) {
        this.isOwnComment = isOwnComment;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}