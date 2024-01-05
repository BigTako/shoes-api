import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Custom } from '../customs/entities/custom.entity';

/**
 * This service is responsible for loading data from google sheets.
 */
@Injectable()
export class SheetsService {
  private auth: any;
  private googleSheets: any;
  private initPromise: Promise<void>;
  private spreadsheetId: string;

  constructor(private configService: ConfigService) {
    //this Promise to ensure that the initialization is complete before it tries to use this.googleSheets.
    this.initPromise = this.init();
    this.spreadsheetId = this.configService.get<string>('SPREAD_SHEET_ID');
  }

  /**
   * Initialise connection to google sheets api.
   */
  async init() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.configService.get<string>('GOOGLE_CREDENTIALS_FILE'),
      scopes: [this.configService.get<string>('SPREAD_SHEET_SCOPES')],
    });

    const client = await auth.getClient();

    this.googleSheets = google.sheets({
      version: 'v4',
      auth: client as any,
    });
  }

  private parseRow(data: object[], columnNameEnv: string): string[] {
    const rowName = this.configService.get<string>(columnNameEnv);
    const objects = data.find(
      (row: string[]) => row[0].trim() === rowName,
    ) as string[];

    if (!objects) {
      throw new InternalServerErrorException(
        `[ERROR] Can not load customs of row ${rowName}, maybe name in environment variables is wrong?`,
      );
    }

    return objects;
  }

  /**
   * Get customs of model from google sheet.
   * @param model name of model(list in google sheet)
   */
  private async getCustomsOfModel(model: string) {
    try {
      const getRows = await this.googleSheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${model}`,
      });

      const data = getRows.data.values;

      // grap data row by row from sheet(each column name has to be in environment variables)
      const names = this.parseRow(data, 'SHEET_NAME_ROW_TITLE');
      const prices = this.parseRow(data, 'SHEET_PRICE_ROW_TITLE');
      const codes = this.parseRow(data, 'SHEET_CODE_ROW_TITLE');

      const sizesRowName = this.configService.get<string>(
        'SHEET_SIZES_ROW_TITLE',
      );
      const sizes = data.slice(
        data.findIndex((row: string) => row[0].trim() === sizesRowName) + 1, // first row of sizes is empty
      );

      if (!sizes) {
        throw new InternalServerErrorException(
          `[ERROR] Can not load customs of row ${sizesRowName}, maybe name in environment variables is wrong?`,
        );
      }

      // create customs object by joining data from collected rows
      const sizeAvailableSign = this.configService.get<string>(
        'SHEET_SIZE_AVAILABLE_SIGN' || '+',
      );

      const objects = names.map((name: string, index: number) => {
        return {
          name: name.trim(),
          model: model.trim(),
          price: parseInt(prices[index].trim()),
          code: parseInt(codes[index].trim()),
          sizes: sizes
            .filter((size: string[]) => size[index] === sizeAvailableSign)
            .map((size: string[]) => parseInt(size[0])),
        };
      });

      objects.shift(); // remove first element of array, because it is a titles of columns

      return objects;
    } catch (err) {
      console.log(`[ERROR] Can not load custom of model ${model}`, err);
    }
  }

  // get names of all spreadsheet lists(custom models)
  async getListNames() {
    const response = await this.googleSheets.spreadsheets.get({
      auth: this.auth,
      spreadsheetId: this.spreadsheetId,
      fields: 'sheets.properties.title',
    });

    // get names of all spreadsheet lists(custom models)
    return response.data.sheets.map(
      (sheet: { properties: { title: string } }) => sheet.properties.title,
    );
  }

  async getAll(): Promise<Custom[]> {
    const listNames = await this.getListNames();

    const customsOfModules: object[][] = listNames.map(
      async (name: string) => await this.getCustomsOfModel(name),
    );

    const objects = (await Promise.all(customsOfModules)) as Custom[][];
    return objects.flat(); // transform 2d array to 1d
  }
}
