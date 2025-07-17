export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const sanitizeInput = {
  username: (input: string): string => {
    if (typeof input !== 'string') {
      throw new ValidationError('Username must be a string');
    }
    
    // Remove any potentially dangerous characters and trim
    const sanitized = input
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, '') // Only allow alphanumeric and underscore
      .slice(0, 12); // Enforce max length
    
    return sanitized;
  },

  walletAddress: (input: string): string => {
    if (typeof input !== 'string') {
      throw new ValidationError('Wallet address must be a string');
    }
    
    // Ethereum address validation (0x followed by 40 hex characters)
    const sanitized = input.trim().toLowerCase();
    
    if (!/^0x[a-f0-9]{40}$/i.test(sanitized)) {
      throw new ValidationError('Invalid wallet address format');
    }
    
    return sanitized;
  },

  worldId: (input: string): string => {
    if (typeof input !== 'string') {
      throw new ValidationError('World ID must be a string');
    }
    
    // Remove any potentially dangerous characters
    const sanitized = input
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 100); // Reasonable max length
    
    if (sanitized.length === 0) {
      throw new ValidationError('World ID cannot be empty');
    }
    
    return sanitized;
  },

  numeric: (input: any, fieldName: string): number => {
    const num = Number(input);
    
    if (isNaN(num) || !isFinite(num)) {
      throw new ValidationError(`${fieldName} must be a valid number`);
    }
    
    return num;
  },

  positiveInteger: (input: any, fieldName: string): number => {
    const num = sanitizeInput.numeric(input, fieldName);
    
    if (!Number.isInteger(num) || num < 0) {
      throw new ValidationError(`${fieldName} must be a positive integer`);
    }
    
    return num;
  },

  string: (input: any, fieldName: string, maxLength: number = 1000): string => {
    if (typeof input !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`);
    }
    
    const sanitized = input.trim().slice(0, maxLength);
    
    if (sanitized.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`);
    }
    
    return sanitized;
  }
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  try {
    const sanitized = sanitizeInput.username(username);
    
    if (sanitized.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters' };
    }
    
    if (sanitized.length > 12) {
      return { isValid: false, error: 'Username must be at most 12 characters' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(sanitized)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    
    // Check for reserved words
    const reservedWords = ['admin', 'mod', 'bot', 'null', 'undefined', 'system', 'mafioso', 'world'];
    if (reservedWords.includes(sanitized.toLowerCase())) {
      return { isValid: false, error: 'Username is reserved' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof ValidationError ? error.message : 'Invalid username format' 
    };
  }
};

export const validateWalletAddress = (address: string): { isValid: boolean; error?: string } => {
  try {
    sanitizeInput.walletAddress(address);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof ValidationError ? error.message : 'Invalid wallet address' 
    };
  }
};