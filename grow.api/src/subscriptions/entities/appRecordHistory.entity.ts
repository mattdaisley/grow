import { Column, CreateDateColumn, Entity } from "typeorm";
import { HistoryActionColumn, HistoryActionType, HistoryEntityInterface } from "typeorm-revisions";
import { AppRecord } from "./appRecord.entity";

@Entity()
export class AppRecordHistory
  extends AppRecord
  implements HistoryEntityInterface
{
  @Column()
  public originalID!: number;
  @CreateDateColumn()
  public makeActionAt!: Date;
  @HistoryActionColumn()
  public action!: HistoryActionType;
}