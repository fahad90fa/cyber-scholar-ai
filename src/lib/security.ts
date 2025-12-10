import DOMPurify from 'dompurify';

export const SecurityUtils = {
  sanitizeHTML: (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: [],
      RETURN_DOM: false,
    }) as string;
  },

  sanitizeText: (text: string): string => {
    return DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      RETURN_DOM: false,
    }) as string;
  },

  encodeHTMLEntities: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  generateCSRFToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  },

  validateJSON: (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  },

  removeScriptTags: (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const scripts = div.querySelectorAll('script, iframe, embed, object, form');
    scripts.forEach((script) => script.remove());
    return div.innerHTML;
  },

  checkContentSecurityPolicy: (): boolean => {
    return !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  },
};

export const SecureStorage = {
  setItem: (key: string, value: string, encrypted: boolean = true): void => {
    try {
      const timestamp = new Date().getTime();
      const payload = {
        value,
        timestamp,
        encrypted,
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to store item in localStorage:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const payload = JSON.parse(item);
      
      if (!payload.value) return null;

      return payload.value;
    } catch (error) {
      console.error('Failed to retrieve item from localStorage:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },

  getAllKeys: (): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  },
};

export const CredentialSecurity = {
  maskSensitiveData: (data: string): string => {
    const sensitivePatterns = [
      /(?:password|passwd|pwd)[=:\s]+([^\s,]+)/gi,
      /(?:api[_-]?key|token)[=:\s]+([^\s,]+)/gi,
      /(?:secret|private[_-]?key)[=:\s]+([^\s,]+)/gi,
    ];

    let masked = data;
    sensitivePatterns.forEach((pattern) => {
      masked = masked.replace(pattern, (match, group1) => {
        const masked_value = '*'.repeat(Math.min(group1.length, 8));
        return match.replace(group1, masked_value);
      });
    });

    return masked;
  },

  shouldNotLogField: (fieldName: string): boolean => {
    const sensitivFields = [
      'password',
      'pwd',
      'secret',
      'token',
      'api_key',
      'apikey',
      'private_key',
      'privatekey',
      'access_token',
      'refresh_token',
      'auth_code',
      'session_id',
      'credit_card',
      'ssn',
      'cvv',
    ];
    return sensitivFields.some((field) => fieldName.toLowerCase().includes(field));
  },
};

export const RequestSecurity = {
  addSecurityHeaders: (headers: Record<string, string>): Record<string, string> => {
    return {
      ...headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  },

  validateURL: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  sanitizeURLParams: (params: Record<string, string | number | boolean>): Record<string, string> => {
    const sanitized: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = SecurityUtils.sanitizeText(value);
      } else {
        sanitized[key] = String(value);
      }
    });
    return sanitized;
  },
};
