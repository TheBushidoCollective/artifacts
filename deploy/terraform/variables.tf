variable "project_id" {
  description = "GCP project that hosts Relic."
  type        = string
  nullable    = false
}

variable "region" {
  description = "Cloud Run region for both origins."
  type        = string
  default     = "us-central1"
}

variable "run_url_infix" {
  description = <<-EOT
    The project-and-region infix in this project's Cloud Run hostnames.

    thebushido-co predates Cloud Run's deterministic
    `{service}-{project_number}` URLs and still issues the legacy
    `{service}-{infix}.a.run.app` form. Both origins have to be known before
    either service is created, because each needs the other's URL and the
    bucket needs the service's for CORS, so the value is supplied rather than
    read back.

    Find it with:
      gcloud run services list --project <id> --format='value(status.url)'

    A `check` block asserts the computed URLs match what Cloud Run actually
    issued, so a wrong value fails the apply instead of deploying a broken
    origin pair.
  EOT
  type        = string
  nullable    = false
}

variable "image" {
  description = <<-EOT
    Fully qualified container image, digest-pinned by CI.

    A tag would let the running revision drift from the commit that produced
    it, which makes "what is deployed" unanswerable during an incident.
  EOT
  type        = string
  nullable    = false
}

variable "relic_ttl_days" {
  description = <<-EOT
    Storage-side lifetime, in days.

    Must match the application TTL in docs/decisions.md. Lifecycle granularity
    is days rounded to the next UTC midnight, and config changes take up to 24
    hours to take effect, so this is storage hygiene layered under an
    application-layer refusal that is exact to the second.
  EOT
  type        = number
  default     = 7

  validation {
    condition     = var.relic_ttl_days >= 1
    error_message = "Anything under a day is inexpressible in lifecycle."
  }
}

variable "soft_delete_retention_days" {
  description = <<-EOT
    How long deleted objects remain recoverable.

    Deleted does not mean erased, and the published disclosure says so. Set
    explicitly because a change reaches only objects deleted after it takes
    effect, leaving a tail nobody can retroactively clear.
  EOT
  type        = number
  default     = 7
}

variable "kill_switch_engaged" {
  description = <<-EOT
    Refuses every mint and every publish when true.

    Stops new signed URLs being minted. It does nothing to URLs already
    minted: rotating the signing key is the only second-stage stop, and it is
    indiscriminate.
  EOT
  type        = bool
  default     = false
}

variable "operator_tokens" {
  description = "name:secret pairs for the operator delete surface."
  type        = string
  sensitive   = true
  default     = ""
}
