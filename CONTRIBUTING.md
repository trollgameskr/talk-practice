# Contributing to GeminiTalk

Thank you for your interest in contributing to GeminiTalk! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Device/environment information

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature already exists or is planned
- Describe the feature clearly
- Explain why it would be useful
- Provide examples if possible

### Code Contributions

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/talk-practice.git
   cd talk-practice
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Make Your Changes**
   - Follow the existing code style
   - Write clean, documented code
   - Add tests for new features
   - Update documentation as needed

5. **Test Your Changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

7. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes
   - Submit the PR

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React Native
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use StyleSheet for styling

### Comments
- Write clear, concise comments
- Document complex logic
- Use JSDoc for functions and classes
- Keep comments up-to-date

### File Organization
```
src/
├── services/      # Business logic and API integration
├── screens/       # Screen components
├── components/    # Reusable UI components
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
├── config/        # Configuration files
└── data/          # Static data
```

## Testing

### Unit Tests
- Write tests for utility functions
- Test service methods
- Mock external dependencies
- Aim for high code coverage

### Integration Tests
- Test component interactions
- Test navigation flows
- Test data persistence

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Documentation

- Update README.md for user-facing changes
- Update docs/API.md for API changes
- Add inline documentation for complex code
- Include examples where helpful

## Review Process

1. **Automated Checks**: CI/CD pipeline will run automatically
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Community Guidelines

- Be respectful and constructive
- Follow the code of conduct
- Help others in discussions
- Share knowledge and best practices

## Questions?

If you have questions:
- Check the documentation
- Search existing issues
- Create a new issue with the "question" label
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to GeminiTalk! 🎉
