export interface Migration {
  name: string;
  sql: string;
  version: number;
  idx: number;
}

export interface MigrationRow {
  checksum: number;
  description: string;
  execution_time: number;
  installed_by: string;
  installed_on: Date;
  installed_rank: number;
  script: string;
  success: number;
  type: string;
  version: string;
}
