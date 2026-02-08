import tailwindcss from '@tailwindcss/postcss';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [tailwindcss, postcssNesting, autoprefixer],
};
