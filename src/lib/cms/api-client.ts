import { TPageContent } from './types';

export class CmsApiClient {
  private baseUrl = '/api/cms';

  async createPage(data: { slug: string; title: string; description?: string }) {
    const response = await fetch(`${this.baseUrl}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create page: ${response.statusText}`);
    }

    return response.json();
  }

  async getPage(slug: string) {
    const response = await fetch(`${this.baseUrl}/pages/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    return response.json();
  }

  async updatePage(slug: string, content: TPageContent) {
    const response = await fetch(`${this.baseUrl}/pages/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update page: ${response.statusText}`);
    }

    return response.json();
  }

  async deletePage(slug: string) {
    const response = await fetch(`${this.baseUrl}/pages/${slug}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete page: ${response.statusText}`);
    }

    return response.json();
  }

  async getPages() {
    const response = await fetch(`${this.baseUrl}/pages`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.statusText}`);
    }

    return response.json();
  }
}

export const cmsApiClient = new CmsApiClient();
