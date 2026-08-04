locals {
  bucket_name = "${var.project_id}-relics"

  service_name = "relic"
  sandbox_name = "relic-sandbox"

  # Computed rather than read back from the resources, because every one of
  # these values is needed before the thing that owns it exists: the service
  # needs the sandbox's origin for its CSP and its iframe, the bucket needs
  # the service's origin for CORS, and the service needs its own for the
  # absolute URLs in its problem documents. The `check` block in
  # check.run_urls.tf is what keeps the computation honest.
  service_url = "https://${local.service_name}-${var.run_url_infix}.a.run.app"
  sandbox_url = "https://${local.sandbox_name}-${var.run_url_infix}.a.run.app"
}
