import { format, parse } from 'url';
import { resolve } from 'path';
import _ from 'lodash';
import Boom from 'boom';
import Hapi from 'hapi';
import getDefaultRoute from './get_default_route';
import versionCheckMixin from './version_check';
import { handleShortUrlError } from './short_url_error';
import { shortUrlAssertValid } from './short_url_assert_valid';
import shortUrlLookupProvider from './short_url_lookup';
import setupConnectionMixin from './setup_connection';
import registerHapiPluginsMixin from './register_hapi_plugins';
import xsrfMixin from './xsrf';

module.exports = async function (kbnServer, server, config) {
  server = kbnServer.server = new Hapi.Server();

  const shortUrlLookup = shortUrlLookupProvider(server);
  await kbnServer.mixin(setupConnectionMixin);
  await kbnServer.mixin(registerHapiPluginsMixin);

  // provide a simple way to expose static directories
  server.decorate('server', 'exposeStaticDir', function (routePath, dirPath) {
    this.route({
      path: routePath,
      method: 'GET',
      handler: {
        directory: {
          path: dirPath,
          listing: false,
          lookupCompressed: true
        }
      },
      config: { auth: false }
    });
  });

  // provide a simple way to expose static files
  server.decorate('server', 'exposeStaticFile', function (routePath, filePath) {
    this.route({
      path: routePath,
      method: 'GET',
      handler: {
        file: filePath
      },
      config: { auth: false }
    });
  });

  // helper for creating view managers for servers
  server.decorate('server', 'setupViews', function (path, engines) {
    this.views({
      path: path,
      isCached: config.get('optimize.viewCaching'),
      engines: _.assign({ jade: require('jade') }, engines || {})
    });
  });

  server.decorate('server', 'redirectToSlash', function (route) {
    this.route({
      path: route,
      method: 'GET',
      handler: function (req, reply) {
        return reply.redirect(format({
          search: req.url.search,
          pathname: req.url.pathname + '/',
        }));
      }
    });
  });

  // attach the app name to the server, so we can be sure we are actually talking to kibana
  server.ext('onPreResponse', function (req, reply) {
    const response = req.response;

    if (response.isBoom) {
      response.output.headers['kbn-name'] = kbnServer.name;
      response.output.headers['kbn-version'] = kbnServer.version;
    } else {
      response.header('kbn-name', kbnServer.name);
      response.header('kbn-version', kbnServer.version);
    }

    return reply.continue();
  });

  server.route({
    path: '/',
    method: 'GET',
    handler: function (req, reply) {
      return reply.view('root_redirect', {
        hashRoute: `${config.get('server.basePath')}/app/kibana`,
        defaultRoute: getDefaultRoute(kbnServer),
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: function (req, reply) {
      const path = req.path;
      if (path === '/' || path.charAt(path.length - 1) !== '/') {
        return reply(Boom.notFound());
      }
      const pathPrefix = config.get('server.basePath') ? `${config.get('server.basePath')}/` : '';
      return reply.redirect(format({
        search: req.url.search,
        pathname: pathPrefix + path.slice(0, -1),
      }))
      .permanent(true);
    }
  });

  server.route({
    method: 'GET',
    path: '/goto/{urlId}',
    handler: async function (request, reply) {
      try {
        const urlParts = parse(request.url, true);
        const data = await shortUrlLookup.getUrl(request.params.urlId, request);
        shortUrlAssertValid(data.url);
        // kibi: if embedding parameters are set they must be included in the initial URL
        let embeddingParameters = '';
        if (urlParts.query.embed === 'true') {
          embeddingParameters += 'embed=true&';
          if (urlParts.query.kibiNavbarVisible === 'true') {
            embeddingParameters += 'kibiNavbarVisible=true&';
          }
        }

        // adding the sha to be able to restore sirenSession in the browser
        // redirect to discover dasboard or visualize depend on the share url
        const redirectURL = `${config.get('server.basePath')}/app/kibana#/kibi/restore/${request.params.urlId}?${embeddingParameters}`;
        reply().redirect(redirectURL);
        // kibi: end
      } catch (err) {
        reply(handleShortUrlError(err));
      }
    }
  });

  // kibi: added this handler to be able to fetch the sirenSession data
  server.route({
    method: 'GET',
    path: '/sirensession/{urlId}',
    handler: async function (request, reply) {
      try {
        const data = await shortUrlLookup.getUrl(request.params.urlId, request);
        shortUrlAssertValid(data.url);
        reply(data || {});
      } catch (err) {
        reply(err);
      }
    }
  });
  // kibi: end

  server.route({
    method: 'POST',
    path: '/shorten',
    handler: async function (request, reply) {
      try {
        shortUrlAssertValid(request.payload.url);
        const urlId = await shortUrlLookup.generateUrlId(request.payload.url, request.payload.sirenSession, request);
        reply(urlId);
      } catch (err) {
        reply(handleShortUrlError(err));
      }
    }
  });

  // Expose static assets (fonts, favicons).
  server.exposeStaticDir('/ui/fonts/{path*}', resolve(__dirname, '../../ui/public/assets/fonts'));
  server.exposeStaticDir('/ui/favicons/{path*}', resolve(__dirname, '../../ui/public/assets/favicons'));

  kbnServer.mixin(versionCheckMixin);

  return kbnServer.mixin(xsrfMixin);
};
