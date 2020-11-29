import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { Repository } from '../persistence/Repository';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class DashboardController {
    public path = '/';

    public router = Router();

    constructor(
        @inject(INVERSIFY_TYPES.Repository) private readonly repository: Repository,
    ) {
      this.router.get(this.path, this.render);
    }

    render = async (_: Request, response: Response): Promise<void> => {
      const messageStats = await this.repository.getMessageStats();
      const chartDataResult = await this.repository.getMessageChartData();

      const chartLabels = <Array<string>>[];
      const chartValues = <Array<number>>[];
      chartDataResult.reverse().forEach((chartData) => {
        chartLabels.push(new Date(chartData.label * 1000).toLocaleDateString('cs-CZ'));
        chartValues.push(chartData.value);
      });
      response.render(
        'dashboard/dashboard',
        {
          messageStats,
          chartLabels,
          chartValues,
        },
      );
    };
}
