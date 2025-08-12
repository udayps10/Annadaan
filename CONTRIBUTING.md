# Contributing to FoodRescue

Thank you for your interest in contributing to FoodRescue! This document provides guidelines for contributing to the project.

## 🛠️ Development Setup

1. Fork the repository
2. Clone your fork: `git clone -b foodrescue http://gogs.raunakcodes.me/Raunak/Annadaan`
3. Install dependencies: `npm install`
4. Set up your local database and environment variables
5. Run the development server: `npm run dev`

## 📁 Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Role-specific dashboards
│   └── [other-pages]/     # Public pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## 🎯 Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

## 🧪 Testing

- Write unit tests for utility functions
- Test API endpoints manually
- Ensure responsive design works on mobile

## 📝 Commit Guidelines

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for tests

Example: `feat: add user verification system`

## 🚀 Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit
3. Push to your fork: `git push origin feature/your-feature`
4. Create a pull request with a clear description
5. Ensure all checks pass
6. Address any review feedback

## 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment details
- Screenshots if applicable

## 💡 Feature Requests

For new features:
- Check if it aligns with project goals
- Describe the use case
- Consider implementation complexity
- Discuss in issues before implementing

## 📋 Areas for Contribution

- **UI/UX improvements**: Better design and user experience
- **Performance optimization**: Faster loading and better caching
- **Testing**: Unit tests and integration tests
- **Documentation**: Code comments and user guides
- **Accessibility**: Screen reader support and keyboard navigation
- **Internationalization**: Multi-language support
- **Mobile experience**: Better mobile responsiveness

## 🔐 Security

- Never commit sensitive data (passwords, API keys)
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 📞 Getting Help

- Open an issue for questions
- Check existing issues and documentation
- Be respectful and constructive

Thank you for contributing to FoodRescue! 🙏
