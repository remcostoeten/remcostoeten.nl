# ButtonLink Usage Examples

This document provides comprehensive examples of how to use the ButtonLink component in various scenarios.

## Basic Usage

### Default Button
```tsx
<ButtonLink>Default Button</ButtonLink>
```

### Button with Click Handler
```tsx
function handleClick() {
  console.log('Button clicked!')
}

<ButtonLink onClick={handleClick}>
  Click Me
</ButtonLink>
```

### Link Button
```tsx
<ButtonLink href="/dashboard">
  Go to Dashboard
</ButtonLink>
```

## Variants

### Primary Actions
```tsx
<ButtonLink variant="primary" onClick={handleSave}>
  Save Changes
</ButtonLink>

<ButtonLink variant="primary" href="/checkout">
  Proceed to Checkout
</ButtonLink>
```

### Secondary Actions
```tsx
<ButtonLink variant="secondary" onClick={handleCancel}>
  Cancel
</ButtonLink>

<ButtonLink variant="secondary" href="/help">
  Get Help
</ButtonLink>
```

### Ghost/Subtle Actions
```tsx
<ButtonLink variant="ghost" onClick={handleEdit}>
  Edit
</ButtonLink>

<ButtonLink variant="ghost" href="/profile">
  View Profile
</ButtonLink>
```

### Destructive Actions
```tsx
<ButtonLink variant="destructive" onClick={handleDelete}>
  Delete Account
</ButtonLink>

<ButtonLink variant="destructive" href="/unsubscribe">
  Unsubscribe
</ButtonLink>
```

### Admin Actions
```tsx
<ButtonLink variant="admin" onClick={handleAdminAction}>
  Admin Panel
</ButtonLink>

<ButtonLink variant="admin" href="/admin">
  Access Admin
</ButtonLink>
```

## Sizes

### Small Buttons
```tsx
<ButtonLink size="sm" variant="primary">
  Small Primary
</ButtonLink>

<ButtonLink size="sm" variant="secondary">
  Small Secondary
</ButtonLink>

<ButtonLink size="sm" href="/quick-action">
  Quick Action
</ButtonLink>
```

### Medium Buttons (Default)
```tsx
<ButtonLink size="md" variant="primary">
  Medium Primary
</ButtonLink>

<ButtonLink variant="secondary">
  Default Medium
</ButtonLink>
```

### Large Buttons
```tsx
<ButtonLink size="lg" variant="primary">
  Large Primary
</ButtonLink>

<ButtonLink size="lg" href="/important-action">
  Important Action
</ButtonLink>
```

## States

### Loading States
```tsx
function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  
  function handleSubmit() {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => setIsSubmitting(false), 2000)
  }
  
  return (
    <ButtonLink 
      variant="primary" 
      loading={isSubmitting()}
      onClick={handleSubmit}
    >
      {isSubmitting() ? 'Submitting...' : 'Submit Form'}
    </ButtonLink>
  )
}
```

### Disabled States
```tsx
function FormWithValidation() {
  const [isValid, setIsValid] = createSignal(false)
  
  return (
    <div>
      <input 
        onInput={(e) => setIsValid(e.target.value.length > 0)}
        placeholder="Enter text to enable button"
      />
      
      <ButtonLink 
        variant="primary"
        disabled={!isValid()}
        onClick={handleSubmit}
      >
        Submit
      </ButtonLink>
    </div>
  )
}
```

## Complex Examples

### Form Actions
```tsx
function FormActions({ onSave, onCancel, isSaving, hasChanges }) {
  return (
    <div class="flex gap-3 justify-end">
      <ButtonLink 
        variant="secondary" 
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </ButtonLink>
      
      <ButtonLink 
        variant="primary"
        loading={isSaving}
        disabled={!hasChanges}
        onClick={onSave}
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </ButtonLink>
    </div>
  )
}
```

### Navigation Menu
```tsx
function NavigationMenu() {
  return (
    <nav class="flex gap-2">
      <ButtonLink variant="ghost" href="/dashboard">
        Dashboard
      </ButtonLink>
      
      <ButtonLink variant="ghost" href="/projects">
        Projects
      </ButtonLink>
      
      <ButtonLink variant="ghost" href="/settings">
        Settings
      </ButtonLink>
      
      <ButtonLink variant="primary" href="/new-project">
        New Project
      </ButtonLink>
    </nav>
  )
}
```

### Action Cards
```tsx
function ActionCard({ title, description, actionText, actionHref, variant = "primary" }) {
  return (
    <div class="p-6 border rounded-lg">
      <h3 class="text-lg font-semibold">{title}</h3>
      <p class="text-gray-600 mb-4">{description}</p>
      
      <ButtonLink 
        variant={variant}
        href={actionHref}
        size="sm"
      >
        {actionText}
      </ButtonLink>
    </div>
  )
}

// Usage
<div class="grid grid-cols-3 gap-4">
  <ActionCard
    title="Create Project"
    description="Start a new project from scratch"
    actionText="Get Started"
    actionHref="/new-project"
    variant="primary"
  />
  
  <ActionCard
    title="Import Project"
    description="Import an existing project"
    actionText="Import"
    actionHref="/import"
    variant="secondary"
  />
  
  <ActionCard
    title="View Templates"
    description="Browse available templates"
    actionText="Browse"
    actionHref="/templates"
    variant="ghost"
  />
</div>
```

