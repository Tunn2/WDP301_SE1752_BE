/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccidentMedicine } from './entities/accident-medicine.entity';
import { Repository } from 'typeorm';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { CreateAccidentMedicineDto } from './dto/create-accident-medicine.dto';
import { Accident } from 'src/accident/entities/accident.entity';

@Injectable()
export class AccidentMedicineService {
  constructor(
    @InjectRepository(AccidentMedicine)
    private accidentMedicineRepo: Repository<AccidentMedicine>,
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(Accident) private accidentRepo: Repository<Accident>,
  ) {}

  async create(request: CreateAccidentMedicineDto) {
    const accident = await this.accidentRepo.findOne({
      where: { id: request.accidentId },
    });
    if (!accident) {
      throw new BadRequestException('Accident not found');
    }

    const accidentMedicines = await Promise.all(
      request.medicines.map(async (medicineItem) => {
        const medicine = await this.medicineRepo.findOne({
          where: { id: medicineItem.medicineId },
        });

        if (!medicine) {
          throw new BadRequestException(
            `Medicine with ID ${medicineItem.medicineId} not found`,
          );
        }

        if (medicine.quantity < medicineItem.quantity) {
          throw new BadRequestException(
            `Not enough quantity for medicine ID ${medicineItem.medicineId}`,
          );
        }

        medicine.quantity -= medicineItem.quantity;
        await this.medicineRepo.save(medicine); // Update quantity

        const accidentMedicine = new AccidentMedicine();
        accidentMedicine.medicine = medicine;
        accidentMedicine.accident = accident;
        accidentMedicine.quantity = medicineItem.quantity;

        return accidentMedicine;
      }),
    );

    await this.accidentMedicineRepo.save(accidentMedicines);
  }
}
