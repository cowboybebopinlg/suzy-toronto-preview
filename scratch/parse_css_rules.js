const fs = require('fs');

const css = fs.readFileSync('autoptimize.css', 'utf8');

// Look for header, topbar, navigation, logo, accent colors
const rules = css.match(/#site-header[^\{]*\{[^\}]*\}/gi) || [];
console.log('Site header rules:', rules.slice(0, 5));

const topBarRules = css.match(/#top-bar[^\{]*\{[^\}]*\}/gi) || [];
console.log('Top bar rules:', topBarRules.slice(0, 5));

const navRules = css.match(/#site-navigation[^\{]*\{[^\}]*\}/gi) || [];
console.log('Nav rules:', navRules.slice(0, 5));

const linkRules = css.match(/a\{[^\}]*\}/gi) || [];
console.log('Link rules:', linkRules.slice(0, 5));

const footerRules = css.match(/#footer[^\{]*\{[^\}]*\}/gi) || [];
console.log('Footer rules:', footerRules.slice(0, 5));

// Check Elementor colors or CSS variables
const rootVars = css.match(/--e-global-color-[^;]+;/gi) || css.match(/--[^:]+:[^;]+;/gi) || [];
console.log('CSS custom properties:', rootVars.slice(0, 20));
