# Development Guide

This guide covers the development workflow, tooling, and best practices for the AI Jobs Australia project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Quality Assurance](#quality-assurance)
- [Git Workflow](#git-workflow)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm (comes with Node.js)
- Git

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Husky hooks:
   ```bash
   npm run prepare
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

### Recommended VS Code Extensions

When you open the project in VS Code, you'll be prompted to install recommended extensions:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind CSS autocomplete
- **TypeScript Vue Plugin** - Enhanced TypeScript support
- **Error Lens** - Inline error highlighting

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

This starts the Next.js development server at `http://localhost:3000`.

### 2. Make Changes

- Write code following TypeScript and ESLint rules
- VS Code will show inline errors and warnings
- Save files to trigger auto-formatting

### 3. Before Committing

The pre-commit hook will automatically run when you commit, but you can manually validate:

```bash
# Check TypeScript types
npm run type-check

# Fix linting issues
npm run lint:fix

# Run all checks (type-check + lint + build)
npm run validate
```

## Quality Assurance

We have **5 layers of protection** to prevent broken code from being deployed:

### Layer 1: Development (Real-time)

- **VS Code** shows inline TypeScript and ESLint errors
- **Auto-fix on save** enabled for ESLint
- **Error Lens** extension highlights issues inline

### Layer 2: Pre-Commit (Husky + lint-staged)

When you run `git commit`:
- ✅ TypeScript type-checking on staged files
- ✅ ESLint auto-fix on staged files
- ❌ Commit blocked if errors found

**Files checked**: Only staged `.ts` and `.tsx` files

### Layer 3: Pre-Push (Husky)

When you run `git push`:
- ✅ Full TypeScript type-check
- ✅ ESLint validation
- ❌ Push blocked if errors found

### Layer 4: CI/CD (GitHub Actions)

On every PR and push to `main`:
- ✅ Install dependencies
- ✅ Type-check entire codebase
- ✅ Lint entire codebase
- ✅ Build production bundle
- ❌ Merge blocked if build fails

### Layer 5: Deployment (Vercel)

- Final build check on Vercel
- Only successful builds are deployed

## Git Workflow

### Branch Strategy

- `main` - Production branch (protected)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

### Commit Process

```bash
# Stage your changes
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add contact form validation"

# Push (pre-push hook runs automatically)
git push origin feature/contact-form
```

### What Happens During Commit

```
1. You run: git commit -m "message"
2. Pre-commit hook triggers
3. lint-staged runs on staged files:
   - ESLint auto-fixes issues
   - TypeScript checks for errors
4. If all pass: Commit succeeds ✅
5. If errors found: Commit blocked ❌
```

### What Happens During Push

```
1. You run: git push
2. Pre-push hook triggers
3. Full validation runs:
   - TypeScript type-check (entire codebase)
   - ESLint (entire codebase)
4. If all pass: Push succeeds ✅
5. If errors found: Push blocked ❌
```

## Common Commands

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Quality Checks

```bash
# Type check only
npm run type-check

# Lint (check only)
npm run lint

# Lint and auto-fix
npm run lint:fix

# Run all checks (type + lint + build)
npm run validate
```

### Git Hooks

```bash
# Install/reinstall hooks
npm run prepare

# Skip hooks (emergency only - NOT recommended)
git commit --no-verify
git push --no-verify
```

## Best Practices

### TypeScript

1. **Enable strict mode** - Already configured
2. **Use proper types** - Avoid `any`, use specific types
3. **Import types correctly** - Use `import type` for type-only imports
4. **Validate external data** - Use Zod for runtime validation

### ESLint

1. **Fix warnings** - Don't ignore ESLint warnings
2. **Remove unused imports** - Clean up unused code
3. **Follow React hooks rules** - Proper dependency arrays
4. **Use const** - Prefer `const` over `let` when possible

### Code Quality

1. **Single Responsibility** - Functions do one thing well
2. **DRY Principle** - Don't Repeat Yourself
3. **Meaningful Names** - Use descriptive variable/function names
4. **Comment Complex Logic** - Explain why, not what
5. **Error Handling** - Always handle errors gracefully

### Security

1. **Validate Inputs** - Always validate user input (client + server)
2. **Sanitize Data** - Prevent XSS attacks
3. **Rate Limiting** - Protect API endpoints
4. **Environment Variables** - Never commit secrets

## Troubleshooting

### Pre-commit Hook Fails

**Problem**: Commit blocked with TypeScript or ESLint errors

**Solution**:
```bash
# Check what's wrong
npm run type-check
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Fix TypeScript issues manually
```

### Pre-push Hook Fails

**Problem**: Push blocked with errors

**Solution**:
```bash
# Run validation locally
npm run validate

# Fix all errors before pushing
```

### Husky Not Working

**Problem**: Hooks not running on commit/push

**Solution**:
```bash
# Reinstall Husky
npm run prepare

# Check if hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### CI/CD Failing

**Problem**: GitHub Actions build failing

**Solution**:
1. Check the Actions tab on GitHub for error details
2. Run `npm run validate` locally
3. Fix all errors
4. Push again

### Bypass Hooks (Emergency Only)

**⚠️ Only use in emergencies!**

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip pre-push hook
git push --no-verify
```

**Note**: CI/CD will still catch errors, so this only helps temporarily.

## Getting Help

- **TypeScript Errors**: Check the [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **ESLint Issues**: Run `npm run lint:fix` to auto-fix most issues
- **Next.js Questions**: [Next.js Documentation](https://nextjs.org/docs)
- **React Issues**: [React Documentation](https://react.dev)

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all validation passes (`npm run validate`)
4. Create a Pull Request
5. Wait for CI/CD checks to pass
6. Get code review approval
7. Merge to main

---

**Remember**: The automated checks are here to help you catch errors early. Don't fight them - they prevent production bugs! 🚀
