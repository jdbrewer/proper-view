# Contributing to ProperView

Thank you for your interest in contributing to ProperView! This document outlines the development process, code quality standards, and guidelines for contributing to the project.

## Development Process

### Behavior-Driven Development (BDD)

We follow a BDD approach as defined in `bdd.mdc`. Each feature should:

1. Start with BDD scenarios that describe the expected behavior
2. Include acceptance criteria and edge cases
3. Be reviewed by the team before implementation
4. Have corresponding test coverage

Example BDD scenario format:
```gherkin
Feature: Property Filtering
  As a visitor
  I want to filter properties by location and price
  So that I can find properties matching my criteria

  Scenario: Filter properties by location
    Given I am on the property listings page
    When I enter "San Francisco" in the location filter
    Then I should see only properties in San Francisco
```

### Test-Driven Development (TDD)

We follow the Red-Green-Refactor cycle:

1. **Red**: Write failing tests that define the expected behavior
2. **Green**: Implement the minimum code needed to make tests pass
3. **Refactor**: Improve the code while keeping tests passing

### Task Management

1. Use the task list in `tasks.mdc` to track development progress
2. Score tasks based on ambiguity and complexity
3. Update task status and scores as requirements evolve

## Code Quality Standards

### Accessibility (WCAG 2.1)

All components must:

1. **Semantic HTML**
   - Use proper HTML5 elements
   - Include ARIA roles and labels
   - Maintain proper heading hierarchy

2. **Screen Reader Support**
   - Provide descriptive alt text
   - Include status announcements
   - Support keyboard navigation

3. **Visual Accessibility**
   - Meet WCAG AA contrast requirements
   - Support reduced motion
   - Provide clear focus indicators

### Error Handling

1. **Form Validation**
   - Client-side validation with immediate feedback
   - Server-side validation for data integrity
   - Clear error messages and recovery paths

2. **API Error Handling**
   - Proper HTTP status codes
   - User-friendly error messages
   - Graceful degradation

3. **State Management**
   - Loading states for async operations
   - Error state handling
   - Optimistic UI updates

### Performance

1. **Component Optimization**
   - Use `React.memo` for pure components
   - Memoize expensive calculations
   - Implement proper dependency arrays

2. **Rendering Optimization**
   - Virtualize long lists
   - Lazy load images
   - Implement proper code splitting

3. **State Management**
   - Minimize unnecessary re-renders
   - Use proper state management patterns
   - Implement efficient data fetching

### TypeScript Usage

1. **Type Safety**
   - Enable strict mode
   - Define comprehensive interfaces
   - Use proper type inference

2. **Best Practices**
   - Avoid `any` type
   - Use proper generics
   - Implement proper type guards

## Documentation Requirements

### JSDoc Standards

All components must include:

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
 * // Example usage
 * ```
 */
```

### Component Documentation

1. **Props Interface**
   - Document all props with types
   - Include default values
   - Document prop validation

2. **Component Behavior**
   - Document state management
   - Describe side effects
   - Explain error handling

3. **Examples**
   - Include usage examples
   - Show common patterns
   - Demonstrate edge cases

### README Maintenance

1. **Project Overview**
   - Keep features list updated
   - Maintain tech stack information
   - Update installation instructions

2. **Development Guidelines**
   - Document new patterns
   - Update testing approach
   - Maintain contribution guidelines

## Testing Guidelines

### Test Coverage

1. **Minimum Requirements**
   - 80% line coverage
   - 90% branch coverage
   - 100% critical path coverage

2. **Test Types**
   - Unit tests for utilities
   - Component tests for UI
   - Integration tests for features
   - E2E tests for critical flows

### Test Organization

```
__tests__/
  ├── unit/           # Utility function tests
  ├── components/     # Component tests
  ├── integration/    # Feature integration tests
  └── e2e/           # End-to-end tests
```

### Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Happy path
  it('should render correctly', () => {
    // Test implementation
  });

  // Edge cases
  it('should handle edge case', () => {
    // Test implementation
  });

  // Error cases
  it('should handle errors', () => {
    // Test implementation
  });
});
```

## Pull Request Process

### PR Template

```markdown
## Description
[Describe the changes and their purpose]

## Related Issues
[Link to related issues]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Accessibility
- [ ] WCAG 2.1 compliance verified
- [ ] Screen reader testing completed
- [ ] Keyboard navigation tested

## Documentation
- [ ] JSDoc comments added/updated
- [ ] README updated
- [ ] Code comments added/updated
```

### Review Guidelines

1. **Code Review**
   - Check for code quality
   - Verify test coverage
   - Review accessibility
   - Validate documentation

2. **Testing Review**
   - Verify test coverage
   - Check test quality
   - Validate edge cases
   - Review error handling

3. **Documentation Review**
   - Check JSDoc completeness
   - Verify README updates
   - Review code comments
   - Validate examples

### Merge Criteria

1. **Requirements**
   - All tests passing
   - Code coverage met
   - Accessibility verified
   - Documentation complete

2. **Approvals**
   - At least 2 reviewer approvals
   - No unresolved comments
   - CI/CD pipeline passing
   - No merge conflicts

3. **Post-Merge**
   - Update documentation
   - Close related issues
   - Update task list
   - Announce changes 