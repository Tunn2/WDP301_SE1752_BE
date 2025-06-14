import { ApiProperty } from '@nestjs/swagger';

export class AssignNurseToClassDto {
  @ApiProperty({
    description: 'List of class IDs to assign the nurse to',
    isArray: true,
    type: String,
  })
  classes: string[];

  @ApiProperty({
    description: 'ID of the nurse to assign to the classes',
  })
  nurseId: string;
}
