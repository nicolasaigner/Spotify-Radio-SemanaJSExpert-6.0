import config from "./config.js";
import { Controller } from "./controller.js";
import { logger } from "./util.js";

const {
    location,
    pages: {
        homeHTML,
        controllerHTML
    },
    constants: {
        CONTENT_TYPE
    }
} = config;

const controller = new Controller();

async function routes(req, res) {
    const {method, url} = req;

    if (method === 'GET' && url === '/') {
        res.writeHead(302, {
            'Location': location.home
        });
        return res.end();
    }

    if (method === 'GET' && url === '/home') {
        const {
            stream, type
        } = await controller.getFileStream(homeHTML);

        // res.writeHead(200, { 
        //     'Content-Type': 'text/html'
        // });
        return stream.pipe(res);
    }

    if (method === 'GET' && url === '/controller') {
        const {
            stream, type
        } = await controller.getFileStream(controllerHTML);

        // res.writeHead(200, { 
        //     'Content-Type': 'text/html'
        // });
        return stream.pipe(res);
    }

    // files
    if (method === 'GET') {
        const {
            stream, 
            type
        } = await controller.getFileStream(url);
        const contentType = CONTENT_TYPE[type];
        if (contentType) {
            res.writeHead(200, {
                'Content-Type': CONTENT_TYPE[type]
            });
        }
        
        return stream.pipe(res);
    }

    res.writeHead(404);
    return res.end();
}

function handleError(error, response) {
    if (error.message.includes('ENOENT')) {
        logger.warn(`assest not found ${error.stack}`);
        response.writeHead(404);
        return response.end();
    }

    logger.error(`caught error on API ${error.stack}`);
    response.writeHead(500);
    return response.end();
}

export function handler(req, res) {
  return routes(req, res).catch(err => handleError(err, res));
}