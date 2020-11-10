import { Request, Response, Router } from 'express';
import { Repository } from '../persistence/Repository';

export class DashboardController {
    public path = '/';

    public router = Router();

    constructor() {
      this.router.get(this.path, this.index);
    }

    index = (_: Request, response: Response): void => {
      Repository.getMessageStats().then((messageStats) => {
        Repository.getMessageChartData().then((chartDataResult) => {
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
        });
      });
    };
}
