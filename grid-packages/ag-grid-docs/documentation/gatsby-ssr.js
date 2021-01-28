import React from 'react';
import { withPrefix } from 'gatsby';
import { Helmet } from 'react-helmet';
import { dependencies } from './package.json';
import { siteMetadata } from './gatsby-config';

/* It is better to pull these files directly from a CDN rather than bundling them ourselves. However, the packages are
 * still required to be installed as they are used elsewhere, so we import the versions here to ensure we are
 * consistent. */
export const onRenderBody = ({ setPostBodyComponents }) => {
    setPostBodyComponents([
        <script
            key="jquery"
            src={`https://cdnjs.cloudflare.com/ajax/libs/jquery/${dependencies['jquery']}/jquery.slim.min.js`}
            crossOrigin="anonymous" />,
        <script
            key="bootstrap"
            src={`https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/${dependencies['bootstrap']}/js/bootstrap.bundle.min.js`}
            crossOrigin="anonymous" />
    ]);
};

export const wrapPageElement = ({ element, props: { location: { pathname } } }) => {
    if (['/example-runner/', '/404/', '/404.html'].some(exclude => withPrefix(exclude) === pathname)) {
        return element;
    }

    const canonicalUrl = `${siteMetadata.siteUrl}${pathname || '/'}`;

    return (
        <>
            <Helmet link={[{ rel: 'canonical', key: canonicalUrl, href: canonicalUrl }]} />
            {element}
        </>
    );
};

export const onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    const headComponents = getHeadComponents();

    headComponents.forEach(el => {
        // remove inlined CSS
        if (el.type === 'style' && el.props['data-href']) {
            el.type = 'link';
            el.props['href'] = el.props['data-href'];
            el.props['rel'] = 'stylesheet';
            el.props['type'] = 'text/css';

            delete el.props['data-href'];
            delete el.props['dangerouslySetInnerHTML'];
        }
    });

    // ensure these styles are loaded before ours
    headComponents.unshift(
        <link
            key="fontawesome"
            rel="stylesheet"
            href={`https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-svg-core@${dependencies['@fortawesome/fontawesome-svg-core']}/styles.min.css`}
            crossOrigin="anonymous" />);

    headComponents.unshift(<link
        key="roboto"
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fontsource/roboto@4.1.0/index.min.css"
        crossOrigin="anonymous" />,
    );

    replaceHeadComponents(headComponents);
};
