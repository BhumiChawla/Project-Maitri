package com.maitri.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommunityPostResponse {
    private Long id;
    private String author;
    private String avatar;
    private String time;
    private String category;
    private String title;
    private String content;
    private Integer likes;
    private Integer comments;
    private List<String> tags;
    private Boolean isLikedByUser;
    private Boolean isOwnPost;
    private LocalDateTime createdAt;
    
    // Constructors
    public CommunityPostResponse() {}
    
    public CommunityPostResponse(Long id, String author, String avatar, String time, String category,
                               String title, String content, Integer likes, Integer comments,
                               List<String> tags, Boolean isLikedByUser, Boolean isOwnPost, LocalDateTime createdAt) {
        this.id = id;
        this.author = author;
        this.avatar = avatar;
        this.time = time;
        this.category = category;
        this.title = title;
        this.content = content;
        this.likes = likes;
        this.comments = comments;
        this.tags = tags;
        this.isLikedByUser = isLikedByUser;
        this.isOwnPost = isOwnPost;
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
    
    public String getTime() {
        return time;
    }
    
    public void setTime(String time) {
        this.time = time;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Integer getLikes() {
        return likes;
    }
    
    public void setLikes(Integer likes) {
        this.likes = likes;
    }
    
    public Integer getComments() {
        return comments;
    }
    
    public void setComments(Integer comments) {
        this.comments = comments;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    
    public Boolean getIsLikedByUser() {
        return isLikedByUser;
    }
    
    public void setIsLikedByUser(Boolean isLikedByUser) {
        this.isLikedByUser = isLikedByUser;
    }
    
    public Boolean getIsOwnPost() {
        return isOwnPost;
    }
    
    public void setIsOwnPost(Boolean isOwnPost) {
        this.isOwnPost = isOwnPost;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
