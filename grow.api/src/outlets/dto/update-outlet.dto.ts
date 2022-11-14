import { PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateOutletDto } from './create-outlet.dto';

export class UpdateOutletDto extends PartialType(CreateOutletDto) {

    @IsInt()
    status: number;
}
