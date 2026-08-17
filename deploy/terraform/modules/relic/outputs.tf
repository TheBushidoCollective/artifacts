output "service_run_url" {
  description = <<-EOT
    The host Cloud Run issued for the service.

    Named for what it is rather than for the origin, because the advertised
    origin is now the owned domain in front of the load balancer. The caller
    asserts this against its computed value.
  EOT
  value       = module.service.url
}

output "sandbox_url" {
  description = "The sandbox origin, a distinct registrable domain."
  value       = module.sandbox.url
}

output "bucket_name" {
  description = "Bucket holding relic ciphertext."
  value       = google_storage_bucket.relics.name
}

output "app_service_account" {
  description = "Identity both services run as."
  value       = google_service_account.app.email
}
