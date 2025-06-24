import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class PostEntity {
  @IsString()
  id = "";

  @IsString()
  title = "";

  @IsString()
  content = "";

  @IsString()
  userId = "";

  @IsOptional()
  @ValidateNested()
  @Type(() => {
    return require("./user").UserEntity;
  })
  user?: any;
}
