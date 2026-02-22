# Contributing to Eclipse

First off, thank you for considering contributing to Eclipse! It's people like you that make this such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Follow the JavaScript/TypeScript styleguides
* Include appropriate test cases
* End all files with a newline
* Update documentation as needed
* Follow commit message conventions

## Development Workflow

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/eclipse.git
   cd eclipse/eclipse
   ```

3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/original-owner/eclipse.git
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Make your changes and test them:
   ```bash
   npm run dev
   npm run lint
   ```

7. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```

8. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

9. Open a Pull Request with a clear title and description

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for new code
* Follow the existing code style in the project
* Use meaningful variable and function names
* Add comments for complex logic
* Use type annotations for function parameters and return values

### Component Styleguide

* Use functional components with hooks
* Keep components focused and single-responsibility
* Use descriptive names for components
* Add JSDoc comments for component props
* Organize imports at the top of the file

### CSS/Tailwind Styleguide

* Use Tailwind CSS utility classes
* Keep component styles organized and readable
* Use CSS modules for complex styling when necessary
* Follow Tailwind's class ordering conventions

## Testing

* Write tests for new features when possible
* Ensure all existing tests pass
* Run `npm run lint` before submitting a PR

## Documentation

* Update the README.md if you add or change functionality
* Add comments to clarify complex code sections
* Update environment variable documentation if needed
* Keep the API documentation up to date

## Recognition

Contributors will be recognized in:
* The project README.md
* GitHub contributors page
* Release notes for significant contributions

## Questions?

Feel free to open an issue with the label "question" or reach out to the maintainers.

Thank you for contributing! 🎉
