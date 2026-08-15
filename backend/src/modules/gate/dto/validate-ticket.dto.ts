import {
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'exactlyOneOfCodeOrQrToken', async: false })
class ExactlyOneOfCodeOrQrTokenConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as ValidateTicketDto;
    const hasCode = dto.code !== undefined && dto.code.trim() !== '';
    const hasQrToken = dto.qrToken !== undefined && dto.qrToken.trim() !== '';

    return hasCode !== hasQrToken;
  }

  defaultMessage(): string {
    return 'Informe exatamente um entre code ou qrToken.';
  }
}

export class ValidateTicketDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  qrToken?: string;

  @Validate(ExactlyOneOfCodeOrQrTokenConstraint)
  private readonly exactlyOneOfCodeOrQrToken?: unknown;
}
