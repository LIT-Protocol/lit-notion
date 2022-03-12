// core styles shared by all of react-notion-x (required)
import '../styles/globals.css'
import 'react-notion-x/src/styles.css'

// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-tomorrow.css'

// used for collection views (optional)
import 'rc-dropdown/assets/index.css'

// used for rendering equations (optional)
import 'katex/dist/katex.min.css'

import 'prismjs/themes/prism-coy.css'

import 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-bash'


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
