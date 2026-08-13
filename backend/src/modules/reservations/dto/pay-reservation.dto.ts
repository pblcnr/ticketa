import { IsEnum } from 'class-validator';

export enum PaymentOutcome {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

export class PayReservationDto {
  @IsEnum(PaymentOutcome)
  outcome!: PaymentOutcome;
}
