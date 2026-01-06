import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

/**
 * Converter for CommunitySignupBonusConfig operations
 * Handles conversion between different input types for Prisma operations
 */
@injectable()
export default class SignupBonusConfigConverter {
  /**
   * Converts update input to create input for upsert operations
   * Handles extraction of values from update operations
   * 
   * @param communityId - The community ID for the config
   * @param data - The update input data
   * @returns Unchecked create input for Prisma
   */
  toCreateInput(
    communityId: string,
    data: Prisma.CommunitySignupBonusConfigUpdateInput
  ): Prisma.CommunitySignupBonusConfigUncheckedCreateInput {
    // For create operation, we need to handle the community relation differently
    // and convert update operations to simple values
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { community, ...updateData } = data;

    // Create a new object for create operation with primitive values
    const createData: Prisma.CommunitySignupBonusConfigUncheckedCreateInput = {
      communityId,
    };

    // Extract values from update operations for create input
    if ("isEnabled" in updateData) {
      createData.isEnabled = this.extractBooleanValue(updateData.isEnabled);
    }

    if ("bonusPoint" in updateData) {
      createData.bonusPoint = this.extractNumberValue(updateData.bonusPoint);
    }

    if ("message" in updateData) {
      createData.message = this.extractStringOrNullValue(updateData.message);
    }

    if ("id" in updateData) {
      createData.id = this.extractStringValue(updateData.id);
    }

    return createData;
  }

  /**
   * Extracts a boolean value from a field that could be a boolean or an update operation
   */
  private extractBooleanValue(
    value: boolean | Prisma.BoolFieldUpdateOperationsInput | undefined
  ): boolean | undefined {
    if (typeof value === "boolean") {
      return value;
    }
    return value?.set;
  }

  /**
   * Extracts a number value from a field that could be a number or an update operation
   */
  private extractNumberValue(
    value: number | Prisma.IntFieldUpdateOperationsInput | undefined
  ): number | undefined {
    if (typeof value === "number") {
      return value;
    }
    return value?.set;
  }

  /**
   * Extracts a string value from a field that could be a string or an update operation
   */
  private extractStringValue(
    value: string | Prisma.StringFieldUpdateOperationsInput | undefined
  ): string | undefined {
    if (typeof value === "string") {
      return value;
    }
    return value?.set;
  }

  /**
   * Extracts a string or null value from a field that could be a string, null, or an update operation
   */
  private extractStringOrNullValue(
    value: string | null | Prisma.NullableStringFieldUpdateOperationsInput | undefined
  ): string | null | undefined {
    if (typeof value === "string" || value === null) {
      return value;
    }
    return value?.set;
  }
}