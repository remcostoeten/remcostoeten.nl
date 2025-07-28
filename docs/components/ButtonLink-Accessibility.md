# ButtonLink Accessibility Guide

The ButtonLink component is designed with comprehensive accessibility features to ensure it works well with screen readers, keyboard navigation, and follows WCAG guidelines.

## Accessibility Features Overview

### Semantic HTML
- **Button Element**: When no `href` is provided, renders as a native `<button>` element
- **Anchor Element**: When `href` is provided, renders as an `<a>` element with `role="button"`
- **Proper Semantics**: Maintains appropriate element types for optimal screen reader support

### Keyboard Navigation
- **Tab Navigation**: All interactive elements are focusable via Tab key
- **Enter Key**: Activates buttons and links (standard browser behavior)
- **Space Key**: Activates anchor elements with button role (custom implementation)
- **Disabled Focus Management**: Disabled elements are not focusable (`tabindex="-1"`)

### ARIA Attributes
- **Role Attribution**: Anchor elements receive `role="button"` for proper semantics
- **Disabled State**: Uses `aria-disabled="true"` instead of `disabled` attribute on anchors
- **Tab Index Management**: Manages `tabindex` appropriately for disabled states

## Implementation Details

### Button Rendering (no href)
```tsx
<button disabled={isDisabled()}>
  {children}
</button>
```
- Uses native `disabled` attribute
- Inherits all standard button accessibility features
- Screen readers announce as "button"
- Keyboard navigation works out of the box

### Anchor Rendering (with href)
```tsx
<a
  href={href}
  role="button"
  aria-disabled={isDisabled()}
  tabindex={isDisabled() ? -1 : 0}
  onKeyDown={handleKeyDown}
>
  {children}
</a>
```
- `role="button"` tells screen readers this link acts as a button
- `aria-disabled` communicates disabled state to assistive technology
- `tabindex` management ensures proper focus behavior
- Custom keyboard handler provides Space key support

### Loading States
- Loading buttons/links are functionally disabled
- Screen readers announce the disabled state
- Visual loading indicator provides feedback
- Prevents accidental multiple submissions

## WCAG Compliance

### Level AA Compliance
- **Color Contrast**: All variants meet WCAG AA contrast requirements
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Text Alternatives**: Button text provides clear action description
- **Keyboard Accessibility**: Full keyboard navigation support

### Level AAA Considerations
- **Enhanced Focus Indicators**: Focus rings are clearly visible
- **Motion Preferences**: Respects `prefers-reduced-motion` for loading animations
- **Consistent Navigation**: Predictable behavior across all variants

## Screen Reader Behavior

### Button Elements
- Announced as "Button, [button text]"
- Disabled state: "Button, [button text], disabled"
- Loading state: "Button, [button text], disabled"

### Anchor Elements with Button Role
- Announced as "Button, [button text]"
- Includes link destination if screen reader supports it
- Disabled state: "Button, [button text], disabled"

## Best Practices

### Button Text
- Use descriptive text that clearly indicates the action
- Avoid generic text like "Click here" or "Read more"
- Keep text concise but meaningful

```tsx
// Good
<ButtonLink variant="primary">Save Changes</ButtonLink>
<ButtonLink variant="destructive">Delete Account</ButtonLink>

// Avoid
<ButtonLink variant="primary">Click Here</ButtonLink>
<ButtonLink variant="destructive">Delete</ButtonLink>
```

### Loading States
- Provide clear feedback when actions are processing
- Change button text to indicate current state

```tsx
// Good
<ButtonLink loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</ButtonLink>

// Acceptable
<ButtonLink loading={isSubmitting}>
  Save Changes
</ButtonLink>
```

### Disabled States
- Only disable buttons when absolutely necessary
- Provide clear feedback about why the button is disabled
- Consider using loading states instead of disabled for temporary states

## Testing Guidelines

### Keyboard Testing
1. **Tab Navigation**: Ensure all buttons are reachable via Tab key
2. **Enter Key**: Test activation with Enter key on all button types
3. **Space Key**: Test Space key activation on anchor-based buttons
4. **Focus Indicators**: Verify visible focus indicators on all elements
5. **Disabled Elements**: Confirm disabled buttons are not focusable

### Screen Reader Testing
1. **Element Announcement**: Verify correct role announcement
2. **State Communication**: Test disabled and loading state announcements
3. **Action Clarity**: Ensure button purpose is clear from announcement
4. **Navigation Flow**: Test logical navigation order

### Automated Testing
- Use accessibility testing tools (axe-core, Lighthouse)
- Include keyboard navigation in E2E tests
- Test color contrast ratios
- Validate ARIA attribute usage

## Common Pitfalls to Avoid

### Incorrect Usage
```tsx
// Don't use disabled for loading states without indication
<ButtonLink disabled>Submit</ButtonLink>

// Don't use generic or unclear text
<ButtonLink href="/submit">Go</ButtonLink>

// Don't disable without clear reason or feedback
<ButtonLink disabled>Save Changes</ButtonLink>
```

### Correct Usage
```tsx
// Provide loading feedback
<ButtonLink loading>Submitting...</ButtonLink>

// Use descriptive text
<ButtonLink href="/submit">Submit Application</ButtonLink>

// Communicate why disabled or use alternative approaches
<ButtonLink disabled title="Please fill in all required fields">
  Save Changes
</ButtonLink>
```

## Framework Integration

### With Form Libraries
- Properly integrate with form validation states
- Use loading states during form submission
- Handle disabled states based on form validity

### With Routing Libraries
- Ensure proper navigation behavior for anchor-based buttons
- Handle client-side routing appropriately
- Maintain accessibility during route transitions

## Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WebAIM Button Accessibility](https://webaim.org/techniques/forms/controls#button)
- [MDN Button Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
