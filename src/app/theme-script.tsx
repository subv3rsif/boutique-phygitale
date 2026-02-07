export function ThemeScript() {
  const themeScript = `
    (function() {
      function getTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      const theme = getTheme();
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
