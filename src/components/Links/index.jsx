import React from 'react';
import './style.scss';

class Links extends React.Component {
    render() {
        const author = this.props.data;
        const links = {
            github: author.github,
            rss: author.rss,
            email: author.email
        };

        return (
            <div className="links">
                <ul className="links__list">
                    <li className="links__list-item">
                        <a href={`https://www.github.com/${links.github}`} target="_blank" >
                            <i className="fa fa-github" />
                        </a>
                    </li>
                </ul>
                <ul className="links__list">
                    <li className="links__list-item">
                        <a href={`mailto:${links.email}`}>
                            <i className="fa fa-envelope-o" />
                        </a>
                    </li>
                </ul>
                <ul className="links__list">
                    <li className="links__list-item">
                        <a href={links.rss}>
                            <i className="fa fa-rss" />
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Links;
