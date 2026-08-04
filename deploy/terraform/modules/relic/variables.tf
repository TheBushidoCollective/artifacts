variable "project_id" {
  description = "GCP project."
  type        = string
  nullable    = false
}

variable "region" {
  description = "Cloud Run region for both origins."
  type        = string
  nullable    = false
}

variable "image" {
  description = "Digest-pinned container image."
  type        = string
  nullable    = false
}

variable "bucket_name" {
  description = <<-EOT
    Bucket name, passed in rather than derived from the bucket resource.

    The services must not depend on the bucket, because the bucket depends on
    the services for its CORS origin. Passing the name breaks that cycle.
  EOT
  type        = string
  nullable    = false
}

variable "service_name" {
  description = "Cloud Run service name for the service origin."
  type        = string
  nullable    = false
}

variable "sandbox_name" {
  description = "Cloud Run service name for the sandbox origin."
  type        = string
  nullable    = false
}

variable "service_url" {
  description = "The service origin, computed by the caller and asserted there."
  type        = string
  nullable    = false
}

variable "sandbox_url" {
  description = "The sandbox origin, a distinct registrable domain."
  type        = string
  nullable    = false
}

variable "relic_ttl_days" {
  description = "Storage-side lifetime, in days."
  type        = number
  nullable    = false
}

variable "soft_delete_retention_days" {
  description = "How long deleted objects stay recoverable."
  type        = number
  nullable    = false
}

variable "kill_switch_engaged" {
  description = "Refuses every mint and every publish when true."
  type        = bool
  default     = false
}

variable "operator_tokens" {
  description = "name:secret pairs for the operator delete surface."
  type        = string
  sensitive   = true
  default     = ""
}
