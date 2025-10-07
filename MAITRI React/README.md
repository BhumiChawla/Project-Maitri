# Maitri - Women's Health & Wellness Platform

Maitri is a comprehensive healthcare platform designed specifically for women. It provides AI-powered health assistance, personalized diet planning, doctor finder services, and a supportive community platform.

## Features

### 🤖 AI Assistant - Maitri
- 24/7 AI health companion named Maitri
- Provides guidance on women's health issues
- Answers questions about symptoms, nutrition, and wellness
- Interactive chat interface with quick action buttons

### 🍽️ Personalized Diet Planner
- Custom nutrition plans based on symptoms and health goals
- Considers allergies and dietary preferences
- Provides meal suggestions and supplement recommendations
- Tracks health metrics like BMI and calorie requirements

### 👩‍⚕️ Doctor Finder
- Search doctors by specialization and location
- View doctor profiles, ratings, and availability
- Book online consultations
- Filter by language preferences and price range

### 👥 Community Platform
- Safe space for women to share experiences
- Anonymous posting options
- Share home remedies and wellness tips
- Support groups and peer connections

### 🔐 User Authentication
- Secure login and registration
- Profile management
- Privacy-focused design

## Technology Stack

### Frontend
- **React.js** - Modern JavaScript framework
- **React Router** - Client-side routing
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome** - Icons and visual elements
- **Vite** - Fast build tool and development server

### Planned Backend (Future Implementation)
- **Spring Boot** - Java backend framework
- **PostgreSQL/MySQL** - Database management
- **Spring Security** - Authentication and authorization
- **REST APIs** - Communication between frontend and backend

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation component
│   ├── Home.jsx            # Landing page with animated character
│   ├── Chatbot.jsx         # AI assistant interface
│   ├── DietPlanner.jsx     # Diet planning form and results
│   ├── Doctors.jsx         # Doctor search and listing
│   ├── Community.jsx       # Community forum
│   ├── Login.jsx           # Authentication forms
│   └── Footer.jsx          # Footer component
├── App.jsx                 # Main app component with routing
├── App.css                 # Global styles and animations
├── main.jsx               # React app entry point
└── index.css              # Base styles
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "MAITRI React"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## Features Breakdown

### Home Page
- Interactive animated character
- Cloud navigation to different features
- Feature overview cards
- Responsive design for all devices

### AI Chatbot (Maitri)
- Intelligent responses based on user input
- Pre-defined quick actions for common queries
- Message history and typing indicators
- Responsive chat interface

### Diet Planner
- Multi-step form with health assessment
- Symptom tracking and goal setting
- Personalized recommendations
- Downloadable diet plans

### Doctor Finder
- Advanced search and filtering
- Doctor profile cards with ratings
- Booking simulation (backend integration pending)
- Location-based search

### Community
- Post creation and sharing
- Category-based filtering
- Anonymous posting options
- Like and comment system

## Design Principles

- **Women-Centric**: Designed specifically for women's health needs
- **Privacy-First**: Anonymous options and secure data handling
- **Accessibility**: WCAG compliant and responsive design
- **Modern UI**: Clean, intuitive interface with pleasant animations
- **Mobile-First**: Optimized for mobile devices

## Color Scheme

- Primary: `#e91e63` (Pink)
- Secondary: `#f8bbd9` (Light Pink)
- Text: `#2c3e50` (Dark Gray)
- Background: `#f8f9fa` (Light Gray)

## Future Enhancements

### Backend Integration
- Spring Boot REST API development
- Database schema design and implementation
- User authentication with JWT tokens
- Real-time chat with WebSocket
- File upload for medical records

### Advanced Features
- AI model training for better health recommendations
- Telemedicine video calling integration
- Prescription management system
- Health tracking and analytics
- Push notifications for reminders

### Mobile App
- React Native mobile application
- Offline capabilities
- Push notifications
- Biometric authentication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

### Component Structure
- Use functional components with hooks
- Implement proper prop validation
- Follow consistent naming conventions
- Separate concerns (logic, UI, styling)

### State Management
- Use React hooks for local state
- Consider Context API for global state
- Implement proper error boundaries

### Styling
- Use Bootstrap classes for responsive design
- Custom CSS for specific animations
- Maintain consistent spacing and typography
- Follow mobile-first approach

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the development team.

---

**Note**: This is a frontend prototype. Backend integration with Spring Boot, database connectivity, and production deployment are planned for future releases.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
