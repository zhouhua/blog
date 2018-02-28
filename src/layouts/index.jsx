import React from 'react';
import Helmet from 'react-helmet';
import 'font-awesome/scss/font-awesome.scss';
import 'katex/dist/katex.min.css';
import '../assets/scss/init.scss';

class Layout extends React.Component {
    render() {
        const { children } = this.props;

        return (
            <div className="layout">
                <Helmet defaultTitle="Step Over" />
                {children()}
            </div>
        );
    }
}

export default Layout;
