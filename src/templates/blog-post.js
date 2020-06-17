import React from 'react'
import Helmet from 'react-helmet'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import Bio from '../components/Bio'
import TagsList from '../components/TagsList'
import Layout from '../components/Layout'
import { rhythm, scale } from '../utils/typography'
import { formatDate } from '../utils/formatDate'
import 'prismjs/themes/prism-okaidia.css'
import { IoLogoTwitter as TwitterIcon } from 'react-icons/io'

const BlogPostTemplate = props => {
  const post = props.data.markdownRemark
  const siteTitle = get(props, `data.config.frontmatter.title`)
  const siteBio = get(props, 'data.config.html')
  const tags = get(props, 'data.markdownRemark.frontmatter.tags')

  const siteDescription = post.excerpt
  const { previous, next, language } = props.pageContext

  return (
    <Layout
      location={props.location}
      config={props.data.config}
      translations={post.frontmatter.translations}
    >
      <Helmet
        htmlAttributes={{ lang: props.pageContext.language }}
        meta={[{ name: 'description', content: siteDescription }]}
        title={`${post.frontmatter.title} | ${siteTitle}`}
      />
      <h1
        style={{
          fontSize: '2.75rem',
        }}
      >
        {post.frontmatter.title}
      </h1>
      {tags && tags.length ? <TagsList tags={tags} /> : null}
      <p
        style={{
          ...scale(-1 / 5),
          display: 'block',
          marginBottom: rhythm(1),
          marginTop: rhythm(-1),
        }}
      >
        {formatDate(language, post.frontmatter.date)}
      </p>
      <div
        className="post"
        style={{ fontSize: '0.95rem' }}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <div>
        <a
          href="https://twitter.com/share?ref_src=twsrc%5Etfw"
          className="twitter-share-button"
          data-show-count="false"
          data-text={post.frontmatter.title}
          target="_blank"
        >
          {language === 'fr' ? 'Partager cet article' : 'Share this article'}
          <TwitterIcon />
        </a>
        <script async src="https://platform.twitter.com/widgets.js"></script>
      </div>
      <hr
        style={{
          marginBottom: rhythm(1),
        }}
      />
      <Bio>
        <div dangerouslySetInnerHTML={{ __html: siteBio }} />
      </Bio>

      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          listStyle: 'none',
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!, $language: String!) {
    config: markdownRemark(
      frontmatter: { language: { eq: $language }, type: { eq: "language" } }
    ) {
      html
      fields {
        slug
      }
      frontmatter {
        title
        language
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        translations
        tags
      }
    }
  }
`
