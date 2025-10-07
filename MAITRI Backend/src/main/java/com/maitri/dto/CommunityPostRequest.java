package com.maitri.dto;

public class CommunityPostRequest {
    private String category;
    private String title;
    private String content;
    private Boolean isAnonymous;
    
    // Constructors
    public CommunityPostRequest() {}
    
    public CommunityPostRequest(String category, String title, String content, Boolean isAnonymous) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.isAnonymous = isAnonymous;
    }
    
    // Getters and Setters
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
    
    public Boolean getIsAnonymous() {
        return isAnonymous;
    }
    
    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }
}
