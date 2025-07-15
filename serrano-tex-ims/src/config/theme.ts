// Enhanced Theme Management System for Serrano Tex IMS
export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    navy: string;
    accent: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    input: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  border: string;
  shadow: string;
  overlay: string;
}

export interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
    fallback: string;
    medium: string;
    semibold: string;
    bold: string;
    light: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
    wider: number;
  };
}

export interface ComponentStyles {
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
    };
  };
}

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  components: ComponentStyles;
}

// Light Mode Theme
export const lightTheme: Theme = {
  colors: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1e40af',
      navy: '#000080',
      accent: '#0ea5e9'
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#f8fafc',
      card: '#ffffff',
      input: '#f1f5f9',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },
  typography: {
    fontFamily: {
      primary: 'Poppins-Regular',
      secondary: 'Inter-Regular',
      fallback: 'DM Sans-Regular',
      medium: 'Poppins-Medium',
      semibold: 'Poppins-SemiBold',
      bold: 'Poppins-Bold',
      light: 'Poppins-Light'
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
      '5xl': 48
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
      loose: 2.0
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 1,
      wider: 2
    }
  },
  components: {
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      '2xl': 24,
      full: 50
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8
      }
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
      }
    }
  }
};

// Dark Mode Theme
export const darkTheme: Theme = {
  colors: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      navy: '#1e40af',
      accent: '#0ea5e9'
    },
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      card: '#475569',
      input: '#64748b',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #581c87 100%)'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
      inverse: '#1e293b'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    border: '#475569',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  typography: {
    fontFamily: {
      primary: 'Poppins-Regular',
      secondary: 'Inter-Regular',
      fallback: 'DM Sans-Regular',
      medium: 'Poppins-Medium',
      semibold: 'Poppins-SemiBold',
      bold: 'Poppins-Bold',
      light: 'Poppins-Light'
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
      '5xl': 48
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
      loose: 2.0
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 1,
      wider: 2
    }
  },
  components: {
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      '2xl': 24,
      full: 50
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8
      }
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
      }
    }
  }
};

export const themes = {
  light: lightTheme,
  dark: darkTheme
};

export type ThemeMode = keyof typeof themes;