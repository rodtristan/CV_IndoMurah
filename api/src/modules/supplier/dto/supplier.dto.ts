// Form Supplier Ketoko: data umum + Jatuh Tempo + opsi pajak.
import { PartialType } from '@nestjs/swagger';
import { PartnerTaxDto } from '../../../common/dto/partner.dto';

export class CreateSupplierDto extends PartnerTaxDto {}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
