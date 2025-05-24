import { Module } from '@nestjs/common';
import { AccidentMedicineService } from './accident-medicine.service';
import { AccidentMedicineController } from './accident-medicine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accident } from 'src/modules/accident/entities/accident.entity';
import { AccidentMedicine } from './entities/accident-medicine.entity';
import { Medicine } from '../medicine/entities/medicine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accident, AccidentMedicine, Medicine])],
  controllers: [AccidentMedicineController],
  providers: [AccidentMedicineService],
})
export class AccidentMedicineModule {}
