# 🌸 MAITRI - Women's Health Platform Setup Guide

## 📋 Prerequisites

- **Java 17+** (JDK)
- **Node.js 18+** (with npm)
- **PostgreSQL 12+** 
- **Maven 3.6+**

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd MAITRI
```

### 2. Database Setup
```sql
-- Create database in PostgreSQL
CREATE DATABASE maitri_db;
```

### 3. Backend Configuration
```bash
cd "MAITRI Backend/src/main/resources"

# Copy the template to create your config file
cp application-template.properties application.properties

# Edit application.properties with your actual values:
# - Database credentials
# - JWT secret key (minimum 256 bits)
# - Gemini AI API key
# - Spoonacular API key
```

### 4. Frontend Setup
```bash
cd "MAITRI React"
npm install
```

### 5. Run the Application

#### Option A: Run Both (Recommended)
```bash
# From project root
./run-both.bat
```

#### Option B: Run Separately
```bash
# Terminal 1 - Backend
cd "MAITRI Backend"
mvn spring-boot:run

# Terminal 2 - Frontend  
cd "MAITRI React"
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8080

## 🔐 Security Setup

### Required Environment Variables
Create your `application.properties` with these values:

```properties
# Database (Replace with your PostgreSQL credentials)
spring.datasource.url=jdbc:postgresql://localhost:5432/maitri_db
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password

# JWT Security (Generate a strong secret key)
app.jwt.secret=your_256_bit_secret_key_here

# AI Services (Get from respective providers)
app.gemini.apiKey=your_gemini_api_key
app.spoonacular.apiKey=your_spoonacular_api_key
```

## 🔑 API Keys Setup

### Google Gemini AI
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `app.gemini.apiKey`

### Spoonacular API
1. Go to [Spoonacular API](https://spoonacular.com/food-api)
2. Sign up for free tier
3. Add to `app.spoonacular.apiKey`

## 🏗️ Project Structure

```
MAITRI/
├── MAITRI Backend/          # Spring Boot Backend
│   ├── src/main/java/       # Java source code
│   ├── src/main/resources/  # Configuration files
│   └── pom.xml             # Maven dependencies
├── MAITRI React/           # React Frontend
│   ├── src/                # React components
│   ├── public/             # Static assets
│   └── package.json        # npm dependencies
└── run-both.bat           # Startup script
```

## ⚠️ Important Security Notes

- **NEVER** commit `application.properties` with real credentials
- Use `application-template.properties` as a reference
- Keep API keys and passwords in environment variables for production
- The `.gitignore` file is configured to exclude sensitive files

## 🎯 Features

- 👩‍⚕️ **Doctor Finder**: Locate women's health specialists
- 🤖 **AI Health Chat**: Gemini-powered health assistant  
- 📅 **Appointment Booking**: Schedule with healthcare providers
- 🥗 **Diet Planning**: Personalized nutrition recommendations
- 👥 **Community Forum**: Women's health discussions
- 🔐 **Secure Authentication**: JWT-based user management

## 📞 Support

If you encounter issues:
1. Check your database connection
2. Verify all API keys are set correctly
3. Ensure ports 8080 and 5174 are available
4. Check application logs for detailed error messages

---

*Built with ❤️ for women's health and wellness*