import React from 'react'
import { css } from 'emotion'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2.5rem',
  }),
  item: css({
    display: 'block',
    textDecoration: 'none',
    border: '1px solid var(--primary)',
    padding: '0.2rem 0.4rem',
    borderRadius: '0.3rem',
    fontSize: '0.8rem',
    margin: 0,
    '& + &': {
      marginLeft: '1rem',
    },
    '.dark-mode &': {
      background: 'var(--primary-dark)',
      borderColor: 'var(--primary-dark)',
      color: '#222',
    },
  }),
}

const TagsList = ({ tags }) => {
  return (
    <ul className={styles.root}>
      {tags.map((tag, i) => (
        <li key={i} className={styles.item}>
          {tag}
        </li>
      ))}
    </ul>
  )
}

export default TagsList
