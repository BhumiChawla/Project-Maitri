package com.maitri.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.ChatRequest;
import com.maitri.dto.ChatResponse;
import com.maitri.service.AiService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChatController {

    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/message")
    public Mono<ResponseEntity<ChatResponse>> sendMessage(@RequestBody ChatRequest chatRequest) {
        // Validate request
        if (chatRequest == null || chatRequest.getMessage() == null || chatRequest.getMessage().trim().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest()
                .body(new ChatResponse("Please enter a valid message.", System.currentTimeMillis(), "Maitri")));
        }
        
        System.out.println("Processing chat message: " + chatRequest.getMessage());
        
        return aiService.getChatResponse(chatRequest.getMessage())
                .map(response -> {
                    System.out.println("Received AI response: " + response);
                    ChatResponse chatResponse = new ChatResponse();
                    chatResponse.setMessage(response);
                    chatResponse.setTimestamp(System.currentTimeMillis());
                    chatResponse.setSender("Maitri");
                    return ResponseEntity.ok(chatResponse);
                })
                .doOnError(error -> System.err.println("Error in ChatController: " + error.getMessage()))
                .onErrorReturn(ResponseEntity.ok()
                        .body(new ChatResponse(generateFallbackResponse(chatRequest.getMessage()),
                                System.currentTimeMillis(), "Maitri")));
    }

    private String generateFallbackResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();

        // Simple greeting
        if (lowerMessage.matches("^(hi|hello|hey|good morning|good afternoon|good evening)$")) {
            return "Hi there! 😊 I'm Maitri, your wellness companion. I'm having some AI connectivity issues right now, but I can still help! How are you feeling today?";
        }

        // Thank you
        if (lowerMessage.contains("thank") || lowerMessage.contains("thanks")) {
            return "You're so welcome! I'm always here when you need me. 😊 (Note: My AI features are temporarily unavailable, but I can still provide basic guidance!)";
        }

        // Headache symptoms
        if (lowerMessage.contains("headache") || lowerMessage.contains("head pain") || lowerMessage.contains("migraine")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For headache relief, try these steps immediately: 1) Drink a full glass of water, 2) Apply a cold compress to your forehead or warm compress to neck, 3) Rest in a quiet, dark room, 4) Gently massage your temples. This could be from dehydration, stress, eye strain, or hormonal changes. If headaches are severe, frequent, or accompanied by vision changes, see a doctor within 24 hours.";
        }

        // Period/menstrual pain
        if (lowerMessage.contains("period") || lowerMessage.contains("menstrual") || lowerMessage.contains("cramp") || lowerMessage.contains("pms")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For period pain relief: 1) Apply heat (heating pad or warm bath), 2) Try gentle yoga or light stretching, 3) Stay hydrated, 4) Consider anti-inflammatory medication if you normally take it. Period pain happens due to uterine contractions from hormone changes. See a doctor if pain is severe enough to interfere with daily activities or if you experience heavy bleeding with large clots.";
        }

        // Stomach/digestive issues
        if (lowerMessage.contains("stomach") || lowerMessage.contains("nausea") || lowerMessage.contains("digestive") || lowerMessage.contains("bloating")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For stomach discomfort: 1) Sip on ginger tea or chew fresh ginger, 2) Try peppermint tea, 3) Eat small, bland foods like crackers or toast, 4) Avoid lying down immediately after eating. This could be from stress, food sensitivity, hormonal changes, or eating too quickly. Consult a doctor if you have persistent pain, vomiting, or symptoms lasting more than 48 hours.";
        }

        // Stress/anxiety symptoms
        if (lowerMessage.contains("stress") || lowerMessage.contains("anxious") || lowerMessage.contains("worried") || lowerMessage.contains("overwhelmed") || lowerMessage.contains("panic")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For immediate stress relief: 1) Try the 4-7-8 breathing technique (inhale for 4, hold for 7, exhale for 8), 2) Practice grounding - name 5 things you can see, 4 you can touch, 3 you can hear, 3) Step outside for fresh air if possible, 4) Do gentle stretching. Stress affects your body through hormone release. If anxiety is interfering with sleep, work, or daily life, consider speaking with a counselor or doctor.";
        }

        // Fatigue/tiredness
        if (lowerMessage.contains("tired") || lowerMessage.contains("fatigue") || lowerMessage.contains("exhausted") || lowerMessage.contains("energy")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For fatigue relief: 1) Ensure you're drinking enough water, 2) Try a 10-15 minute walk in natural light, 3) Eat a balanced snack with protein and complex carbs, 4) Check if you're getting 7-9 hours of sleep. Fatigue can result from iron deficiency, hormonal changes, stress, or poor sleep quality. See a doctor if fatigue persists despite adequate rest or if it's accompanied by other concerning symptoms.";
        }

        // Sleep issues
        if (lowerMessage.contains("sleep") || lowerMessage.contains("insomnia") || lowerMessage.contains("can't sleep")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For better sleep tonight: 1) Keep room cool and dark, 2) Try progressive muscle relaxation, 3) Avoid screens 1 hour before bed, 4) Consider chamomile tea or magnesium supplement if you normally take them. Sleep issues often relate to stress, hormonal fluctuations, or irregular schedules. If sleep problems persist for more than 2 weeks, discuss with a healthcare provider.";
        }

        // General pain
        if (lowerMessage.contains("pain") || lowerMessage.contains("hurt") || lowerMessage.contains("ache")) {
            return "⚠️ AI temporarily unavailable - Using backup health guidance: For general pain management: 1) Apply appropriate heat or cold therapy, 2) Try gentle movement or stretching, 3) Stay hydrated, 4) Practice relaxation techniques. Pain can have many causes including muscle tension, inflammation, or stress. If pain is severe, sudden, or doesn't improve with basic care, please see a healthcare provider promptly.";
        }

        // Default response
        return "⚠️ My AI features are temporarily unavailable, but I'm still here to help with basic wellness guidance! What would you like to know about? (Please try again in a few minutes for full AI assistance)";
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running!");
    }
}
