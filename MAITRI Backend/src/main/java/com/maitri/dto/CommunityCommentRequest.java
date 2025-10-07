package com.maitri.dto;

public class CommunityCommentRequest {
    private String content;
    
    // Constructors
    public CommunityCommentRequest() {}
    
    public CommunityCommentRequest(String content) {
        this.content = content;
    }
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
}