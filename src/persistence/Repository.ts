import { Database } from 'sqlite';
import { inject, injectable } from 'inversify';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class Repository {
  private readonly DAY_SECONDS = 86400;

  constructor(
      @inject(INVERSIFY_TYPES.Database) private readonly connection: Promise<Database>,
  ) {
  }

  public async runMigrations(): Promise<void> {
    const c = await this.connection;

    return c.migrate({
      force: false,
    });
  }

  public async saveMessageStats(messageLength: number): Promise<void> {
    const c = await this.connection;
    await this.fillMissingDays(c);

    await c.run(
      'INSERT OR IGNORE INTO messages VALUES (:dayts, 0, 0)',
      {
        ':dayts': this.dayTimestamp(),
      },
    );
    await c.run(
      `UPDATE messages SET 
        messages_count = messages_count + 1, 
        characters_count = characters_count + :count WHERE day_timestamp = :dayts`,
      {
        ':count': messageLength,
        ':dayts': this.dayTimestamp(),
      },
    );
  }

  public async getMessageStats(): Promise<MessageStats|undefined> {
    const c = await this.connection;
    await this.fillMissingDays(c);

    return c.get(
      `SELECT 
        SUM(messages_count) as totalMessages,
        SUM(characters_count) as totalCharacters, 
        ROUND(AVG(messages_count), 1) as messagesPerDayAvg,
        MAX(messages_count) as messagesPerDayMax
        FROM messages`,
    );
  }

  public async getMessageChartData(): Promise<Array<MessageChartData>> {
    const c = await this.connection;
    await this.fillMissingDays(c);

    return c.all(
      `SELECT
        day_timestamp as label,
        messages_count as value
        FROM messages
        ORDER BY label DESC
        LIMIT 15`,
    );
  }

  private async fillMissingDays(c: Database): Promise<void> {
    const lastTimestampRow = await c.get(
      'SELECT day_timestamp FROM messages ORDER BY day_timestamp DESC LIMIT 1',
    );
    const lastTimestamp = lastTimestampRow ? lastTimestampRow['day_timestamp'] : null;
    if (lastTimestamp && lastTimestamp + this.DAY_SECONDS < this.dayTimestamp()) {
      await c.run(
        'INSERT INTO messages VALUES (:dayts, 0, 0)',
        {
          ':dayts': lastTimestamp + this.DAY_SECONDS,
        },
      );
      await this.fillMissingDays(c);
    }
  }

  private dayTimestamp = (): number => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    return date.getTime() / 1000;
  };
}
