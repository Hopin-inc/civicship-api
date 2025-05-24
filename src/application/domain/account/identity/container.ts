import { container } from "tsyringe";
import { IDIDIssuanceRequestRepository } from "./data/didIssuanceRequest/interface";
import DIDIssuanceRequestRepository from "./data/didIssuanceRequest/repository";

container.register<IDIDIssuanceRequestRepository>(
  "didIssuanceRequestRepository",
  {
    useClass: DIDIssuanceRequestRepository
  }
);
