export const getTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme') || 'system';
};

export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    // System preference
    root.classList.remove('dark', 'light');
  }
};