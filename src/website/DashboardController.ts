import { Request, Response, Router } from 'express';
import { injectable } from 'inversify';
import { Repository } from '../persistence/Repository';

@injectable()
export class DashboardController {
    public path = '/';

    public router = Router();

    constructor() {
      this.router.get(this.path, this.render);
    }

    render = async (_: Request, response: Response): Promise<void> => {
      const messageStats = await Repository.getMessageStats();
      const chartDataResult = await Repository.getMessageChartData();

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
