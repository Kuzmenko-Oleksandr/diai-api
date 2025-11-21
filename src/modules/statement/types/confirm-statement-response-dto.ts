import type { Location } from "@/modules/location";
import type { CreateStatementResponseDto } from "./create-statement-response-dto";

export type ConfirmStatementResponseDto = CreateStatementResponseDto & { location: Location };
