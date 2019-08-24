import React from 'react'
import { Link } from 'gatsby'
import LanguageSwitcher from './LanguageSwitcher'
import DarkModeToggle from './DarkModeToggle'

import { rhythm } from '../utils/typography'

const styles = {
  link: {
    boxShadow: 'none',
    textDecoration: 'none',
    color: 'inherit',
  },
}

export const Layout = ({ location, config, children, translations }) => {
  let header

  if (
    `${__PATH_PREFIX__}${config.fields.slug}` === location.pathname ||
    location.pathname === '/'
  ) {
    header = (
      <h1
        style={{
          fontSize: '2rem',
          marginBottom: rhythm(1.5),
          marginTop: 0,
          textAlign: 'center',
        }}
      >
        <Link style={styles.link} to={config.fields.slug}>
          {config.frontmatter.title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          fontFamily: 'Montserrat, sans-serif',
          marginTop: 0,
          marginBottom: rhythm(-1),
        }}
      >
        <Link style={styles.link} to={'/'}>
          {config.frontmatter.title}
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
      className="blog"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <LanguageSwitcher
          language={config.frontmatter.language}
          translations={translations}
        />
        <DarkModeToggle />
      </div>

      <hr />

      {header}
      <div className="content">{children}</div>
    </div>
  )
}

export default Layout
