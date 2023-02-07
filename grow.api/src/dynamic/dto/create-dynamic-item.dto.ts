import { IsString } from "class-validator";

export class CreateDynamicItemDto {

    @IsString()
    ItemKey: string;

    @IsString()
    ValueKey: string;

    @IsString()
    Value: string;
}
