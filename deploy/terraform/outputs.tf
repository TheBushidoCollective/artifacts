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

output "service_domain" {
  description = "Registrable domain delegated to the Relik service."
  value       = trimsuffix(google_dns_managed_zone.service.dns_name, ".")
}

output "service_name_servers" {
  description = "Authoritative nameservers to configure at the domain registrar."
  value       = google_dns_managed_zone.service.name_servers
}

output "service_ds_record" {
  description = "DNSSEC DS record to configure at the domain registrar after nameserver delegation."
  value       = data.google_dns_keys.service.key_signing_keys[0].ds_record
}

output "bucket_name" {
  description = "Bucket holding relic ciphertext."
  value       = module.relic.bucket_name
}

output "app_service_account" {
  description = "Identity both Cloud Run services run as."
  value       = module.relic.app_service_account
}
