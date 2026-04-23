const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async register(email: string, password: string, role: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { email, password, role },
    });
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async getArticles(params: { skip?: number; limit?: number; tag?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append('skip', params.skip.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.tag) query.append('tag', params.tag);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    return this.request(`/articles${queryString ? `?${queryString}` : ''}`);
  }

  async getArticle(slug: string) {
    return this.request(`/articles/${slug}`);
  }

  async createArticle(data: { title: string; content: string; tags: string }, token: string) {
    return this.request('/articles', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async updateArticle(slug: string, data: any, token: string) {
    return this.request(`/articles/${slug}`, {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async deleteArticle(slug: string, token: string) {
    return this.request(`/articles/${slug}`, {
      method: 'DELETE',
      token,
    });
  }

  async getMyArticles(token: string) {
    return this.request('/articles/my-articles', { token });
  }

  async createComment(slug: string, content: string, token: string) {
    return this.request(`/articles/${slug}/comments`, {
      method: 'POST',
      body: { content },
      token,
    });
  }

  async getComments(slug: string) {
    return this.request(`/articles/${slug}/comments`);
  }

  async voteArticle(slug: string, voteType: string, token: string) {
    return this.request(`/articles/${slug}/vote`, {
      method: 'POST',
      body: { vote_type: voteType },
      token,
    });
  }

  async getVotes(slug: string) {
    return this.request(`/articles/${slug}/vote`);
  }
}

export const api = new ApiService();
export default api;