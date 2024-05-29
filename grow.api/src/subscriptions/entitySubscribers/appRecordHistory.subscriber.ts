import { EventSubscriber } from "typeorm";
import { HistorySubscriber } from "typeorm-revisions";
import { AppRecord } from "../entities/appRecord.entity";
import { AppRecordHistory } from "../entities/appRecordHistory.entity";

@EventSubscriber()
export class AppRecordHistorySubscriber extends HistorySubscriber<
  AppRecord,
  AppRecordHistory
> {
  public get entity() {
    return AppRecord;
  }
  public get historyEntity() {
    return AppRecordHistory;
  }
}
