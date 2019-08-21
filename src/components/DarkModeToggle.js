import React from 'react'
import useDarkMode from 'use-dark-mode'
import './dark-mode.css'

const DarkModeDefault = () => {
  const darkMode = useDarkMode(false)
  return (
    <div className="dark-mode-toggle">
      <button type="button" onClick={darkMode.disable}>
        ☀
      </button>
      <span className="toggle-control">
        <input
          className="dmcheck"
          type="checkbox"
          checked={darkMode.value}
          onChange={darkMode.toggle}
          id="dmcheck"
        />
        <label htmlFor="dmcheck" />
      </span>
      <button type="button" onClick={darkMode.enable}>
        ☾
      </button>
    </div>
  )
}

export default DarkModeDefault
