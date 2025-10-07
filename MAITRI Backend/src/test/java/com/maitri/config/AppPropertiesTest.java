package com.maitri.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "app.jwt.secret=test-secret",
    "app.jwt.expiration=3600000",
    "app.gemini.apiKey=test-api-key",
    "app.gemini.model=test-model",
    "app.spoonacular.apiKey=test-spoonacular-key",
    "app.spoonacular.baseUrl=http://test.com"
})
class AppPropertiesTest {

    @Autowired
    private AppProperties appProperties;

    @Test
    void testJwtProperties() {
        assertEquals("test-secret", appProperties.getJwt().getSecret());
        assertEquals(3600000L, appProperties.getJwt().getExpiration());
    }

    @Test
    void testGeminiProperties() {
        assertEquals("test-api-key", appProperties.getGemini().getApiKey());
        assertEquals("test-model", appProperties.getGemini().getModel());
    }

    @Test
    void testSpoonacularProperties() {
        assertEquals("test-spoonacular-key", appProperties.getSpoonacular().getApiKey());
        assertEquals("http://test.com", appProperties.getSpoonacular().getBaseUrl());
    }
}