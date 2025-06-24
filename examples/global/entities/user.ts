import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PostEntity } from "./post";

export class UserEntity {
  @IsString()
  id = "";
  
  @IsString()
  name = "";

  @IsString()
  email = "";

  @IsString()
  avatar = "";

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PostEntity)
  posts?: PostEntity[];
}

