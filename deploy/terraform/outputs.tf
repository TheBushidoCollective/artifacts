output "service_url" {
  description = "The service origin: the API and the PWA shell."
  value       = module.relic.service_url
}

output "sandbox_url" {
  description = <<-EOT
    The sandbox origin, where untrusted HTML renders.

    A distinct registrable domain from the service: *.run.app is on the Public
    Suffix List as a wildcard, so every Cloud Run service URL is its own
    eTLD+1. That satisfies the origin-isolation requirement for a test
    deployment without owned domains.
  EOT
  value       = module.relic.sandbox_url
}

output "bucket_name" {
  description = "Bucket holding relic ciphertext."
  value       = module.relic.bucket_name
}

output "app_service_account" {
  description = "Identity both Cloud Run services run as."
  value       = module.relic.app_service_account
}
