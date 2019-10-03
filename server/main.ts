import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import { NextFunction } from 'connect';
import { Response, Dictionary, Request } from 'express-serve-static-core';


const server = express();

server.use(cors());

server.use('/assets', (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
    console.log('req', req.headers);
    next();
},
express.static(path.join(__dirname, 'assets')),
);

server.listen(5757, () => {
    console.log(path.join(__dirname, 'assets'));
    console.log('server is running on port 5757');
});