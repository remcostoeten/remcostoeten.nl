/**
 * Utility functions for formatting dates in blog posts
 */

export function formatBlogDate(dateString: string): string {
  try {
    // Handle different date formats
    let date: Date;
    
    // Check if it's in DD-MM-YYYY format
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const parts = dateString.split('-');
      if (parts[0].length === 2) {
        // DD-MM-YYYY format
        const [day, month, year] = parts;
        date = new Date(`${year}-${month}-${day}`);
      } else {
        // YYYY-MM-DD format
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return dateString; // Return original string if parsing fails
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn(`Error formatting date: ${dateString}`, error);
    return dateString;
  }
}

export function formatBlogDateShort(dateString: string): string {
  try {
    let date: Date;
    
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const parts = dateString.split('-');
      if (parts[0].length === 2) {
        const [day, month, year] = parts;
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

export function getRelativeTime(dateString: string): string {
  try {
    let date: Date;
    
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const parts = dateString.split('-');
      if (parts[0].length === 2) {
        const [day, month, year] = parts;
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch (error) {
    return dateString;
  }
}