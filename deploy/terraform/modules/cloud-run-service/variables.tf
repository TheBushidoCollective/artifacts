variable "project_id" {
  description = "GCP project."
  type        = string
  nullable    = false
}

variable "region" {
  description = "Cloud Run region."
  type        = string
  nullable    = false
}

variable "name" {
  description = "Service name. Becomes the leading label of the run.app host."
  type        = string
  nullable    = false
}

variable "image" {
  description = "Digest-pinned container image."
  type        = string
  nullable    = false
}

variable "service_account_email" {
  description = "Identity the revision runs as."
  type        = string
  nullable    = false
}

variable "env" {
  description = "Environment variables for the container."
  type        = map(string)
  default     = {}
}

variable "secret_env" {
  description = "Environment variables sourced from Secret Manager, name to secret id."
  type        = map(string)
  default     = {}
}

variable "max_instances" {
  description = <<-EOT
    Instance ceiling.

    This is a cost control as much as a capacity one: egress is a kill-switch
    condition in the preconditions, and an unbounded fleet is an unbounded
    bill.
  EOT
  type        = number
  default     = 4
}

variable "cpu" {
  description = "CPU per instance."
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory per instance."
  type        = string
  default     = "512Mi"
}
