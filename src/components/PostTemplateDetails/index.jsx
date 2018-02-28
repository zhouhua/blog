import React from 'react';
import Link from 'gatsby-link';
import moment from 'moment';
import 'gitalk/dist/gitalk.css';
// import gitalk from 'gitalk';
import './style.scss';

class PostTemplateDetails extends React.Component {
    render() {
        const { subtitle, author } = this.props.data.site.siteMetadata;
        const post = this.props.data.markdownRemark;
        const tags = post.fields.tagSlugs;

        const homeBlock = (
            <div>
                <Link className="post-single__home-button" to="/">All Articles</Link>
            </div>
        );

        const tagsBlock = (
            <div className="post-single__tags">
                <ul className="post-single__tags-list">
                    {tags && tags.map((tag, i) => (
                        <li className="post-single__tags-list-item" key={tag}>
                            <Link to={tag} className="post-single__tags-list-item-link">
                                {post.frontmatter.tags[i]}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );

        const commentsBlock = (
            <div id="gitalk-container">
                <script src="https://unpkg.com/gitalk@latest/dist/gitalk.min.js" />
                <script dangerouslySetInnerHTML={{
                    __html: `var gitalk = new Gitalk({
                        clientID: 'aa19479305bd5ae2cc05',
                        clientSecret: '5514529cafdd958f72e2119eec0ff0fa876963ab',
                        repo: 'blog',
                        owner: 'zhouhua-js',
                        admin: ['zhouhua'],
                        id: window.location.pathname, // Ensure uniqueness and length less than 50
                        distractionFreeMode: false // Facebook-like distraction free mode
                    });
                    gitalk.render('gitalk-container');`
                }}
                />
            </div>
        );

        return (
            <div>
                {homeBlock}
                <div className="post-single">
                    <div className="post-single__inner">
                        <h1 className="post-single__title">{post.frontmatter.title}</h1>
                        <div className="post-single__body" dangerouslySetInnerHTML={{ __html: post.html }} />
                        <div className="post-single__date">
                            <em>Published {moment(post.frontmatter.date).format('D MMM YYYY')}</em>
                        </div>
                    </div>
                    <div className="post-single__footer">
                        {tagsBlock}
                        <hr />
                        <p className="post-single__footer-text">
                            {subtitle}
                            <br />
                            <strong>@{author.name}</strong>
                        </p>
                        {commentsBlock}
                    </div>
                </div>
            </div>
        );
    }
}

export default PostTemplateDetails;
