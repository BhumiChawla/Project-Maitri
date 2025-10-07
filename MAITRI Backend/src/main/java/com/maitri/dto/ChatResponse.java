package com.maitri.dto;

public class ChatResponse {
    private String message;
    private String sender;
    private long timestamp;
    private String type;

    // Default constructor
    public ChatResponse() {
        this.timestamp = System.currentTimeMillis();
        this.sender = "Maitri";
        this.type = "text";
    }

    // Constructor with message
    public ChatResponse(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
        this.sender = "Maitri";
        this.type = "text";
    }

    // Constructor with message, timestamp, and sender
    public ChatResponse(String message, long timestamp, String sender) {
        this.message = message;
        this.timestamp = timestamp;
        this.sender = sender;
        this.type = "text";
    }

    // Constructor with all fields
    public ChatResponse(String message, String sender, long timestamp, String type) {
        this.message = message;
        this.sender = sender;
        this.timestamp = timestamp;
        this.type = type;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "ChatResponse{" +
                "message='" + message + '\'' +
                ", sender='" + sender + '\'' +
                ", timestamp=" + timestamp +
                ", type='" + type + '\'' +
                '}';
    }
}