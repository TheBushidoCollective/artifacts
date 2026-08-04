output "service_url" {
  description = "The service origin."
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
