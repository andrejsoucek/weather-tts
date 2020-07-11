import { Request, Response, Router } from 'express';

export class DashboardController {
    public path = '/';

    public router = Router();

    constructor() {
      this.router.get(this.path, this.index);
    }

    index = (_: Request, response: Response): void => {
      response.render(
        'dashboard/dashboard',
        {
        },
      );
    };
}
