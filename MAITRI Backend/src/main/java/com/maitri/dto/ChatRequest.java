package com.maitri.dto;

public class ChatRequest {
    private String message;
    private String userId;
    private long timestamp;

    // Default constructor
    public ChatRequest() {
    }

    // Constructor with message
    public ChatRequest(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    // Constructor with all fields
    public ChatRequest(String message, String userId, long timestamp) {
        this.message = message;
        this.userId = userId;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ChatRequest{" +
                "message='" + message + '\'' +
                ", userId='" + userId + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}