# Multani Gym - Ultimate Fitness Companion

A comprehensive fitness and nutrition tracking application built with Next.js, designed to help users achieve their fitness goals through personalized diet planning, target setting, and community engagement.

## 🚀 Features

### Core Functionality
- **User Authentication**: Custom authentication system with registration and login
- **Nutrition Tracking**: Track daily food intake with detailed nutritional information
- **Target Setting**: Set and monitor daily nutrition goals (protein, calories, carbs, fats)
- **Diet Planning**: Create personalized meal plans based on your targets
- **Progress Monitoring**: Visual progress tracking with charts and statistics

### Community Features
- **Q&A Forum**: Ask questions and get answers from the fitness community
- **Reviews System**: Share experiences and rate the platform
- **Admin Dashboard**: Comprehensive admin panel for user and membership management
- **Reminder System**: Broadcast and personal reminders for fitness goals

### Membership Management
- **Membership Plans**: Multiple membership tiers with different features
- **Admin Controls**: Assign memberships and manage user accounts
- **User Profiles**: Detailed user profiles with fitness goals and preferences

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library built on Radix UI
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database for data storage
- **Custom Authentication** - JWT-based authentication system

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class name utilities

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multani-gym
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
multani-gym/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard layout group
│   │   ├── admin/              # Admin pages
│   │   ├── diet/               # Diet planning pages
│   │   ├── profile/            # User profile pages
│   │   ├── questions/          # Q&A forum pages
│   │   ├── reminders/          # Reminders pages
│   │   ├── reviews/            # Reviews pages
│   │   └── targets/            # Target setting pages
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin API endpoints
│   │   ├── auth/               # Authentication endpoints
│   │   ├── diet/               # Diet-related endpoints
│   │   ├── questions/          # Q&A endpoints
│   │   ├── reminders/          # Reminder endpoints
│   │   └── user/               # User management endpoints
│   ├── auth/                   # Authentication pages
│   └── globals.css             # Global styles
├── components/                  # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── navbar.tsx              # Navigation component
│   └── sidebar.tsx             # Sidebar component
├── contexts/                   # React contexts
│   └── auth-context.tsx        # Authentication context
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
│   ├── database.ts             # Database operations
│   ├── mongodb.ts              # MongoDB connection
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions
└── styles/                     # Additional styles
```

## 🎯 Key Features Explained

### Authentication System
- Custom JWT-based authentication
- Role-based access control (User/Admin)
- Secure password handling
- Persistent login sessions

### Nutrition Tracking
- Comprehensive food database
- Macro and micronutrient tracking
- Daily nutrition goals
- Progress visualization

### Admin Dashboard
- User management
- Membership assignment
- Broadcast reminders
- System analytics

### Community Features
- Question and answer forum
- Like/dislike system
- User reviews and ratings
- Community engagement tools

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🔧 Configuration

### Database Setup
The application uses MongoDB for data storage. Make sure to:
1. Set up a MongoDB instance (local or cloud)
2. Create the required collections (handled automatically)
3. Configure the connection string in environment variables

### Environment Variables
- `MONGODB_URI`: MongoDB connection string

## 📱 Usage

### For Users
1. **Register/Login**: Create an account or sign in
2. **Set Targets**: Define your daily nutrition goals
3. **Plan Diet**: Create meal plans based on your targets
4. **Track Progress**: Monitor your daily nutrition intake
5. **Engage**: Ask questions and share reviews

### For Admins
1. **User Management**: View and manage all users
2. **Membership Control**: Assign and manage memberships
3. **Send Reminders**: Broadcast messages to users
4. **Monitor Activity**: Track platform usage and engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Workout tracking and planning
- [ ] Progress photos and measurements
- [ ] Social features and friend connections
- [ ] Mobile app development
- [ ] Integration with fitness devices
- [ ] Advanced analytics and insights
- [ ] Meal recommendation AI
- [ ] Video workout library

---

**Built with ❤️ for the fitness community**# Multanigym1
# Multanigym1
# Multanigym1
# Multanigym1
