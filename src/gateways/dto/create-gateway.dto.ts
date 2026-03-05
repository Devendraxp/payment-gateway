
export class CreateGatewayDto {
    name: string;
    display_name: string;
    is_active: boolean;
    success_rate: number;
    base_latency_ms: number;
    supported_methods: string[];
    method_affinity: Record<string, number>;
    bank_affinity: Record<string, number>;
}
