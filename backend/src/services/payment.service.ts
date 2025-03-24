import { AIAdvisorService } from "./ai-advisor.service";
import { PaymenApiService } from "./paymen.service";

export class PaymentService {
  private paymanApi: PaymenApiService;
  private aiAdvisor: AIAdvisorService;

  constructor() {
    this.paymanApi = new PaymenApiService();
    this.aiAdvisor = new AIAdvisorService();
  }
}
