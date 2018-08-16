import React from 'react';
import Link from 'gatsby-link';
import moment from 'moment';
import 'moment/locale/zh-cn';
import './style.scss';

moment.locale('zh-cn');

class Post extends React.Component {
  render() {
    const { title, date, category, description } = this.props.data.node.frontmatter;
    const excerpt = description || this.props.data.node.excerpt;
    const { slug, categorySlug } = this.props.data.node.fields;

    return (
      <div className="post">
        <div className="post__meta">
          <time className="post__meta-time" dateTime={moment(date).format('YYYY年MM月DD日')}>
            {moment(date).format('YYYY年MM月DD日')}
          </time>
          <span className="post__meta-divider" />
          <span className="post__meta-category" key={categorySlug}>
            <Link to={categorySlug} className="post__meta-category-link">
              {category}
            </Link>
          </span>
        </div>
        <h2 className="post__title">
          <Link className="post__title-link" to={slug}>{title}</Link>
        </h2>
        <p className="post__description">{excerpt}</p>
        <Link className="post__readmore" to={slug}>继续阅读</Link>
      </div>
    );
  }
}

export default Post;
