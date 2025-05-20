# ProperView Real Estate Platform

ProperView is a modern real estate platform that connects property agents with potential buyers and renters. The platform provides a seamless experience for both agents and visitors, with features for property management, analytics, inquiry handling, and an interactive map view for property search.

---

## Challenge Comparison: Requested vs Delivered

| Feature/Requirement                | Requested in Challenge | Delivered in ProperView |
|------------------------------------|:---------------------:|:----------------------:|
| Agent Dashboard (CRUD)             |          ✔️           |           ✔️           |
| Simulated Agent Login              |          ✔️           |           ✔️           |
| Public Listings Page               |          ✔️           |           ✔️           |
| Filtering (price, bedrooms, loc.)  |          ✔️           |           ✔️           |
| Property Details                   |          ✔️           |           ✔️           |
| Inquiry Submission                 |          ✔️           |           ✔️           |
| REST API Endpoints                 |          ✔️           |           ✔️           |
| Database Seeding                   |          ✔️           |           ✔️           |
| Accessibility (WCAG 2.1)           |          ❌           |           ✔️           |
| Comprehensive Testing              |          ❌           |           ✔️           |
| Performance Optimizations          |          ❌           |           ✔️           |
| Extensive Documentation            |          ❌           |           ✔️           |
| Error Handling & Validation        |          ❌           |           ✔️           |
| Developer Experience Enhancements  |          ❌           |           ✔️           |
| **Map View (Zillow-style)**        |          ❌           |           ✔️           |

---

## Features

### For Visitors
- Browse property listings with advanced filtering options
- View detailed property information
- Submit inquiries about properties
- Filter properties by location, price range, and bedrooms
- **Interactive Map View**: Search by location (e.g., "Chicago") to see a split view with a Mapbox-powered map on the left and property cards on the right, similar to Zillow. Click markers to view property details.

### For Agents
- Manage property listings (create, edit, delete)
- View property analytics (views, inquiries, days on market)
- Track property performance
- Handle incoming inquiries

## Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Mapping**: Mapbox GL JS for interactive map view
- **Testing**: Jest and React Testing Library
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git
- **Mapbox Access Token** (for map view): [Get a free token from Mapbox](https://account.mapbox.com/access-tokens/)

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/proper-view.git
   cd proper-view
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration, including NEXT_PUBLIC_MAPBOX_TOKEN
   ```
4. **Set up the database:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Agent Login
To access the Agent Dashboard, log in using one of the following agent names:
- **John Doe**
- **Jane Smith**

(These are seeded users for demo purposes.)

---

## Features (continued)

- **Map View Integration**: When a user searches for a location, the listings page displays a split view with a Mapbox map and property cards, allowing for an intuitive, modern property search experience.

## Running Commands

| Task                | Command                       |
|---------------------|-------------------------------|
| Start dev server    | `npm run dev`                 |
| Run all tests       | `npm test`                    |
| Test (watch mode)   | `npm test -- --watch`         |
| Test (coverage)     | `npm test -- --coverage`      |
| Build for prod      | `npm run build`               |
| Lint code           | `npm run lint`                |
| Format code         | `npm run format`              |

---

## Quick Reference

- **Add a property:** Use the Agent Dashboard, click "Add Property"
- **Edit/delete property:** Use the Agent Dashboard, select a property
- **Filter listings:** Use the filter bar on the public listings page
- **Submit inquiry:** Click "Inquire" on a property detail page
- **Run tests:** `npm test`
- **Check coverage:** `npm test -- --coverage`
- **Update docs:** Edit README.md, CONTRIBUTING.md, or PROJECT_SUMMARY.md

---

## Documentation Links

- [Executive Summary](./EXECUTIVE_SUMMARY.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Version & Release Notes](./VERSION.md)
- [BDD Scenarios](./bdd.mdc)
- [Testing Guidelines](./testing.mdc)

---

For more details, see the full documentation in each file above.

## Testing

The project follows a Test-Driven Development (TDD) approach with Behavior-Driven Development (BDD) scenarios. Tests are written using Jest and React Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- Unit tests for components and utilities
- Integration tests for API routes
- End-to-end tests for critical user flows
- Accessibility tests for UI components

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── agent/             # Agent-specific pages
│   ├── api/               # API routes
│   └── properties/        # Property-related pages
├── components/            # React components
│   ├── agent/            # Agent-specific components
│   ├── properties/       # Property-related components
│   └── ui/              # Shared UI components
├── lib/                  # Utility functions and configurations
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Document components with JSDoc

### Testing Approach

1. Write failing tests first (Red)
2. Implement the feature to make tests pass (Green)
3. Refactor the code while keeping tests passing (Refactor)

### BDD Scenarios

The project follows BDD scenarios defined in `bdd.mdc`. Each feature should:
1. Have corresponding BDD scenarios
2. Include test coverage for all scenarios
3. Document edge cases and error handling

## Accessibility Features

The platform is built with accessibility as a core requirement, following WCAG 2.1 guidelines:

### Screen Reader Support
- ARIA live regions for dynamic content updates
- Descriptive labels for all interactive elements
- Proper heading hierarchy and document structure
- Status announcements for form submissions and filter changes

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Logical tab order through forms and navigation
- Keyboard shortcuts for common actions
- Focus management for modals and dropdowns

### Visual Accessibility
- High contrast color schemes meeting WCAG AA standards
- Clear visual hierarchy and spacing
- Responsive design for all screen sizes
- Support for reduced motion preferences

### Form Accessibility
- Clear error messages and validation feedback
- Proper labeling of form controls
- Required field indicators
- Error recovery suggestions

## Error Handling

The application implements a comprehensive error handling strategy:

### Client-Side Error Handling
- Form validation with immediate feedback
- Graceful degradation for API failures
- User-friendly error messages
- Clear recovery paths

### Server-Side Error Handling
- Structured error responses
- Proper HTTP status codes
- Detailed error logging
- Security-focused error messages

### State Management
- Loading states for async operations
- Error state management
- Optimistic UI updates
- Proper error recovery

## Component Documentation

All components follow a standardized JSDoc documentation pattern:

### Component Documentation Structure
```typescript
/**
 * Component Name
 * 
 * Detailed description of the component's purpose and functionality.
 * 
 * @component
 * @param {ComponentProps} props - Component props
 * @returns {JSX.Element} Description of the rendered output
 * 
 * @example
 * ```tsx
 * // Example usage of the component
 * ```
 */
```

### Interface Documentation
```typescript
/**
 * Props for the Component
 * @interface ComponentProps
 * @property {Type} propName - Description of the prop
 */
```

### Function Documentation
```typescript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Code Quality & Performance

### Performance Optimizations

The codebase implements several performance optimizations to ensure smooth user experience:

1. **Component Memoization**
   - `ListingsClient` and `FilterBar` components are wrapped with `React.memo` to prevent unnecessary re-renders
   - Filtered properties are memoized using `useMemo` to avoid recalculations on every render
   - Event handlers are memoized using `useCallback` to maintain referential equality

2. **Efficient State Management**
   - URL-based filter state to enable bookmarking and sharing
   - Optimized filter updates with debounced search
   - Efficient property filtering with memoized results

3. **Rendering Optimizations**
   - Virtualized lists for large property collections
   - Lazy loading of images with proper sizing
   - Conditional rendering of UI elements

### Accessibility Features

The platform follows WCAG 2.1 guidelines for accessibility:

1. **Semantic HTML**
   - Proper use of HTML5 elements (`article`, `section`, `nav`)
   - ARIA labels and roles for interactive elements
   - Keyboard navigation support

2. **Screen Reader Support**
   - Descriptive alt text for images
   - Status announcements for dynamic content
   - Proper heading hierarchy

3. **Color & Contrast**
   - WCAG AA compliant color contrast ratios
   - Clear visual hierarchy
   - Support for reduced motion preferences

### Error Handling

Robust error handling throughout the application:

1. **Form Validation**
   - Client-side validation with immediate feedback
   - Server-side validation for data integrity
   - Clear error messages and recovery paths

2. **API Error Handling**
   - Graceful degradation on API failures
   - User-friendly error messages
   - Automatic retry mechanisms for transient failures

3. **Loading States**
   - Skeleton loaders for content
   - Progress indicators for long operations
   - Optimistic UI updates

### Code Style & Best Practices

The codebase follows strict TypeScript and React best practices:

1. **TypeScript Usage**
   - Strict type checking enabled
   - Comprehensive interface definitions
   - Proper type inference and generics

2. **React Patterns**
   - Functional components with hooks
   - Custom hooks for reusable logic
   - Proper dependency management

3. **Code Organization**
   - Feature-based directory structure
   - Consistent naming conventions
   - Comprehensive JSDoc documentation