### Modal Actions
```tsx
function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message, isLoading }) {
  if (!isOpen) return null
  
  return (
    <div class="modal-overlay">
      <div class="modal-content">
        <h2 class="text-xl font-semibold mb-2">{title}</h2>
        <p class="text-gray-600 mb-6">{message}</p>
        
        <div class="flex gap-3 justify-end">
          <ButtonLink 
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </ButtonLink>
          
          <ButtonLink 
            variant="destructive"
            loading={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
```

### Pagination Controls
```tsx
function PaginationControls({ currentPage, totalPages, onPageChange }) {
  return (
    <div class="flex items-center gap-2">
      <ButtonLink 
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </ButtonLink>
      
      <span class="px-3 py-1 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      <ButtonLink 
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </ButtonLink>
    </div>
  )
}
```

### Toolbar Actions
```tsx
function EditorToolbar({ onSave, onUndo, onRedo, canUndo, canRedo, isSaving }) {
  return (
    <div class="flex items-center gap-2 p-2 border-b">
      <ButtonLink 
        variant="primary"
        size="sm"
        loading={isSaving}
        onClick={onSave}
      >
        Save
      </ButtonLink>
      
      <div class="w-px h-6 bg-gray-300 mx-1" />
      
      <ButtonLink 
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        onClick={onUndo}
      >
        Undo
      </ButtonLink>
      
      <ButtonLink 
        variant="ghost"
        size="sm"
        disabled={!canRedo}
        onClick={onRedo}
      >
        Redo
      </ButtonLink>
    </div>
  )
}
```

### Status Actions
```tsx
function StatusButton({ status, onStatusChange }) {
  function getVariant() {
    switch (status) {
      case 'active': return 'primary'
      case 'pending': return 'secondary'
      case 'inactive': return 'ghost'
      case 'error': return 'destructive'
      default: return 'admin'
    }
  }
  
  function getNextStatus() {
    switch (status) {
      case 'active': return 'inactive'
      case 'inactive': return 'active'
      case 'pending': return 'active'
      case 'error': return 'pending'
      default: return 'active'
    }
  }
  
  return (
    <ButtonLink 
      variant={getVariant()}
      size="sm"
      onClick={() => onStatusChange(getNextStatus())}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </ButtonLink>
  )
}
```

## Advanced Patterns

### Conditional Rendering
```tsx
function ConditionalActions({ user, canEdit, canDelete }) {
  return (
    <div class="flex gap-2">
      {canEdit && (
        <ButtonLink variant="secondary" href={`/users/${user.id}/edit`}>
          Edit
        </ButtonLink>
      )}
      
      {canDelete && (
        <ButtonLink variant="destructive" onClick={() => handleDelete(user.id)}>
          Delete
        </ButtonLink>
      )}
      
      <ButtonLink variant="ghost" href={`/users/${user.id}`}>
        View Details
      </ButtonLink>
    </div>
  )
}
```

### Dynamic Sizing
```tsx
function ResponsiveButton({ text, href, isMobile }) {
  return (
    <ButtonLink 
      variant="primary"
      size={isMobile ? "sm" : "md"}
      href={href}
    >
      {isMobile ? text.slice(0, 10) + '...' : text}
    </ButtonLink>
  )
}
```

### Grouped Actions
```tsx
function ActionGroup({ actions }) {
  return (
    <div class="flex gap-1 rounded-md overflow-hidden border">
      {actions.map((action, index) => (
        <ButtonLink
          variant="ghost"
          size="sm"
          onClick={action.handler}
          class={`border-none rounded-none ${
            index !== actions.length - 1 ? 'border-r' : ''
          }`}
        >
          {action.label}
        </ButtonLink>
      ))}
    </div>
  )
}
```

## Accessibility Examples

### ARIA Labels
```tsx
<ButtonLink 
  variant="ghost"
  onClick={handleClose}
  aria-label="Close dialog"
>
  ×
</ButtonLink>
```

### Keyboard Navigation
```tsx
function KeyboardAccessibleMenu() {
  return (
    <div role="menu" class="flex flex-col gap-1">
      <ButtonLink 
        variant="ghost"
        href="/dashboard"
        role="menuitem"
      >
        Dashboard
      </ButtonLink>
      
      <ButtonLink 
        variant="ghost"
        href="/settings"
        role="menuitem"
      >
        Settings
      </ButtonLink>
    </div>
  )
}
```

### Loading Announcements
```tsx
function AccessibleSubmit({ isSubmitting, onSubmit }) {
  return (
    <ButtonLink 
      variant="primary"
      loading={isSubmitting}
      onClick={onSubmit}
      aria-live="polite"
      aria-describedby={isSubmitting ? "loading-message" : undefined}
    >
      Submit Form
      {isSubmitting && (
        <span id="loading-message" class="sr-only">
          Form is being submitted, please wait
        </span>
      )}
    </ButtonLink>
  )
}
```
