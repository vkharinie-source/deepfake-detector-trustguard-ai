// Centralized API client for TrustGuard AI
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('trustguard_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Login failed.');
    if (data.token) {
      localStorage.getItem('trustguard_token');
      localStorage.setItem('trustguard_token', data.token);
      localStorage.setItem('trustguard_user', JSON.stringify(data.user || { email }));
    }
    return data;
  },

  register: async (fullName, email, password, confirmPassword) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        full_name: fullName,
        fullName,
        email,
        password,
        confirm_password: confirmPassword,
        confirmPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Registration failed.');
    return data;
  },

  // DeepFake Image Prediction
  predictImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/predict/image`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Image prediction failed.');
    return data;
  },

  // Website Analysis
  analyzeWebsite: async (url) => {
    const res = await fetch(`${BASE_URL}/api/analyze/website`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Website analysis failed.');
    return data;
  },

  // Phone Call Analysis
  analyzeCall: async (caller, transcript) => {
    const res = await fetch(`${BASE_URL}/api/analyze/call`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ caller, transcript }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Call analysis failed.');
    return data;
  },

  // Email Analysis
  analyzeEmail: async (subject, sender, content) => {
    const res = await fetch(`${BASE_URL}/api/analyze/email`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ subject, sender, content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Email analysis failed.');
    return data;
  },

  // Message Analysis
  analyzeMessage: async (content) => {
    const res = await fetch(`${BASE_URL}/api/analyze/message`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Message analysis failed.');
    return data;
  },

  // Application Analysis
  analyzeApplication: async (appName, developer, description) => {
    try {
      const res = await fetch(`${BASE_URL}/api/analyze/app`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ app_name: appName, developer, description }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to message endpoint if endpoint not configured on server
    }
    const res = await fetch(`${BASE_URL}/api/analyze/message`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ content: `App: ${appName}. Developer: ${developer}. Details: ${description}` }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Application analysis failed.');
    return data;
  },

  // Internship Analysis
  analyzeInternship: async (title, company, description) => {
    try {
      const res = await fetch(`${BASE_URL}/api/analyze/internship`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ title, company, description }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const res = await fetch(`${BASE_URL}/api/analyze/email`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ subject: title, sender: company, content: description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Internship analysis failed.');
    return data;
  },

  // Job Analysis
  analyzeJob: async (title, company, description) => {
    try {
      const res = await fetch(`${BASE_URL}/api/analyze/job`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ title, company, description }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const res = await fetch(`${BASE_URL}/api/analyze/message`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ content: `Job Title: ${title}. Company: ${company}. Description: ${description}` }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Job offer analysis failed.');
    return data;
  },

  // News Verification
  analyzeNews: async (headline, text) => {
    const res = await fetch(`${BASE_URL}/api/analyze/message`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ content: `News Headline: ${headline}. Text: ${text}` }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'News verification failed.');
    return data;
  },

  // History GET (Tries both /api/history and /history to guarantee success)
  getHistory: async () => {
    let lastError;
    for (const endpoint of [`${BASE_URL}/api/history`, `${BASE_URL}/history`]) {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) {
          lastError = new Error(`History request failed (${res.status}).`);
          continue;
        }

        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.history;
        if (!Array.isArray(items)) {
          lastError = new Error('The history response had an unexpected format.');
          continue;
        }
        return items;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to load history.');
  },

  // History CLEAR
  clearHistory: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/history`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/dashboard/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback: compute stats manually from history
    }

    const items = await api.getHistory();
    let safeCount = 0;
    let threatCount = 0;
    let suspiciousCount = 0;

    items.forEach((item) => {
      const pred = String(item.prediction || item.result || '').toUpperCase();
      if (pred === 'REAL' || pred === 'SAFE') {
        safeCount++;
      } else if (pred === 'SUSPICIOUS') {
        suspiciousCount++;
        threatCount++;
      } else {
        threatCount++;
      }
    });

    return {
      success: true,
      stats: {
        total: items.length,
        safe: safeCount,
        suspicious: suspiciousCount,
        threats_detected: threatCount,
      },
      recent: items.slice(0, 5),
    };
  },

  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch { }
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return await res.json();
    } catch { }
    return { status: 'offline' };
  }
};
