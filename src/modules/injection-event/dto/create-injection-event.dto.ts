/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCloseDateValid', async: false })
export class IsCloseDateValid implements ValidatorConstraintInterface {
  validate(closeDate: Date, args: any) {
    const { registrationOpenDate, date } =
      args.object as CreateInjectionEventDto;
    return closeDate > registrationOpenDate && closeDate < date;
  }

  defaultMessage(args: any) {
    return 'Close date must be greater than open date and less than the event date.';
  }
}

export class CreateInjectionEventDto {
  @IsString()
  @ApiProperty({ example: '1' })
  vaccinationId: string;

  @ApiProperty({ example: new Date() })
  registrationOpenDate: Date;

  @ApiProperty({ example: new Date() })
  @Validate(IsCloseDateValid)
  registrationCloseDate: Date;

  @ApiProperty({ example: new Date() })
  date: Date;

  @IsNumber()
  @ApiProperty({ example: 100000 })
  price: number;

  // @IsNumber()
  // @ApiProperty({ example: 5 })
  // underGrade: number;
}
