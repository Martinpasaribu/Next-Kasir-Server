import { IsBoolean, IsOptional } from 'class-validator';

export class UserPermissionsDto {
  @IsBoolean() @IsOptional() show_shift?: boolean;
  @IsBoolean() @IsOptional() show_product?: boolean;
  @IsBoolean() @IsOptional() show_ingredient?: boolean;
  @IsBoolean() @IsOptional() show_table?: boolean;
  @IsBoolean() @IsOptional() show_promo?: boolean;
  @IsBoolean() @IsOptional() show_inventory?: boolean;
  @IsBoolean() @IsOptional() show_employee?: boolean;
  @IsBoolean() @IsOptional() show_customer?: boolean;
  @IsBoolean() @IsOptional() show_debt?: boolean;
  @IsBoolean() @IsOptional() show_purchase?: boolean;
  @IsBoolean() @IsOptional() show_cash?: boolean;
  @IsBoolean() @IsOptional() show_setting?: boolean;
  @IsBoolean() @IsOptional() show_report_transaction?: boolean;
  @IsBoolean() @IsOptional() show_report_ewallet?: boolean;
  @IsBoolean() @IsOptional() show_report_income?: boolean;
  @IsBoolean() @IsOptional() show_report_cash?: boolean;
  @IsBoolean() @IsOptional() show_report_sale?: boolean;
  @IsBoolean() @IsOptional() show_report_shift?: boolean;
  @IsBoolean() @IsOptional() show_report_profit_loss?: boolean;
  @IsBoolean() @IsOptional() show_help?: boolean;
  @IsBoolean() @IsOptional() show_about?: boolean;
}