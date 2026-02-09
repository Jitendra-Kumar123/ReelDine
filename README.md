# ReelDine 🍽️🎥

A modern, AI-powered social media platform for food enthusiasts to share, discover, and engage with delicious food video reels. Built with the MERN stack and featuring advanced video editing tools, real-time interactions, and intelligent content recommendations.

## 🌟 Features

### Core Functionality
- **Video Reel Sharing**: Upload and share short food videos with advanced editing capabilities
- **Social Interactions**: Like, save, comment, and follow other food creators
- **Real-time Notifications**: Instant updates via WebSocket integration
- **Location-based Discovery**: Find food content near you with geolocation

### AI-Powered Features
- **Smart Recipe Suggestions**: AI-generated recipes based on available ingredients
- **Trend Analysis**: Discover trending food content and hashtags
- **Video Editing Tips**: AI-powered suggestions for better video content
- **Automated Hashtag Generation**: Intelligent tagging for better discoverability
- **Content Quality Scoring**: AI-driven content evaluation

### Advanced Features
- **Video Editing Tools**: Trim, filters, text overlays, and effects
- **Enhanced User Profiles**: Customizable profiles with themes and privacy settings
- **Social Challenges**: Participate in food-related competitions
- **Content Moderation**: Automated and manual content review
- **Analytics Dashboard**: Track engagement and performance metrics
- **Multi-language Support**: Localized experience for global users
- **Dark Mode & Accessibility**: Inclusive design with accessibility features

### Production-Ready Enhancements
- **Security**: Comprehensive authentication, rate limiting, and data sanitization
- **Performance**: Redis caching, database optimization, and CDN integration
- **Scalability**: Background job processing and database migrations
- **Testing**: Complete test coverage with unit, integration, and e2e tests

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Real-time**: Socket.io
- **AI Integration**: OpenAI API
- **File Storage**: ImageKit CDN
- **Authentication**: JWT with bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, XSS protection, rate limiting

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Linting**: ESLint

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Redis server
- ImageKit account (for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ReelDine
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install

   # Create environment file
   cp .env.example .env
   # Configure your environment variables (database URL, JWT secret, etc.)
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Ensure MongoDB is running
   # Run database migrations if available
   npm run migrate
   ```

### Configuration

Create a `.env` file in the Backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reeldine
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=your-imagekit-url-endpoint
OPENAI_API_KEY=your-openai-api-key
```

### Running the Application

1. **Start Backend**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📖 Usage

### For Users
1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Upload Reels**: Share your food videos with the community
3. **Discover Content**: Browse trending reels and follow favorite creators
4. **Interact**: Like, comment, and save interesting content
5. **Edit Videos**: Use built-in tools to enhance your videos
6. **Join Challenges**: Participate in food-related competitions

### For Developers
- **API Documentation**: Available at `/api/docs` when running in development
- **Testing**: Run `npm test` for comprehensive test coverage
- **Linting**: Use `npm run lint` to check code quality

## 🏗️ Project Structure

```
ReelDine/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database and service configurations
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Custom middleware functions
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic and external services
│   │   ├── utils/           # Helper functions and utilities
│   │   └── app.js           # Express app configuration
│   ├── tests/               # Test files
│   ├── migrations/          # Database migration scripts
│   └── server.js            # Server entry point
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── routes/          # Frontend routing
│   │   ├── styles/          # CSS and styling files
│   │   └── assets/          # Static assets
│   ├── public/              # Public static files
│   └── index.html           # HTML template
├── vdeos/                   # Sample video files
└── README.md                # Project documentation
```

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Frontend tests (if implemented)
cd Frontend
npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration for code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for AI-powered features
- ImageKit for media storage and optimization
- The MERN stack community for excellent documentation
- Food enthusiasts worldwide for inspiration

## 📞 Support

For support, email support@reeldine.com or join our Discord community.

**Made with ❤️ for food lovers, by food lovers**

here is my email: jitendrakumar.dev.cs@gmail.com