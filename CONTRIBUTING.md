# Contributing to PostgreSQL Health Monitor

We appreciate your interest in contributing! This document provides guidelines for participating in the project.

---

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## Getting Started

### Prerequisites
- Node.js 18+ (download from [nodejs.org](https://nodejs.org))
- PostgreSQL 12+ (for testing with real data)
- Git (for version control)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pg-health-dashboard.git
   cd pg-health-dashboard
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5176 in your browser

4. **Demo mode**
   ```bash
   # With mock data for testing
   http://localhost:5176?demo=true
   ```

### Running Tests

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
pg-health-dashboard/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css               # Global styles
│   │   ├── hooks/
│   │   │   └── useWebSocket.js     # WebSocket custom hook
│   │   ├── context/
│   │   │   └── NotificationContext.jsx
│   │   ├── components/
│   │   │   ├── ClusterOverview.jsx
│   │   │   ├── MetricOverview.jsx
│   │   │   ├── BlockingQueries.jsx
│   │   │   ├── ReplicationLag.jsx
│   │   │   ├── VacuumStats.jsx
│   │   │   ├── ConnectionPool.jsx
│   │   │   ├── QueryExplorer.jsx
│   │   │   ├── LongestRunningQueries.jsx
│   │   │   └── ... (more components)
│   │   └── utils/
│   │       ├── animations.js       # Framer Motion variants
│   │       └── ... (utilities)
│   ├── vite.config.js              # Build configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── package.json
└── infra/                          # Backend/infrastructure (if included)
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions**:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `perf/description` - Performance improvements

### 2. Make Your Changes

#### Code Style
- Use **semicolons** at end of statements
- Use **arrow functions** for callbacks
- Use **destructuring** for imports and props
- Keep components **focused and single-responsibility**
- Add **comments for complex logic**

#### File Naming
- Components: `PascalCase.jsx` (e.g., `BlockingQueries.jsx`)
- Hooks: `camelCase.js` (e.g., `useWebSocket.js`)
- Utilities: `camelCase.js` (e.g., `animations.js`)

#### Example Component Structure
```jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

// Type documentation
/**
 * MyComponent - Description of what this component does
 * @param {Object} props
 * @param {string} props.title - The title to display
 * @param {number} props.value - The metric value
 */
export default function MyComponent({ title, value }) {
  const [state, setState] = useState(null)

  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    }
  }, [])

  const handleClick = () => {
    // Event handler
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-lg bg-white/[0.03]"
    >
      <h3>{title}</h3>
      <p>{value}</p>
      <button onClick={handleClick}>Action</button>
    </motion.div>
  )
}
```

### 3. Test Your Changes

```bash
# Lint your code
npm run lint

# Build and verify no errors
npm run build

# Test in development
npm run dev
```

**Testing checklist**:
- [ ] Component renders without errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations smooth (60 FPS)
- [ ] No console warnings or errors
- [ ] Notifications work correctly
- [ ] Dark theme preserved
- [ ] Accessibility maintained (keyboard nav, ARIA labels)

### 4. Commit Your Changes

```bash
git add .
git commit -m "feature: add query kill confirmation modal

- Add confirmation dialog before killing queries
- Include query preview in modal
- Add toast notification on success/error
- Improve UX for destructive operations

Closes #123"
```

**Commit message guidelines**:
- Use **imperative tense** ("add" not "added", "fix" not "fixed")
- Start with **type prefix**: `feature:`, `fix:`, `docs:`, `refactor:`, `perf:`
- Keep **first line under 72 characters**
- Provide **detailed explanation** in body
- Reference **issue numbers** (Closes #123)

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- **Title**: Clear description of changes
- **Description**: What changed and why
- **Screenshots**: If UI changes (especially mobile)
- **Testing notes**: How to verify the changes

---

## Code Quality Standards

### ESLint Compliance
```bash
npm run lint
```

All code must pass linting without errors or warnings.

### Performance Requirements
- Bundle size: < 250 KB (gzip)
- Initial load: < 2 seconds
- Animations: 60 FPS
- No memory leaks (test with DevTools)

### Accessibility Requirements
- WCAG 2.1 AA compliant
- All interactive elements keyboard accessible
- Proper ARIA labels on components
- Color contrast ratio ≥ 4.5:1
- Semantic HTML structure

### Testing Checklist
- [ ] Renders correctly
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Animations smooth
- [ ] Error states handled gracefully
- [ ] Loading states visible
- [ ] Accessibility verified

---

## Feature Development Guide

### Adding a New Widget/Component

1. **Create the component file**
   ```bash
   touch frontend/src/components/MyNewWidget.jsx
   ```

2. **Implement with error boundary**
   ```jsx
   import WidgetErrorBoundary from './WidgetErrorBoundary'

   function MyNewWidget({ metrics }) {
     return (
       <WidgetErrorBoundary>
         <div className="p-4">
           {/* Component content */}
         </div>
       </WidgetErrorBoundary>
     )
   }
   ```

3. **Add to App.jsx**
   ```jsx
   import MyNewWidget from './components/MyNewWidget'

   // In main layout
   <MyNewWidget metrics={metrics} />
   ```

4. **Update responsive design**
   - Test on mobile (320px width)
   - Test on tablet (768px width)
   - Test on desktop (1024px+ width)

5. **Add animations**
   ```jsx
   import { motion } from 'framer-motion'
   import { cardVariants } from '../utils/animations'

   <motion.div
     initial="initial"
     animate="animate"
     variants={cardVariants}
   >
     {/* Content */}
   </motion.div>
   ```

6. **Add notifications for critical events**
   ```jsx
   const { addNotification } = useNotification()

   // In event handler
   addNotification('Critical issue detected', 'error')
   ```

### Adding a New Hook

1. **Create in hooks directory**
   ```bash
   touch frontend/src/hooks/useMyHook.js
   ```

2. **Implement with proper cleanup**
   ```javascript
   export function useMyHook(initialValue) {
     const [state, setState] = useState(initialValue)

     useEffect(() => {
       // Setup
       return () => {
         // Cleanup - prevent memory leaks
       }
     }, [])

     return { state, setState }
   }
   ```

3. **Export from index**
   Update `frontend/src/hooks/index.js` if created

4. **Add documentation comment**
   ```javascript
   /**
    * useMyHook - Manages some state
    * @param {any} initialValue - Initial state value
    * @returns {Object} { state, setState }
    */
   ```

---

## Bug Report Guidelines

If you find a bug, please:

1. **Check if already reported** - Search existing issues
2. **Provide reproduction steps**
   ```
   1. Open dashboard
   2. Navigate to Active Issues section
   3. Click blocking query card
   4. Expected: Modal opens
   5. Actual: No modal appears
   ```
3. **Include environment info**
   - Browser (Chrome 120, Firefox 121, etc.)
   - OS (Windows 11, macOS 14, Ubuntu 22.04)
   - Device type (Desktop, Tablet, Mobile)
4. **Attach screenshots/videos** if possible
5. **Include console errors** (F12 → Console)

---

## Feature Request Guidelines

To request a feature:

1. **Title**: Clear one-line description
2. **Motivation**: Why is this feature needed?
3. **Proposed solution**: How should it work?
4. **Alternatives considered**: Other approaches?
5. **Additional context**: Mockups, examples, related issues

---

## Documentation

When adding features, update documentation:

- [ ] Update `FEATURES.md` if new functionality
- [ ] Update `ARCHITECTURE.md` if architectural changes
- [ ] Add inline code comments for complex logic
- [ ] Update this file if new development patterns

---

## Commit Message Examples

### Good Examples
```
feature: add dark mode toggle

- Add theme context provider
- Implement localStorage persistence
- Update all components with theme colors
- Add system preference detection

Closes #45
```

```
fix: correct replication lag calculation

The previous logic was summing lag times instead of using maximum.
This caused incorrect status indicators.

Closes #32
```

```
docs: improve component documentation

Added JSDoc comments to all presentational components.
Documented prop requirements and return types.
```

### Avoid These
```
updated stuff
Fixed bugs
WIP
todo
changes
```

---

## Pull Request Review Process

### What We Look For
- **Code Quality**: Follows project standards
- **Functionality**: Feature works as intended
- **Testing**: Properly tested and verified
- **Documentation**: Clear commit messages
- **Performance**: No regressions
- **Accessibility**: WCAG 2.1 AA compliant

### Feedback Types
- 🟢 **Approve**: Ready to merge
- 🟡 **Request Changes**: Needs modifications before merge
- ⚪ **Comment**: Discussion or suggestions (not blocking)

### Responding to Feedback
1. **Address all comments** - Even if just acknowledging
2. **Push new commits** - Don't force-push unless asked
3. **Mark conversations resolved** - After addressing feedback
4. **Re-request review** - After making changes

---

## Performance Guidelines

### Component Performance
```javascript
// Use React.memo for expensive components
export default React.memo(function MyComponent({ data }) {
  // Only re-renders when 'data' prop changes
})

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(data)
}, [data])

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

### Bundle Size
```bash
npm run build
# Check output size in dist/ folder
# Should be < 250 KB gzip
```

### Animation Performance
- Use `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Limit simultaneous animations
- Use `will-change` CSS sparingly

---

## Questions?

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: Contact maintainers directly
- **Documentation**: Check `README.md`, `FEATURES.md`, `ARCHITECTURE.md`

---

## Recognition

Contributors are recognized in:
- Git commit history
- GitHub contributor graph
- `CONTRIBUTORS.md` file (if maintained)
- Release notes

Thank you for contributing! 🎉

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (typically MIT or similar).

For more information, see [LICENSE](LICENSE).
