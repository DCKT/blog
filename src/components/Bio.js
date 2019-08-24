import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import profilePic from './me.png'
import { rhythm } from '../utils/typography'
import {
  IoLogoGithub as GithubIcon,
  IoLogoTwitter as TwitterIcon,
} from 'react-icons/io'
import { css } from 'emotion'

const styles = {
  root: css({
    display: 'flex',
    marginBottom: rhythm(2.5),
    justifyContent: 'center',
  }),
  picture: css({
    marginRight: rhythm(1 / 2),
    marginBottom: 0,
    width: rhythm(2),
    height: rhythm(2),
  }),
  socialLink: css({
    marginRight: 10,
    textDecoration: 'none',
    boxShadow: 'none',
  }),
  bio: css({
    '&  p': {
      marginBottom: '0.5rem',
    },
  }),
}

const Bio = ({ children }) => {
  return (
    <div className={styles.root}>
      <img src={profilePic} alt={`DCK`} className={styles.picture} />
      <div>
        <div className={styles.bio}>{children}</div>
        <div className={styles.socials}>
          <a
            className={styles.socialLink}
            href="https://github.com/DCKT"
            target="_blank"
            title="Github link"
          >
            <GithubIcon size={26} />
          </a>
          <a
            className={styles.socialLink}
            href="https://twitter.com/DCK__"
            target="_blank"
            title="Twitter link"
          >
            <TwitterIcon size={26} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Bio
