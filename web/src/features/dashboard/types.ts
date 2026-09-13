export interface SystemDetails {
  os: string;
  arch: string;
  cpu_count: number;
  total_memory_bytes: number;
  total_memory_human: string;
  hostname: string | null;
}

export interface GpuDeviceInfo {
  id: number;
  name: string;
  total_memory: number;
  total_memory_human: string;
  free_memory: number;
  free_memory_human: string;
  utilization: number | null;
  temperature: number | null;
}

export interface GpuInfoDetails {
  available: boolean;
  count: number;
  devices: GpuDeviceInfo[];
}

export interface RuntimeDetails {
  version: string;
  build_date: string;
  rust_version: string;
  uptime_secs: number;
}

export interface FeatureFlags {
  cuda_enabled: boolean;
  onnx_enabled: boolean;
  torch_enabled: boolean;
  audio_processing: boolean;
  image_security: boolean;
}

export interface SystemInfo {
  system: SystemDetails;
  gpu: GpuInfoDetails;
  runtime: RuntimeDetails;
  features: FeatureFlags;
}

export interface ComponentHealth {
  status: string;
  message: string | null;
  latency_ms: number;
}

export interface HealthCheck {
  status: string;
  version: string;
  timestamp: string;
  uptime_seconds: number;
  checks: Record<string, ComponentHealth>;
  active_requests?: number;
  total_requests?: number;
  avg_latency_ms?: number;
  error_rate?: number;
}
