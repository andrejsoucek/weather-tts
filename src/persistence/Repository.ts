import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export class Repository {
  private static DAY_SECONDS = 86400;

  private static connection = open<sqlite3.Database, sqlite3.Statement>({
    filename: 'db.sqlite',
    driver: sqlite3.Database,
  });

  public static async runMigrations(): Promise<void> {
    const c = await Repository.connection;

    return c.migrate({
      force: false,
    });
  }

  public static async saveMessageStats(messageLength: number): Promise<void> {
    const c = await Repository.connection;
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

  public static async getMessageStats(): Promise<MessageStats|undefined> {
    const c = await Repository.connection;
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

  public static async getMessageChartData(): Promise<Array<MessageChartData>> {
    const c = await Repository.connection;
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

  public static async fillMissingDays(c: Database): Promise<void> {
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

  private static dayTimestamp(): number {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    return date.getTime() / 1000;
  }
}
